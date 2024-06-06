/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { LiveScoreDto } from './dto/live-score.dto';
import { ParticipantScoreDto, RoundDetailsDto } from './dto/round-details.dto';
import { CreateRoundDto } from './dto/create-round.dto';
import { LiveRoundDto } from './dto/live-round.dto';
import { ParticipantScore } from 'src/participant/dto/types/participant.types';
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


@Injectable()
export class ScoreService {
  constructor(private readonly prisma: PrismaService) {}
 async addScore(
  adminEmail: string,
  participantId: string,
  roundId: number,
  newScores: number[],
): Promise<void> {
  const participant = await this.prisma.participant.findUnique({
    where: { participant_id: participantId },
    include: {
      target: {
        select: {
          admins: {
            select: {
              admin: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!participant) {
    throw new NotFoundException('Participant not found');
  }

  const targetAdmins = participant.target?.admins.map(adminTarget => adminTarget.admin.email) || [];
  if (!targetAdmins.includes(adminEmail)) {
    throw new UnauthorizedException('Admin is not authorized to add scores for this participant');
  }

  const existingEntry = await this.prisma.participantToRound.findUnique({
    where: {
      participantId_roundId: {
        participantId,
        roundId,
      },
    },
  });

  let bodyCount = 0;
  let headCount = 0;

  newScores.forEach(score => {
    if (score === 1) {
      bodyCount++;
    } else if (score === 3) {
      headCount++;
    }
  });

  const validScores = bodyCount + headCount;
  const quadraCount = Math.floor(validScores / 4);
  const remainingScores = validScores % 4;
  const tripleCount = Math.floor(remainingScores / 3);
  const doubleCount = Math.floor((remainingScores % 3) / 2);

  const data = {
    participantId,
    roundId,
    score: newScores,
    bodyCount,
    headCount,
    doubleCount,
    tripleCount,
    quadraCount,
  };

  await this.prisma.$transaction(async (prisma) => {
    if (existingEntry) {
      await prisma.participantToRound.update({
        where: {
          id: existingEntry.id,
        },
        data,
      });
    } else {
      await prisma.participantToRound.create({
        data,
      });
    }
    await this.updateTotalScore(participantId);
  });
}
  async updateTotalScore(participantId: string): Promise<void> {
    const participantRounds = await this.prisma.participantToRound.findMany({
      where: { participantId },
    });

    const totalScore = participantRounds.reduce((total, round) => {
      const roundScoreSum = round.score.reduce((sum, score) => sum + score, 0);
      return total + roundScoreSum;
    }, 0);

    await this.prisma.participant.update({
      where: { participant_id: participantId },
      data: { totalScore },
    });
  }

  async getLiveScores(gender: string): Promise<LiveScoreDto[]> {
    const participants = await this.prisma.participantToRound.findMany({
      where: {
        participant: {
          gender,
        },
      },
      select: {
        participant: {
          select: {
            number_participant: true,
            name: true,
            club: true,
            totalScore: true,
          },
        },
        quadraCount: true,
        tripleCount: true,
        doubleCount: true,
        headCount: true,
        bodyCount: true,
      },
      orderBy: [
        { participant: { totalScore: 'desc' } },
        { quadraCount: 'desc' },
        { tripleCount: 'desc' },
        { headCount: 'desc' },
        { doubleCount: 'desc' },
        { bodyCount: 'desc' },
      ],
    });
  
    const uniqueParticipants = participants.reduce((acc, entry) => {
      if (!acc.some(p => p.participant.number_participant === entry.participant.number_participant)) {
        acc.push(entry);
      }
      return acc;
    }, []);
  
    return uniqueParticipants.slice(0, 6).map((entry) => ({
      number_participant: entry.participant.number_participant,
      name: entry.participant.name,
      club: entry.participant.club,
      totalScore: entry.participant.totalScore,
    }));
  }  
  
  async getLiveScoreCombined(): Promise<{male: LiveScoreDto[]; female: LiveScoreDto[];}> {
    const top6Male = await this.getLiveScores('Male');
    const top6Female = await this.getLiveScores('Female');
    return { male: top6Male, female: top6Female };
  }

  async createRound(createRoundDto: CreateRoundDto): Promise<any> {
    try {

      const createRound = await this.prisma.round.create({
        data: {
          ...createRoundDto,
        },
      });

      return createRound;
    } catch (error) {
      throw error;
    }
  }

  async getAllRound() {
    try {
      return await this.prisma.round.findMany({
        select: {
          id: true,
          name: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch data admin: ${error.message}`);
    }
  }

  async getRoundDetails(adminEmail: string, roundId: number): Promise<RoundDetailsDto> {
    const adminWithTargets = await this.prisma.admin.findUnique({
      where: { email: adminEmail },
      include: {
        targets: {
          select: {
            target: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!adminWithTargets) {
      throw new NotFoundException('Admin not found');
    }

    const targetNames = adminWithTargets.targets.map(target => target.target.name);

    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
      include: {
        participants: {
          include: {
            participant: {
              include: {
                target: true,
              }
            }
          }
        }
      }
    });

    if (!round) {
      throw new NotFoundException('Round not found');
    }

    const participants: ParticipantScoreDto[] = round.participants
      .filter(p => p.participant.target && targetNames.includes(p.participant.target.name))
      .map((p) => {
        const totalScore = p.score.reduce((sum, score) => sum + score, 0);
        return {
          participantId: p.participant.participant_id,
          name: p.participant.name,
          scores: p.score,
          targetName: p.participant.target.name,
          totalScore,
        };
      });

    if (participants.length === 0) {
      throw new UnauthorizedException('Admin is not authorized to access participants in this round');
    }

    return {
      roundId: round.id,
      roundName: round.name,
      participants,
    };
  }



  //new fucntion
  async getAllScore(gender: string): Promise<LiveRoundDto[]> {
    const participants = await this.prisma.participantToRound.findMany({
        where: {
            participant: {
                gender,
            },
        },
        select: {
            participant: {
                select: {
                    number_participant: true,
                    name: true,
                    club: true,
                    totalScore: true,
                },
            },
            quadraCount: true,
            tripleCount: true,
            doubleCount: true,
            headCount: true,
            bodyCount: true,
        },
        orderBy: [
            { participant: { totalScore: 'desc' } },
            { quadraCount: 'desc' },
            { tripleCount: 'desc' },
            { headCount: 'desc' },
            { doubleCount: 'desc' },
            { bodyCount: 'desc' },
        ],
    });

    // Aggregate scores for participants
    const participantScores = participants.reduce<Record<number, ParticipantScore>>((acc, entry) => {
        const { participant, quadraCount, tripleCount, doubleCount, headCount, bodyCount } = entry;
        const { number_participant, name, club, totalScore } = participant;

        if (!acc[number_participant]) {
            acc[number_participant] = {
                number_participant,
                name,
                club: club || '',
                totalScore,
                quadraCount: 0,
                tripleCount: 0,
                doubleCount: 0,
                headCount: 0,
                bodyCount: 0,
            };
        }

        acc[number_participant].quadraCount += quadraCount;
        acc[number_participant].tripleCount += tripleCount;
        acc[number_participant].doubleCount += doubleCount;
        acc[number_participant].headCount += headCount;
        acc[number_participant].bodyCount += bodyCount;

        return acc;
    }, {});

    // Convert the aggregated scores object to an array and sort it
    const sortedParticipants = Object.values(participantScores).sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (b.quadraCount !== a.quadraCount) return b.quadraCount - a.quadraCount;
        if (b.tripleCount !== a.tripleCount) return b.tripleCount - a.tripleCount;
        if (b.doubleCount !== a.doubleCount) return b.doubleCount - a.doubleCount;
        if (b.headCount !== a.headCount) return b.headCount - a.headCount;
        return b.bodyCount - a.bodyCount;
    });

    return sortedParticipants.map((entry) => ({
        number_participant: entry.number_participant,
        name: entry.name,
        club: entry.club,
        totalScore: entry.totalScore,
        quadraCount: entry.quadraCount,
        tripleCount: entry.tripleCount,
        doubleCount: entry.doubleCount,
        headCount: entry.headCount,
        bodyCount: entry.bodyCount,
    }));
  }

  async getLiveScoreAll(): Promise<{male: LiveRoundDto[]; female: LiveRoundDto[];}> {
    const top6Male = await this.getAllScore('Male');
    const top6Female = await this.getAllScore('Female');
    return { male: top6Male, female: top6Female };
  }

  async exportAllScoresToCSV(gender: string, filePath: string) {
    const scores = await this.getAllScore(gender);

    const csvWriter = createCsvWriter({
        path: filePath,
        header: [
            { id: 'number_participant', title: 'Number Participant' },
            { id: 'name', title: 'Name' },
            { id: 'club', title: 'Club' },
            { id: 'totalScore', title: 'Total Score' },
            { id: 'quadraCount', title: 'Sandang 4' },
            { id: 'tripleCount', title: 'Sandang 3' },
            { id: 'doubleCount', title: 'Sandang 2' },
            { id: 'headCount', title: 'Kepala' },
            { id: 'bodyCount', title: 'Badann' },
        ],
    });

    await csvWriter.writeRecords(scores);
    console.log('Data successfully exported to', filePath);
  }
} 

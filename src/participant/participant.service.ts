/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { parse } from 'csv-parse';
import { PrismaService } from 'nestjs-prisma';
import { CreateParticipantDto, UpdateParticipantDto } from './dto';
import { createReadStream } from 'fs';
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

interface CsvParticipant {
  nik: string;
  number_participant: number;
  club?: string;
  name: string;
  gender: string;
  phone: string;
  address: string;
  targetName: string;
}

@Injectable()
export class ParticipantsService {
  private readonly superAdminEmails: string[];
  constructor(private readonly prisma: PrismaService) {
    const superAdminEmailsEnv = process.env.SUPERADMIN_EMAILS;
    if (!superAdminEmailsEnv) {
      throw new Error('Superadmin emails are not defined in environment variables');
    }
    this.superAdminEmails = superAdminEmailsEnv.split(',').map(email => email.trim());
  }
  
  async createParticipant(createParticipantDto: CreateParticipantDto): Promise<any> {
    try {
      const existingParticipant = await this.prisma.participant.findFirst({
        where: {
          OR: [
            { nik: createParticipantDto.nik },
            { number_participant: createParticipantDto.number_participant },
          ],
        },
      });
  
      if (existingParticipant) {
        if (existingParticipant.nik === createParticipantDto.nik) {
          throw new ConflictException('NIK is already in use');
        } else if (existingParticipant.number_participant === createParticipantDto.number_participant) {
          throw new ConflictException('Number Participant is already in use');
        }
      }
  
      let target = null;
      if (createParticipantDto.targetName) {
        target = await this.prisma.target.upsert({
          where: { name: createParticipantDto.targetName },
          update: {},
          create: { name: createParticipantDto.targetName },
        });
      }
  
      const createParticipant = await this.prisma.participant.create({
        data: {
          ...createParticipantDto,
          targetName: target ? target.name : null,
        },
      });
  
      return createParticipant;
    } catch (error) {
      throw error;
    }
  }

  async getAllParticipant() {
    try {
      return await this.prisma.participant.findMany({
        select: {
          participant_id: true,
          number_participant: true,
          name: true,
          club: true,
          totalScore: true,
          rounds: {
            select: {
              round: {
                select: {
                  id: true,
                  name: true,
                },
              },
              score: true,
              bodyCount: true,
              headCount: true,
              doubleCount: true,
              tripleCount: true,
              quadraCount: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch participants: ${error.message}`);
    }
  }
  
  async getParticipantById(id: string): Promise<any> {
    try {
      const participant = await this.prisma.participant.findUnique({
        where: { participant_id: id },
        select: {
          participant_id: true,
          number_participant: true,
          nik: true,
          name: true,
          club: true,
          phone: true,
          totalScore: true,
          target: {
            select: {
              name: true,
            },
          },
          rounds: {
            select: {
              round: {
                select: {
                  id: true,
                  name: true,
                },
              },
              score: true,
              bodyCount: true,
              headCount: true,
              doubleCount: true,
              tripleCount: true,
              quadraCount: true,
            },
          },
        },
      });

      if (!participant) {
        throw new NotFoundException('Participant not found');
      }

      return participant;
    } catch (error) {
      throw error;
    }
  }

  async getParticipantsByAdminTarget(adminEmail: string): Promise<any[]> {
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
  
    if (adminWithTargets.targets.length === 0) {
      return [];
    }
  
    const targetNames = adminWithTargets.targets.map(target => target.target.name);
    const participants = await this.prisma.participant.findMany({
      where: {
        targetName: { in: targetNames }
      },
      select: {
        participant_id: true,
        number_participant: true,
        name: true,
        club: true,
        totalScore: true,
        target: {
          select: {
            name: true
          }
        }
      }
    });
  
    return participants;
  }
  
  async updateParticipant(adminEmail: string, id: string, updateParticipantDto: UpdateParticipantDto): Promise<any> {
    try {
      const participant = await this.prisma.participant.findUnique({
        where: { participant_id: id },
        include: { target: true }
      });
  
      if (!participant) {
        throw new NotFoundException('Participant not found');
      }

      const admin = await this.prisma.admin.findUnique({
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
  
      if (!admin || !admin.targets.some(target => target.target.name === participant.target?.name)) {
        throw new UnauthorizedException('Admin is not authorized to update this participant');
      }

      if (updateParticipantDto.nik) {
        const existingParticipant = await this.prisma.participant.findUnique({
          where: { nik: updateParticipantDto.nik },
        });
  
        if (existingParticipant && existingParticipant.participant_id !== id) {
          throw new ConflictException('NIK is already in use');
        }
      }

      const updateData: any = {
        nik: updateParticipantDto.nik,
        name: updateParticipantDto.name,
        gender: updateParticipantDto.gender,
        club: updateParticipantDto.club,
        phone: updateParticipantDto.phone,
        address: updateParticipantDto.address,
      };


      if (updateParticipantDto.target) {
        const target = await this.prisma.target.upsert({
          where: { name: updateParticipantDto.target },
          update: {},
          create: { name: updateParticipantDto.target },
        });
        updateData.targetName = target.name;
      }

      const updatedParticipant = await this.prisma.participant.update({
        where: { participant_id: id },
        data: updateData,
        select: {
          participant_id: true,
          number_participant: true,
          nik: true,
          name: true,
          gender: true,
          club: true,
          phone: true,
          address: true,
          target: {
            select: {
              name: true,
            },
          },
        },
      });

      // Update round scores if provided
      if (updateParticipantDto.roundScores && updateParticipantDto.roundScores.length > 0) {
        for (const roundScore of updateParticipantDto.roundScores) {
          const existingEntry = await this.prisma.participantToRound.findUnique({
            where: {
              participantId_roundId: {
                participantId: id,
                roundId: roundScore.roundId,
              },
            },
          });
  
          if (existingEntry) {
            await this.prisma.participantToRound.update({
              where: { id: existingEntry.id },
              data: { score: roundScore.scores },
            });
          } else {
            await this.prisma.participantToRound.create({
              data: {
                participantId: id,
                roundId: roundScore.roundId,
                score: roundScore.scores,
              },
            });
          }
        }
  
        await this.updateTotalScore(id);
      }
  
      return updatedParticipant;
    } catch (error) {
      throw error;
    }
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

  async deleteParticipant(id: string): Promise<boolean> {
    try {
      const participant = await this.prisma.participant.findUnique({
        where: { participant_id: id },
        include: { rounds: true },
      });
  
      if (!participant) {
        throw new NotFoundException('Participant not found');
      }
  
      // Delete related ParticipantToRound entries
      await this.prisma.participantToRound.deleteMany({
        where: { participantId: id },
      });
  
      // Finally, delete the participant
      await this.prisma.participant.delete({
        where: { participant_id: id },
      });
  
      return true;
    } catch (error) {
      throw error;
    }
  }

  async importParticipantsFromCsv(filePath: string): Promise<void> {
    const participants: CsvParticipant[] = [];

    return new Promise((resolve, reject) => {
      createReadStream(filePath)
        .pipe(parse({ columns: headers => headers.map(h => h.toLowerCase()) }))
        .on('data', (row) => {
          if (row.nik) {
            participants.push({
              nik: row.nik,
              number_participant: parseInt(row.number_participant, 10),
              club: row.club,
              name: row.name,
              gender: row.gender,
              phone: row.phone,
              address: row.address,
              targetName: row.target_name
            });
          }
        })
        .on('end', async () => {
          try {
            for (const participant of participants) {
              if (!participant.nik) {
                continue;
              }

              const existingParticipant = await this.prisma.participant.findUnique({
                where: { nik: participant.nik },
              });

              if (existingParticipant) {
                throw new ConflictException(`NIK ${participant.nik} is already in use`);
              }

              const target = await this.prisma.target.upsert({
                where: { name: participant.targetName },
                update: {},
                create: {
                  name: participant.targetName
                },
                include: { admins: true }
              });

              const isNewTarget = target.admins.length === 0;
              if (isNewTarget) {
                for (const email of this.superAdminEmails) {
                  await this.prisma.adminToTarget.create({
                    data: {
                      adminEmail: email,
                      targetName: target.name,
                    },
                  });
                }
              }

              await this.prisma.participant.create({
                data: {
                  ...participant,
                  targetName: target.name
                },
              });
            }
            resolve();
          } catch (error) {
            reject(new BadRequestException('Failed to import participants: ' + error.message));
          }
        })
        .on('error', (error) => {
          reject(new BadRequestException('Error reading CSV file: ' + error.message));
        });
    });
  }
  
  async exportParticipantsToCSV(filePath: string) {
    try {
        const participants = await this.getAllParticipant();

        const formattedData = participants.map(participant => {
            const totalScore = participant.totalScore;
            const scores = participant.rounds.reduce((acc, round) => {
                acc.bodyCount += round.bodyCount;
                acc.headCount += round.headCount;
                acc.doubleCount += round.doubleCount;
                acc.tripleCount += round.tripleCount;
                acc.quadraCount += round.quadraCount;
                return acc;
            }, { bodyCount: 0, headCount: 0, doubleCount: 0, tripleCount: 0, quadraCount: 0 });

            return {
                name: participant.name,
                club: participant.club || '',
                number_participant: participant.number_participant,
                totalScore: totalScore,
                bodyCount: scores.bodyCount,
                headCount: scores.headCount,
                doubleCount: scores.doubleCount,
                tripleCount: scores.tripleCount,
                quadraCount: scores.quadraCount,
            };
        });

        const csvWriter = createCsvWriter({
            path: filePath,
            header: [
                { id: 'name', title: 'Name' },
                { id: 'club', title: 'Club' },
                { id: 'number_participant', title: 'Number Participant' },
                { id: 'bodyCount', title: 'Badan' },
                { id: 'headCount', title: 'Kepala' },
                { id: 'doubleCount', title: 'Sandang 2' },
                { id: 'tripleCount', title: 'Sandang 3' },
                { id: 'quadraCount', title: 'Sandang 4' },
                { id: 'totalScore', title: 'Total Score' },
            ]
        });

        await csvWriter.writeRecords(formattedData);
        console.log('Data successfully exported to', filePath);

    } catch (error) {
        console.error('Error exporting data:', error);
    }
}
}


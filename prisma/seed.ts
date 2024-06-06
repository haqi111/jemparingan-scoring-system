/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admin1 = await prisma.admin.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: "$2a$12$et0KDaEo/S1mXOMrKayiFOi2NFl5I2oDlPYfhEP9Fn6Uyz0nraOce",
    },
  });
  console.log({ admin1 });

  const admin2 = await prisma.admin.create({
    data: {
      name: 'Super User',
      email: 'superuser@example.com',
      password: "$2a$12$et0KDaEo/S1mXOMrKayiFOi2NFl5I2oDlPYfhEP9Fn6Uyz0nraOce",
    },
  });
  console.log({ admin2 });

  
  const rounds = Array.from({ length: 20 }, (_, i) => `Rambahan ${i + 1}`);
  for (const roundName of rounds) {
    await prisma.round.create({
      data: {
        name: roundName,
      },
    });
  }

  // const round1 = await prisma.round.create({
  //   data: {
  //     name: "Round 1",
  //   },
  // });

  // const round2 = await prisma.round.create({
  //   data: {
  //     name: "Round 2",
  //   },
  // });

  // const round3 = await prisma.round.create({
  //   data: {
  //     name: "Round 3"
  //   },
  // });

  // console.log("20 rounds seeded successfully!");

  // const target1 = await prisma.target.create({
  //   data: {
  //     name: 'Target 1',
  //   },
  // });

  // const target2 = await prisma.target.create({
  //   data: {
  //     name: 'Target 2',
  //   },
  // });

  // const target3 = await prisma.target.create({
  //   data: {
  //     name: 'Target 3',
  //   },
  // });

  // await prisma.adminToTarget.createMany({
  //   data: [
  //     { adminEmail: admin1.email, targetName: target1.name },
  //     { adminEmail: admin1.email, targetName: target2.name },
  //     { adminEmail: admin1.email, targetName: target3.name },
  //     { adminEmail: admin2.email, targetName: target2.name },

  //   ],
  // });
  
  // console.log('Targets added to admins');
  
  // const participant1 = await prisma.participant.create({
  //   data: {
  //     nik: "123456789",
  //     number_participant: 1,
  //     club: "Casino Royale",
  //     name: "John Doe",
  //     gender: "Male",
  //     phone: "+123456789",
  //     address: "123 Main St",
  //     totalScore: 0,
  //     targetName: target1.name
  //   },
  // });

  // const participant2 = await prisma.participant.create({
  //   data: {
  //     nik: "123332222",
  //     number_participant: 2,
  //     club: "Casino Royale",
  //     name: "John Cena",
  //     gender: "Male",
  //     phone: "+123456789",
  //     address: "123 Main St",
  //     totalScore: 0,
  //     targetName: target1.name
  //   },
  // });

  // const participant3 = await prisma.participant.create({
  //   data: {
  //     nik: "987654321",
  //     number_participant: 3,
  //     club: "El Familia",
  //     name: "Jane Smith",
  //     gender: "Female",
  //     phone: "+987654321",
  //     address: "456 Elm St",
  //     totalScore: 0,
  //     targetName: target2.name
  //   },
  // });

  // const participant4 = await prisma.participant.create({
  //   data: {
  //     nik: "654987321",
  //     number_participant: 4,
  //     club: "El Familia",
  //     name: "Jane Liu",
  //     gender: "Female",
  //     phone: "+987654321",
  //     address: "456 Elm St",
  //     totalScore: 0,
  //     targetName: target2.name
  //   },
  // });
  

  // await prisma.participantToRound.createMany({
  //   data: [
  //     { roundId: round1.id, participantId: participant1.participant_id, score: [3,3,3] },
  //     { roundId: round2.id, participantId: participant1.participant_id, score: [1,1] },
  //     { roundId: round3.id, participantId: participant1.participant_id, score: [1,3,1] },
  //     { roundId: round1.id, participantId: participant2.participant_id, score: [1] },
  //     { roundId: round2.id, participantId: participant2.participant_id, score: [3,1] },
  //     { roundId: round3.id, participantId: participant2.participant_id, score: [1,3,1] },
  //     { roundId: round1.id, participantId: participant3.participant_id, score: [3,1] },
  //     { roundId: round2.id, participantId: participant3.participant_id, score: [3,3,1] },
  //     { roundId: round3.id, participantId: participant3.participant_id, score: [1,3,1] },
  //     { roundId: round1.id, participantId: participant4.participant_id, score: [1,1] },
  //     { roundId: round2.id, participantId: participant4.participant_id, score: [3,1,1] },
  //     { roundId: round3.id, participantId: participant4.participant_id, score: [1,1,1] },
  //   ],
  // });


  // async function calculateTotalScore(participantId: string) {
  //   const participantRounds = await prisma.participantToRound.findMany({
  //     where: { participantId },
  //   });
  // const totalScore = participantRounds.reduce((total, round) => {
  //   const roundScoreSum = round.score.reduce((sum, score) => sum + score, 0);
  //     return total + roundScoreSum;
  //   }, 0);
  //   return totalScore;
  // }
  
  // const participant1TotalScore = await calculateTotalScore(participant1.participant_id);
  //   await prisma.participant.update({
  //     where: { participant_id: participant1.participant_id },
  //     data: { totalScore: participant1TotalScore },
  //   });

  // const participant2TotalScore = await calculateTotalScore(participant2.participant_id);
  //   await prisma.participant.update({
  //     where: { participant_id: participant2.participant_id },
  //     data: { totalScore: participant2TotalScore },
  //   });
  //   const participant3TotalScore = await calculateTotalScore(participant3.participant_id);
  //   await prisma.participant.update({
  //     where: { participant_id: participant3.participant_id },
  //     data: { totalScore: participant3TotalScore },
  //   });

  //   const participant4TotalScore = await calculateTotalScore(participant3.participant_id);
  //   await prisma.participant.update({
  //     where: { participant_id: participant4.participant_id },
  //     data: { totalScore: participant4TotalScore },
  //   });

  console.log("Seed data created successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
});

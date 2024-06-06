-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashRt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "participant_id" TEXT NOT NULL,
    "number_participant" INTEGER NOT NULL,
    "nik" TEXT NOT NULL,
    "club" TEXT,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("participant_id")
);

-- CreateTable
CREATE TABLE "ParticipantToRound" (
    "id" SERIAL NOT NULL,
    "roundId" INTEGER NOT NULL,
    "participantId" TEXT NOT NULL,
    "score" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "bodyCount" INTEGER NOT NULL DEFAULT 0,
    "headCount" INTEGER NOT NULL DEFAULT 0,
    "doubleCount" INTEGER NOT NULL DEFAULT 0,
    "tripleCount" INTEGER NOT NULL DEFAULT 0,
    "quadraCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ParticipantToRound_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_nik_key" ON "Participant"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantToRound_participantId_roundId_key" ON "ParticipantToRound"("participantId", "roundId");

-- AddForeignKey
ALTER TABLE "ParticipantToRound" ADD CONSTRAINT "ParticipantToRound_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantToRound" ADD CONSTRAINT "ParticipantToRound_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("participant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

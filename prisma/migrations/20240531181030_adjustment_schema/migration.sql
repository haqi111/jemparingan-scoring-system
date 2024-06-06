/*
  Warnings:

  - A unique constraint covering the columns `[number_participant]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Participant_number_participant_key" ON "Participant"("number_participant");

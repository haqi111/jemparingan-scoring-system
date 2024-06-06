/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "targetName" TEXT;

-- CreateTable
CREATE TABLE "Target" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "adminEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Target_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Target_name_key" ON "Target"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Target" ADD CONSTRAINT "Target_adminEmail_fkey" FOREIGN KEY ("adminEmail") REFERENCES "Admin"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_targetName_fkey" FOREIGN KEY ("targetName") REFERENCES "Target"("name") ON DELETE SET NULL ON UPDATE CASCADE;

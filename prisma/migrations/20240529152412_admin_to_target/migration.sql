/*
  Warnings:

  - You are about to drop the column `adminEmail` on the `Target` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Target" DROP CONSTRAINT "Target_adminEmail_fkey";

-- AlterTable
ALTER TABLE "Target" DROP COLUMN "adminEmail";

-- CreateTable
CREATE TABLE "AdminToTarget" (
    "adminEmail" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,

    CONSTRAINT "AdminToTarget_pkey" PRIMARY KEY ("adminEmail","targetName")
);

-- AddForeignKey
ALTER TABLE "AdminToTarget" ADD CONSTRAINT "AdminToTarget_adminEmail_fkey" FOREIGN KEY ("adminEmail") REFERENCES "Admin"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminToTarget" ADD CONSTRAINT "AdminToTarget_targetName_fkey" FOREIGN KEY ("targetName") REFERENCES "Target"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

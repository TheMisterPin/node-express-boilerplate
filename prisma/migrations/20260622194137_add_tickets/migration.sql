-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TECHNICIAN';

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'NEW',
    "submitterId" TEXT NOT NULL,
    "technicianId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ticket_submitterId_idx" ON "Ticket"("submitterId");

-- CreateIndex
CREATE INDEX "Ticket_technicianId_idx" ON "Ticket"("technicianId");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

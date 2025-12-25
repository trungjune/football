-- CreateTable
CREATE TABLE "name_mappings" (
    "id" TEXT NOT NULL,
    "ocrName" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "name_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "name_mappings_ocrName_memberId_key" ON "name_mappings"("ocrName", "memberId");

-- AddForeignKey
ALTER TABLE "name_mappings" ADD CONSTRAINT "name_mappings_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

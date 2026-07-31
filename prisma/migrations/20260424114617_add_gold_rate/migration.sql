-- CreateTable
CREATE TABLE "GoldRate" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "rate" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoldRate_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "gstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "diamondClarity" TEXT,
ADD COLUMN     "diamondColor" TEXT,
ADD COLUMN     "diamondWeight" DOUBLE PRECISION,
ADD COLUMN     "metalColor" TEXT,
ADD COLUMN     "metalType" TEXT,
ADD COLUMN     "purity" TEXT;

/*
  Warnings:

  - You are about to drop the column `locationX` on the `WazeAlerts` table. All the data in the column will be lost.
  - You are about to drop the column `locationY` on the `WazeAlerts` table. All the data in the column will be lost.
  - Added the required column `lat` to the `WazeAlerts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lon` to the `WazeAlerts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WazeAlerts" DROP COLUMN "locationX",
DROP COLUMN "locationY",
ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lon" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "Box" (
    "id" UUID NOT NULL,
    "centerLat" DOUBLE PRECISION NOT NULL,
    "centerLon" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Box_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeatmapData" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "subType" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "count" SMALLINT NOT NULL,
    "boxId" UUID NOT NULL,

    CONSTRAINT "HeatmapData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Box_centerLat_centerLon_key" ON "Box"("centerLat", "centerLon");

-- CreateIndex
CREATE UNIQUE INDEX "HeatmapData_type_subType_date_boxId_key" ON "HeatmapData"("type", "subType", "date", "boxId");

-- AddForeignKey
ALTER TABLE "HeatmapData" ADD CONSTRAINT "HeatmapData_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

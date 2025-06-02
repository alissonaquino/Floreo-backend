/*
  Warnings:

  - You are about to drop the column `luminosity_1` on the `sensor_data` table. All the data in the column will be lost.
  - You are about to drop the column `luminosity_2` on the `sensor_data` table. All the data in the column will be lost.
  - You are about to drop the column `luminosity_3` on the `sensor_data` table. All the data in the column will be lost.
  - You are about to drop the column `luminosity_4` on the `sensor_data` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sensor_data" DROP COLUMN "luminosity_1",
DROP COLUMN "luminosity_2",
DROP COLUMN "luminosity_3",
DROP COLUMN "luminosity_4",
ADD COLUMN     "luminosity" DECIMAL(65,30);

/*
  Warnings:

  - You are about to drop the column `sensor_type` on the `sensor_data` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `sensor_data` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sensor_data" DROP COLUMN "sensor_type",
DROP COLUMN "value",
ADD COLUMN     "humidity_air" DECIMAL(65,30),
ADD COLUMN     "humidity_soil" DECIMAL(65,30),
ADD COLUMN     "luminosity_1" DECIMAL(65,30),
ADD COLUMN     "luminosity_2" DECIMAL(65,30),
ADD COLUMN     "luminosity_3" DECIMAL(65,30),
ADD COLUMN     "luminosity_4" DECIMAL(65,30),
ADD COLUMN     "relay_state" BOOLEAN,
ADD COLUMN     "temperature" DECIMAL(65,30);

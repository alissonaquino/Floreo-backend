/*
  Warnings:

  - The values [LUMINOSITY_1,LUMINOSITY_2,LUMINOSITY_3,LUMINOSITY_4] on the enum `SensorType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SensorType_new" AS ENUM ('HUMIDITY_AIR', 'HUMIDITY_SOIL', 'TEMPERATURE', 'LUMINOSITY', 'RELAY_STATE');
ALTER TABLE "sensor_data" ALTER COLUMN "sensor_type" TYPE "SensorType_new" USING ("sensor_type"::text::"SensorType_new");
ALTER TABLE "plant_recommendations" ALTER COLUMN "based_on" TYPE "SensorType_new" USING ("based_on"::text::"SensorType_new");
ALTER TYPE "SensorType" RENAME TO "SensorType_old";
ALTER TYPE "SensorType_new" RENAME TO "SensorType";
DROP TYPE "SensorType_old";
COMMIT;

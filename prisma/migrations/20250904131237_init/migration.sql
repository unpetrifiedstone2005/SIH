-- CreateEnum
CREATE TYPE "public"."risk_level_enum" AS ENUM ('Low', 'Moderate', 'High', 'Critical');

-- CreateTable
CREATE TABLE "public"."monitored_locations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitored_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sensor_readings" (
    "id" BIGSERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "location_id" INTEGER NOT NULL,
    "rainfall" DOUBLE PRECISION,
    "depth_to_groundwater" DOUBLE PRECISION,
    "pore_water_pressure" DOUBLE PRECISION,
    "surface_runoff" DOUBLE PRECISION,
    "unit_weight" DOUBLE PRECISION,
    "cohesion" DOUBLE PRECISION,
    "internal_friction_angle" DOUBLE PRECISION,
    "slope_angle" DOUBLE PRECISION,
    "slope_height" DOUBLE PRECISION,
    "pore_water_pressure_ratio" DOUBLE PRECISION,
    "bench_height" DOUBLE PRECISION,
    "bench_width" DOUBLE PRECISION,
    "inter_ramp_angle" DOUBLE PRECISION,

    CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."predictions" (
    "id" BIGSERIAL NOT NULL,
    "prediction_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "risk_score" DOUBLE PRECISION NOT NULL,
    "risk_level" "public"."risk_level_enum" NOT NULL,
    "location_id" INTEGER NOT NULL,
    "source_reading_id" BIGINT,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alerts" (
    "id" SERIAL NOT NULL,
    "alert_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "prediction_id" BIGINT NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monitored_locations_name_key" ON "public"."monitored_locations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "predictions_source_reading_id_key" ON "public"."predictions"("source_reading_id");

-- AddForeignKey
ALTER TABLE "public"."sensor_readings" ADD CONSTRAINT "sensor_readings_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."monitored_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."predictions" ADD CONSTRAINT "predictions_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."monitored_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."predictions" ADD CONSTRAINT "predictions_source_reading_id_fkey" FOREIGN KEY ("source_reading_id") REFERENCES "public"."sensor_readings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alerts" ADD CONSTRAINT "alerts_prediction_id_fkey" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

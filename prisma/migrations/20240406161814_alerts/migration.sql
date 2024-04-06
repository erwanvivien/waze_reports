-- CreateTable
CREATE TABLE "WazeAlerts" (
    "uuid" UUID NOT NULL,
    "pubMillis" BIGINT NOT NULL,
    "reportMillis" BIGINT,
    "locationX" DOUBLE PRECISION NOT NULL,
    "locationY" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "country" TEXT,

    CONSTRAINT "WazeAlerts_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE INDEX "WazeAlerts_pubMillis_idx" ON "WazeAlerts"("pubMillis");

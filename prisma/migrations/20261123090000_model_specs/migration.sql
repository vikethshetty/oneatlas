ALTER TABLE "Model"
  ADD COLUMN "modelType" TEXT NOT NULL DEFAULT 'Language model',
  ADD COLUMN "modalities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "capabilities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "contextTokens" INTEGER,
  ADD COLUMN "inputPrice" DOUBLE PRECISION,
  ADD COLUMN "outputPrice" DOUBLE PRECISION,
  ADD COLUMN "releasedAt" TIMESTAMP(3),
  ADD COLUMN "openWeights" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Model_modelType_idx" ON "Model"("modelType");
CREATE INDEX "Model_releasedAt_idx" ON "Model"("releasedAt");

CREATE TABLE "BenchmarkScore" (
  "id" TEXT NOT NULL,
  "modelId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "source" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BenchmarkScore_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BenchmarkScore_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "BenchmarkScore_modelId_name_key" ON "BenchmarkScore"("modelId", "name");
CREATE INDEX "BenchmarkScore_name_score_idx" ON "BenchmarkScore"("name", "score");

ALTER TABLE "Model" ADD COLUMN "rankingScore" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "Model_rankingScore_idx" ON "Model"("rankingScore");

-- CreateTable
CREATE TABLE "Checklist" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "position" INTEGER NOT NULL,

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Checklist_card_id_position_idx" ON "Checklist"("card_id", "position");

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

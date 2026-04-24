-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "parent_card_id" TEXT;

-- CreateTable
CREATE TABLE "UserFunction" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "subdepartment" "Subdepartment",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFunction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFunction_project_id_idx" ON "UserFunction"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserFunction_user_id_project_id_key" ON "UserFunction"("user_id", "project_id");

-- CreateIndex
CREATE INDEX "Card_parent_card_id_idx" ON "Card"("parent_card_id");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_parent_card_id_fkey" FOREIGN KEY ("parent_card_id") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFunction" ADD CONSTRAINT "UserFunction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFunction" ADD CONSTRAINT "UserFunction_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

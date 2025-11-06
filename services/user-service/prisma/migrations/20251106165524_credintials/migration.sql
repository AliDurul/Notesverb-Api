/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `user_profiles` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `user_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_profiles_user_id_key";

-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "avatar_url",
DROP COLUMN "created_at",
DROP COLUMN "first_name",
DROP COLUMN "last_name",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

/*
  Warnings:

  - A unique constraint covering the columns `[name,artist,review_date]` on the table `Album` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Album_name_artist_review_date_key" ON "Album"("name", "artist", "review_date");

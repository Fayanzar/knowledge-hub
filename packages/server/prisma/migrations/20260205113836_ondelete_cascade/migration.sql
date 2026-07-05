-- DropForeignKey
ALTER TABLE `resource` DROP FOREIGN KEY `Resource_userId_fkey`;

-- DropForeignKey
ALTER TABLE `tag` DROP FOREIGN KEY `Tag_userId_fkey`;

-- DropForeignKey
ALTER TABLE `tagsonresources` DROP FOREIGN KEY `TagsOnResources_resourceId_fkey`;

-- DropForeignKey
ALTER TABLE `tagsonresources` DROP FOREIGN KEY `TagsOnResources_tagId_fkey`;

-- DropIndex
DROP INDEX `TagsOnResources_tagId_fkey` ON `tagsonresources`;

-- AddForeignKey
ALTER TABLE `Resource` ADD CONSTRAINT `Resource_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TagsOnResources` ADD CONSTRAINT `TagsOnResources_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TagsOnResources` ADD CONSTRAINT `TagsOnResources_resourceId_fkey` FOREIGN KEY (`resourceId`) REFERENCES `Resource`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

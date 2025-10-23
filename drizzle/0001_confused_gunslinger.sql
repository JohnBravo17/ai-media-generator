CREATE TABLE `credits` (
	`userId` varchar(64) NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credits_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
CREATE TABLE `generations` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`provider` enum('runware','replicate') NOT NULL,
	`type` enum('text_to_image','image_to_image','text_to_video','image_to_video','inpainting','outpainting','upscale','background_removal') NOT NULL,
	`prompt` text,
	`model` varchar(255),
	`parameters` text,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`resultUrl` text,
	`errorMessage` text,
	`apiCost` int NOT NULL,
	`userCost` int NOT NULL,
	`processingTime` int,
	`createdAt` timestamp DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `generations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`type` enum('purchase','usage','refund') NOT NULL,
	`amount` int NOT NULL,
	`balanceAfter` int NOT NULL,
	`description` text,
	`paymentMethod` varchar(64),
	`paymentId` varchar(255),
	`paymentStatus` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `credits` ADD CONSTRAINT `credits_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generations` ADD CONSTRAINT `generations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
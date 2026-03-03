CREATE TABLE `activity_feed` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`event_id` bigint unsigned NOT NULL,
	`report_id` bigint unsigned,
	`type` varchar(32) NOT NULL DEFAULT 'report_published',
	`message` text NOT NULL,
	`image_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_feed_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_links` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`event_id` bigint unsigned NOT NULL,
	`provider` varchar(32) NOT NULL,
	`url` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contributions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`event_id` bigint unsigned NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` enum('uang','logistik','konsumsi') NOT NULL,
	`amount_money` int,
	`item_name` varchar(120),
	`item_qty` int,
	`note` text,
	`status` varchar(32) NOT NULL DEFAULT 'pledged',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_reports` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`event_id` bigint unsigned NOT NULL,
	`summary` text NOT NULL,
	`photos` json NOT NULL DEFAULT (json_array()),
	`created_by_user_id` varchar(36) NOT NULL,
	`published_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`mosque_id` bigint unsigned NOT NULL,
	`partner_user_id` varchar(36) NOT NULL,
	`title` varchar(191) NOT NULL,
	`description` text,
	`status` enum('pending_verification','open_recruitment','active','done','cancelled') NOT NULL DEFAULT 'pending_verification',
	`scheduled_at` datetime NOT NULL,
	`volunteer_quota` int NOT NULL DEFAULT 20,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mosques` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`address` text NOT NULL,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`condition_photo_url` text,
	`manager_name` varchar(120) NOT NULL,
	`manager_contact` varchar(64) NOT NULL,
	`created_by_user_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mosques_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `otp_codes` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`email` varchar(191) NOT NULL,
	`code_hash` varchar(128) NOT NULL,
	`expires_at` datetime NOT NULL,
	`used_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otp_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` varchar(36) NOT NULL,
	`role` enum('volunteer','donatur','partner','admin') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_roles_user_id_role_pk` PRIMARY KEY(`user_id`,`role`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(191) NOT NULL,
	`name` varchar(120),
	`region` varchar(120),
	`primary_role` enum('volunteer','donatur','partner','admin') NOT NULL DEFAULT 'volunteer',
	`active_role` enum('volunteer','donatur','partner','admin') NOT NULL DEFAULT 'volunteer',
	`is_onboarded` int NOT NULL DEFAULT 0,
	`xp` int NOT NULL DEFAULT 0,
	`badge_level` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_uq` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `volunteers_on_event` (
	`event_id` bigint unsigned NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'joined',
	`joined_at` timestamp NOT NULL DEFAULT (now()),
	`xp_awarded` int NOT NULL DEFAULT 0,
	CONSTRAINT `volunteers_on_event_event_id_user_id_pk` PRIMARY KEY(`event_id`,`user_id`)
);
--> statement-breakpoint
ALTER TABLE `activity_feed` ADD CONSTRAINT `activity_feed_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_feed` ADD CONSTRAINT `activity_feed_report_id_event_reports_id_fk` FOREIGN KEY (`report_id`) REFERENCES `event_reports`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_links` ADD CONSTRAINT `chat_links_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contributions` ADD CONSTRAINT `contributions_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contributions` ADD CONSTRAINT `contributions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_reports` ADD CONSTRAINT `event_reports_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_reports` ADD CONSTRAINT `event_reports_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_mosque_id_mosques_id_fk` FOREIGN KEY (`mosque_id`) REFERENCES `mosques`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_partner_user_id_users_id_fk` FOREIGN KEY (`partner_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mosques` ADD CONSTRAINT `mosques_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `volunteers_on_event` ADD CONSTRAINT `volunteers_on_event_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `volunteers_on_event` ADD CONSTRAINT `volunteers_on_event_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `contrib_event_idx` ON `contributions` (`event_id`);--> statement-breakpoint
CREATE INDEX `contrib_user_idx` ON `contributions` (`user_id`);--> statement-breakpoint
CREATE INDEX `events_status_idx` ON `events` (`status`);--> statement-breakpoint
CREATE INDEX `events_schedule_idx` ON `events` (`scheduled_at`);--> statement-breakpoint
CREATE INDEX `mosques_location_idx` ON `mosques` (`latitude`,`longitude`);--> statement-breakpoint
CREATE INDEX `otp_email_idx` ON `otp_codes` (`email`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `users_active_role_idx` ON `users` (`active_role`);
import { relations, sql } from "drizzle-orm";
import {
  bigint,
  datetime,
  double,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const roleEnum = mysqlEnum("role", ["volunteer", "donatur", "partner", "admin"]);
export const eventStatusEnum = mysqlEnum("event_status", [
  "pending_verification",
  "open_recruitment",
  "active",
  "done",
  "cancelled",
]);
export const contributionTypeEnum = mysqlEnum("contribution_type", ["uang", "logistik", "konsumsi"]);

export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    email: varchar("email", { length: 191 }).notNull(),
    name: varchar("name", { length: 120 }),
    region: varchar("region", { length: 120 }),
    primaryRole: roleEnum("primary_role").notNull().default("volunteer"),
    activeRole: roleEnum("active_role").notNull().default("volunteer"),
    isOnboarded: int("is_onboarded").notNull().default(0),
    xp: int("xp").notNull().default(0),
    badgeLevel: int("badge_level").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    emailUq: uniqueIndex("users_email_uq").on(table.email),
    roleIdx: index("users_active_role_idx").on(table.activeRole),
  }),
);

export const userRoles = mysqlTable(
  "user_roles",
  {
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.role] }),
  }),
);

export const otpCodes = mysqlTable(
  "otp_codes",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    email: varchar("email", { length: 191 }).notNull(),
    codeHash: varchar("code_hash", { length: 128 }).notNull(),
    expiresAt: datetime("expires_at", { mode: "date" }).notNull(),
    usedAt: datetime("used_at", { mode: "date" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index("otp_email_idx").on(table.email),
  }),
);

export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: datetime("expires_at", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("sessions_user_idx").on(table.userId),
  }),
);

export const mosques = mysqlTable(
  "mosques",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    address: text("address").notNull(),
    latitude: double("latitude").notNull(),
    longitude: double("longitude").notNull(),
    conditionPhotoUrl: text("condition_photo_url"),
    managerName: varchar("manager_name", { length: 120 }).notNull(),
    managerContact: varchar("manager_contact", { length: 64 }).notNull(),
    createdByUserId: varchar("created_by_user_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    locationIdx: index("mosques_location_idx").on(table.latitude, table.longitude),
  }),
);

export const events = mysqlTable(
  "events",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    mosqueId: bigint("mosque_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => mosques.id, { onDelete: "cascade" }),
    partnerUserId: varchar("partner_user_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 191 }).notNull(),
    description: text("description"),
    status: eventStatusEnum("status").notNull().default("pending_verification"),
    scheduledAt: datetime("scheduled_at", { mode: "date" }).notNull(),
    volunteerQuota: int("volunteer_quota").notNull().default(20),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    statusIdx: index("events_status_idx").on(table.status),
    scheduleIdx: index("events_schedule_idx").on(table.scheduledAt),
  }),
);

export const volunteersOnEvent = mysqlTable(
  "volunteers_on_event",
  {
    eventId: bigint("event_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 32 }).notNull().default("joined"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
    xpAwarded: int("xp_awarded").notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.userId] }),
  }),
);

export const contributions = mysqlTable(
  "contributions",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    eventId: bigint("event_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: contributionTypeEnum("type").notNull(),
    amountMoney: int("amount_money"),
    itemName: varchar("item_name", { length: 120 }),
    itemQty: int("item_qty"),
    note: text("note"),
    status: varchar("status", { length: 32 }).notNull().default("pledged"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    eventIdx: index("contrib_event_idx").on(table.eventId),
    userIdx: index("contrib_user_idx").on(table.userId),
  }),
);

export const chatLinks = mysqlTable("chat_links", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  eventId: bigint("event_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 32 }).notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const eventReports = mysqlTable("event_reports", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  eventId: bigint("event_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  photos: json("photos").$type<string[]>().notNull().default(sql`(json_array())`),
  createdByUserId: varchar("created_by_user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
});

export const activityFeed = mysqlTable("activity_feed", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  eventId: bigint("event_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  reportId: bigint("report_id", { mode: "number", unsigned: true }).references(() => eventReports.id, {
    onDelete: "set null",
  }),
  type: varchar("type", { length: 32 }).notNull().default("report_published"),
  message: text("message").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  donations: many(contributions),
  volunteerEvents: many(volunteersOnEvent),
  createdMosques: many(mosques),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
}));

export const mosquesRelations = relations(mosques, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [mosques.createdByUserId],
    references: [users.id],
  }),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  mosque: one(mosques, {
    fields: [events.mosqueId],
    references: [mosques.id],
  }),
  partner: one(users, {
    fields: [events.partnerUserId],
    references: [users.id],
  }),
  volunteers: many(volunteersOnEvent),
  contributions: many(contributions),
  reports: many(eventReports),
  chatLinks: many(chatLinks),
  feedItems: many(activityFeed),
}));

export const volunteersOnEventRelations = relations(volunteersOnEvent, ({ one }) => ({
  event: one(events, {
    fields: [volunteersOnEvent.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [volunteersOnEvent.userId],
    references: [users.id],
  }),
}));

export const contributionsRelations = relations(contributions, ({ one }) => ({
  event: one(events, {
    fields: [contributions.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [contributions.userId],
    references: [users.id],
  }),
}));

export const chatLinksRelations = relations(chatLinks, ({ one }) => ({
  event: one(events, {
    fields: [chatLinks.eventId],
    references: [events.id],
  }),
}));

export const eventReportsRelations = relations(eventReports, ({ one }) => ({
  event: one(events, {
    fields: [eventReports.eventId],
    references: [events.id],
  }),
  author: one(users, {
    fields: [eventReports.createdByUserId],
    references: [users.id],
  }),
}));

export const activityFeedRelations = relations(activityFeed, ({ one }) => ({
  event: one(events, {
    fields: [activityFeed.eventId],
    references: [events.id],
  }),
  report: one(eventReports, {
    fields: [activityFeed.reportId],
    references: [eventReports.id],
  }),
}));

export type User = typeof users.$inferSelect;

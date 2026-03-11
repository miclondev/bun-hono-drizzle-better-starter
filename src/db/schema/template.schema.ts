import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuid } from "./utils";
import { user } from "./auth-schema";

export const videoTemplates = pgTable("video_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  voiceId: varchar("voice_id", { length: 50 }).notNull(),
  bgStyle: varchar("bg_style", { length: 50 }).notNull(),
  textStyle: varchar("text_style", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type VideoTemplate = typeof videoTemplates.$inferSelect;
export type InsertVideoTemplate = typeof videoTemplates.$inferInsert;
export type UpdateVideoTemplate = Partial<InsertVideoTemplate>;

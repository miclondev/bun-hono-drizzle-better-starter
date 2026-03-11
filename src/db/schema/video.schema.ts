import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuid } from "./utils";

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  script: text("script").notNull(),
  voiceId: varchar("voice_id", { length: 50 }).notNull(),
  bgStyle: varchar("bg_style", { length: 50 }).notNull(),
  textStyle: varchar("text_style", { length: 50 }).notNull(),
  duration: integer("duration"), // in seconds
  status: varchar("status", { length: 20 }).notNull().default("generating"), // generating, ready, posted, failed
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  views: integer("views").default(0).notNull(),
  tiktokVideoId: text("tiktok_video_id"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Import user from auth schema for the reference
import { user } from "./auth-schema";

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;
export type UpdateVideo = Partial<InsertVideo>;

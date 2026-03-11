import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuid } from "./utils";
import { user } from "./auth-schema";

export const rssFeeds = pgTable("rss_feeds", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  label: varchar("label", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RssFeed = typeof rssFeeds.$inferSelect;
export type InsertRssFeed = typeof rssFeeds.$inferInsert;

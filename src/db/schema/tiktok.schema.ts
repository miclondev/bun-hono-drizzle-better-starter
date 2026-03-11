import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuid } from "./utils";
import { user } from "./auth-schema";

export const tiktokAccounts = pgTable("tiktok_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 100 }).notNull(),
  accessToken: text("access_token").notNull(), // TODO: Encrypt in production
  refreshToken: text("refresh_token").notNull(), // TODO: Encrypt in production
  tokenExpiresAt: timestamp("token_expires_at").notNull(),
  autoPost: boolean("auto_post").default(false).notNull(),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TikTokAccount = typeof tiktokAccounts.$inferSelect;
export type InsertTikTokAccount = typeof tiktokAccounts.$inferInsert;
export type UpdateTikTokAccount = Partial<InsertTikTokAccount>;

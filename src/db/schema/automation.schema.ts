import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuid } from "./utils";
import { user } from "./auth-schema";
import { videoTemplates } from "./template.schema";

export const automations = pgTable("automations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  frequency: integer("frequency").notNull(), // videos per day
  templateId: uuid("template_id").references(() => videoTemplates.id, { onDelete: "set null" }),
  active: boolean("active").default(true).notNull(),
  videosGenerated: integer("videos_generated").default(0).notNull(),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = typeof automations.$inferInsert;
export type UpdateAutomation = Partial<InsertAutomation>;

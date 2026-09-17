import { createInsertSchema } from "drizzle-zod";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const crmContactsTable = pgTable("crm_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  area: text("area").notNull(),
  affiliation: text("affiliation").notNull(),
  status: text("status").notNull().default("lead"),
  engagementScore: integer("engagement_score").notNull().default(0),
  lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
  nextAction: text("next_action").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const crmTasksTable = pgTable("crm_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  status: text("status").notNull().default("todo"),
  priority: text("priority").notNull().default("medium"),
  dueDate: text("due_date"),
  owner: text("owner").notNull(),
  contactId: integer("contact_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const communitySignalsTable = pgTable("community_signals", {
  id: serial("id").primaryKey(),
  area: text("area").notNull(),
  summary: text("summary").notNull(),
  status: text("status").notNull().default("new"),
  source: text("source").notNull().default("community portal"),
  communityVisible: text("community_visible").notNull().default("true"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertCrmContactSchema = createInsertSchema(crmContactsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertCrmTaskSchema = createInsertSchema(crmTasksTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertCommunitySignalSchema = createInsertSchema(
  communitySignalsTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CrmContact = typeof crmContactsTable.$inferSelect;
export type CrmTask = typeof crmTasksTable.$inferSelect;
export type CommunitySignal = typeof communitySignalsTable.$inferSelect;
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Credits table - tracks user credit balance
export const credits = mysqlTable("credits", {
  userId: varchar("userId", { length: 64 }).primaryKey().references(() => users.id),
  balance: int("balance").default(0).notNull(), // Credit balance in cents
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Credit = typeof credits.$inferSelect;
export type InsertCredit = typeof credits.$inferInsert;

// Transactions table - records all credit purchases and usage
export const transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  type: mysqlEnum("type", ["purchase", "usage", "refund"]).notNull(),
  amount: int("amount").notNull(), // Amount in cents (negative for usage)
  balanceAfter: int("balanceAfter").notNull(), // Balance after transaction
  description: text("description"),
  // Payment related fields
  paymentMethod: varchar("paymentMethod", { length: 64 }), // credit_card, promptpay, truemoney
  paymentId: varchar("paymentId", { length: 255 }), // Omise charge ID
  paymentStatus: varchar("paymentStatus", { length: 64 }), // pending, successful, failed
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// Generations table - stores all AI generation requests
export const generations = mysqlTable("generations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  provider: mysqlEnum("provider", ["runware", "replicate"]).notNull(),
  type: mysqlEnum("type", ["text_to_image", "image_to_image", "text_to_video", "image_to_video", "inpainting", "outpainting", "upscale", "background_removal"]).notNull(),
  // Request parameters
  prompt: text("prompt"),
  model: varchar("model", { length: 255 }),
  parameters: text("parameters"), // JSON string of additional parameters
  // Result data
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  resultUrl: text("resultUrl"), // URL of generated media
  errorMessage: text("errorMessage"),
  // Cost tracking
  apiCost: int("apiCost").notNull(), // Actual API cost in cents
  userCost: int("userCost").notNull(), // Cost charged to user (with markup) in cents
  processingTime: int("processingTime"), // Time in seconds
  createdAt: timestamp("createdAt").defaultNow(),
  completedAt: timestamp("completedAt"),
});

export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = typeof generations.$inferInsert;

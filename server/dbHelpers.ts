/**
 * Database helper functions for credits, transactions, and generations
 */

import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { credits, transactions, generations, InsertCredit, InsertTransaction, InsertGeneration } from "../drizzle/schema";

/**
 * Get user's credit balance
 */
export async function getUserCredits(userId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(credits).where(eq(credits.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Initialize credits for new user
 */
export async function initializeUserCredits(userId: string) {
  const db = await getDb();
  if (!db) return;

  await db.insert(credits).values({
    userId,
    balance: 100, // Give 100 free credits for testing
  }).onDuplicateKeyUpdate({
    set: { userId },
  });
}

/**
 * Add credits to user account (for purchases)
 */
export async function addCredits(
  userId: string,
  amount: number,
  description: string,
  paymentMethod?: string,
  paymentId?: string
): Promise<{ success: boolean; newBalance: number }> {
  const db = await getDb();
  if (!db) return { success: false, newBalance: 0 };

  try {
    // Get current balance
    const currentCredits = await getUserCredits(userId);
    const currentBalance = currentCredits?.balance || 0;
    const newBalance = currentBalance + amount;

    // Update balance
    await db.insert(credits).values({
      userId,
      balance: newBalance,
    }).onDuplicateKeyUpdate({
      set: { balance: newBalance, updatedAt: new Date() },
    });

    // Record transaction
    await db.insert(transactions).values({
      id: crypto.randomUUID(),
      userId,
      type: "purchase",
      amount,
      balanceAfter: newBalance,
      description,
      paymentMethod,
      paymentId,
      paymentStatus: "successful",
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error("[DB] Error adding credits:", error);
    return { success: false, newBalance: 0 };
  }
}

/**
 * Deduct credits from user account (for generation usage)
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; newBalance: number }> {
  const db = await getDb();
  if (!db) return { success: false, newBalance: 0 };

  try {
    // Get current balance
    const currentCredits = await getUserCredits(userId);
    const currentBalance = currentCredits?.balance || 0;

    // Check if user has enough credits
    if (currentBalance < amount) {
      return { success: false, newBalance: currentBalance };
    }

    const newBalance = currentBalance - amount;

    // Update balance
    await db.insert(credits).values({
      userId,
      balance: newBalance,
    }).onDuplicateKeyUpdate({
      set: { balance: newBalance, updatedAt: new Date() },
    });

    // Record transaction
    await db.insert(transactions).values({
      id: crypto.randomUUID(),
      userId,
      type: "usage",
      amount: -amount, // Negative for usage
      balanceAfter: newBalance,
      description,
      paymentStatus: "successful",
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error("[DB] Error deducting credits:", error);
    return { success: false, newBalance: 0 };
  }
}

/**
 * Get user's transaction history
 */
export async function getUserTransactions(userId: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

/**
 * Create a new generation record
 */
export async function createGeneration(data: InsertGeneration) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(generations).values(data);
  return data;
}

/**
 * Update generation status
 */
export async function updateGeneration(
  id: string,
  updates: Partial<{
    status: "pending" | "processing" | "completed" | "failed";
    resultUrl: string;
    errorMessage: string;
    processingTime: number;
    completedAt: Date;
    parameters: string;
  }>
) {
  const db = await getDb();
  if (!db) return;

  await db.update(generations).set(updates).where(eq(generations.id, id));
}

/**
 * Get user's generation history
 */
export async function getUserGenerations(userId: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(generations)
    .where(eq(generations.userId, userId))
    .orderBy(desc(generations.createdAt))
    .limit(limit);
}

/**
 * Get generation by ID
 */
export async function getGenerationById(id: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(generations).where(eq(generations.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}


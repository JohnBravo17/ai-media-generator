/**
 * Omise Payment Gateway Integration
 * Handles credit card, PromptPay, and TrueMoney payments
 */

import Omise from "omise";

const OMISE_PUBLIC_KEY = process.env.OMISE_PUBLIC_KEY;
const OMISE_SECRET_KEY = process.env.OMISE_SECRET_KEY;

if (!OMISE_PUBLIC_KEY || !OMISE_SECRET_KEY) {
  console.warn("[Omise] API keys not configured");
}

// Initialize Omise client
const omise = Omise({
  publicKey: OMISE_PUBLIC_KEY || "",
  secretKey: OMISE_SECRET_KEY || "",
});

export interface CreateChargeParams {
  amount: number; // Amount in cents (THB)
  currency?: string;
  description: string;
  source?: string; // Token from Omise.js for card payments
  returnUri?: string; // For internet banking redirects
}

export interface ChargeResult {
  success: boolean;
  chargeId?: string;
  authorizeUri?: string; // For PromptPay/TrueMoney QR code or redirect
  error?: string;
  status?: string;
}

/**
 * Create a charge (payment)
 */
export async function createCharge(params: CreateChargeParams): Promise<ChargeResult> {
  if (!OMISE_SECRET_KEY) {
    return {
      success: false,
      error: "Omise not configured",
    };
  }

  try {
    const charge = await omise.charges.create({
      amount: params.amount, // Amount in smallest currency unit (satangs for THB)
      currency: params.currency || "THB",
      description: params.description,
      ...(params.source && { source: params.source }),
      ...(params.returnUri && { return_uri: params.returnUri }),
    });

    // Check charge status
    if (charge.status === "successful") {
      return {
        success: true,
        chargeId: charge.id,
        status: charge.status,
      };
    } else if (charge.status === "pending" && charge.authorize_uri) {
      // For PromptPay/TrueMoney, user needs to scan QR or complete payment
      return {
        success: true,
        chargeId: charge.id,
        authorizeUri: charge.authorize_uri,
        status: charge.status,
      };
    } else {
      return {
        success: false,
        chargeId: charge.id,
        status: charge.status,
        error: charge.failure_message || "Payment failed",
      };
    }
  } catch (error: any) {
    console.error("[Omise] Charge creation error:", error);
    return {
      success: false,
      error: error.message || "Payment processing failed",
    };
  }
}

/**
 * Create a source for alternative payment methods (PromptPay, TrueMoney)
 */
export async function createSource(params: {
  type: "promptpay" | "truemoney";
  amount: number;
  currency?: string;
}): Promise<{
  success: boolean;
  sourceId?: string;
  error?: string;
}> {
  if (!OMISE_SECRET_KEY) {
    return {
      success: false,
      error: "Omise not configured",
    };
  }

  try {
    const source = await omise.sources.create({
      type: params.type,
      amount: params.amount,
      currency: params.currency || "THB",
    });

    return {
      success: true,
      sourceId: source.id,
    };
  } catch (error: any) {
    console.error("[Omise] Source creation error:", error);
    return {
      success: false,
      error: error.message || "Failed to create payment source",
    };
  }
}

/**
 * Retrieve charge status
 */
export async function getChargeStatus(chargeId: string): Promise<{
  success: boolean;
  status?: string;
  paid?: boolean;
  error?: string;
}> {
  if (!OMISE_SECRET_KEY) {
    return {
      success: false,
      error: "Omise not configured",
    };
  }

  try {
    const charge = await omise.charges.retrieve(chargeId);

    return {
      success: true,
      status: charge.status,
      paid: charge.paid,
    };
  } catch (error: any) {
    console.error("[Omise] Charge retrieval error:", error);
    return {
      success: false,
      error: error.message || "Failed to retrieve charge status",
    };
  }
}

/**
 * Credit packages with prices in THB
 */
export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 1000, // 1000 cents = $10 worth
    price: 350, // 350 THB (~$10)
    priceDisplay: "฿350",
  },
  {
    id: "basic",
    name: "Basic Pack",
    credits: 2500, // 2500 cents = $25 worth
    price: 850, // 850 THB (~$25)
    priceDisplay: "฿850",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro Pack",
    credits: 5000, // 5000 cents = $50 worth
    price: 1650, // 1650 THB (~$50)
    priceDisplay: "฿1,650",
  },
  {
    id: "premium",
    name: "Premium Pack",
    credits: 10000, // 10000 cents = $100 worth
    price: 3200, // 3200 THB (~$100)
    priceDisplay: "฿3,200",
  },
];

/**
 * Get credit package by ID
 */
export function getCreditPackage(packageId: string) {
  return CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
}


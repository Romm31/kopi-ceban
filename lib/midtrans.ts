import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";

export const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
export const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || "";
export const MIDTRANS_MERCHANT_ID = process.env.MIDTRANS_MERCHANT_ID || "";
export const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

// Dynamic URLs based on environment
export const MIDTRANS_SNAP_URL = MIDTRANS_IS_PRODUCTION 
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

export const MIDTRANS_API_URL = MIDTRANS_IS_PRODUCTION 
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";

// Validate environment on first import
const validateEnv = () => {
  const missing: string[] = [];
  if (!MIDTRANS_SERVER_KEY) missing.push("MIDTRANS_SERVER_KEY");
  if (!MIDTRANS_CLIENT_KEY) missing.push("MIDTRANS_CLIENT_KEY");
  if (!MIDTRANS_MERCHANT_ID) missing.push("MIDTRANS_MERCHANT_ID");
  
  if (missing.length > 0) {
    console.error(`❌ Missing Midtrans environment variables: ${missing.join(", ")}`);
  } else {
    console.log(`✅ Midtrans configured for ${MIDTRANS_IS_PRODUCTION ? "PRODUCTION" : "SANDBOX"}`);
  }
};

// Run validation once
validateEnv();

export const getMidtransHeaders = () => {
  const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Basic ${authString}`,
  };
};

/**
 * Create Snap Transaction Token (for pop-up checkout)
 */
export const createSnapTransaction = async (
  orderCode: string,
  totalPrice: number,
  customerName: string,
  items: any[]
) => {
  const url = MIDTRANS_API_URL;
  
  const payload = {
    transaction_details: {
      order_id: orderCode,
      gross_amount: totalPrice,
    },
    customer_details: {
      first_name: customerName,
    },
    item_details: items.map((item) => ({
      id: item.menuId?.toString() || "ITEM",
      price: item.price,
      quantity: item.quantity,
      name: item.name,
    })),
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getMidtransHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Midtrans Snap Error:", data);
      throw new Error(data.error_messages?.[0] || "Failed to create snap transaction");
    }

    // Returns { token: "...", redirect_url: "..." }
    return data;
  } catch (error) {
    console.error("Create Snap Transaction Exception:", error);
    throw error;
  }
};

/**
 * Verify Midtrans notification signature
 * Signature = SHA512(order_id + status_code + gross_amount + server_key)
 */
export const verifySignature = (
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean => {
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`)
    .digest("hex");
  
  return signatureKey === expectedSignature;
};

/**
 * Map Midtrans transaction status to our OrderStatus enum
 */

export const mapMidtransStatus = (
  transactionStatus: string,
  fraudStatus?: string
): OrderStatus => {
  // Check fraud status first
  if (fraudStatus === "deny" || fraudStatus === "challenge") {
    return "FAILED" as OrderStatus;
  }

  switch (transactionStatus) {
    case "capture":
    case "settlement":
      return "SUCCESS" as OrderStatus;
    case "pending":
      return "PENDING" as OrderStatus;
    case "expire":
      return "EXPIRED" as OrderStatus;
    case "deny":
    case "cancel":
      return "FAILED" as OrderStatus;
    case "refund":
    case "partial_refund":
      return "REFUNDED" as OrderStatus;
    default:
      return "PENDING" as OrderStatus;
  }
};

/**
 * Get transaction status from Midtrans API
 */
export const getTransactionStatus = async (orderId: string) => {
  const baseUrl = MIDTRANS_IS_PRODUCTION
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";
  
  const url = `${baseUrl}/v2/${orderId}/status`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getMidtransHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Midtrans Status Check Error:", data);
      throw new Error(data.status_message || "Failed to get transaction status");
    }

    return data;
  } catch (error) {
    console.error("Get Transaction Status Exception:", error);
    throw error;
  }
};

/**
 * Log Midtrans events to console (can be extended to file logging)
 */
export const logMidtransEvent = (
  eventType: "NOTIFICATION" | "STATUS_CHECK" | "ERROR",
  orderId: string,
  details: Record<string, any>
) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    eventType,
    orderId,
    ...details,
  };
  
  console.log(`[MIDTRANS ${eventType}]`, JSON.stringify(logEntry, null, 2));
  
  return logEntry;
};


import { NextResponse } from "next/server";

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

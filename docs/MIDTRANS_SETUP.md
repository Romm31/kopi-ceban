# Midtrans Payment Gateway Setup Guide

## Environment Variables

Add the following to your `.env` file:

```bash
# Midtrans Configuration
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx   # Get from Midtrans Dashboard
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx   # Get from Midtrans Dashboard
MIDTRANS_MERCHANT_ID=G123456789         # Your merchant ID
MIDTRANS_IS_PRODUCTION=false            # Set to 'true' for production
```

## Notification URL Setup

### For Sandbox Testing

1. Go to [Midtrans Dashboard Sandbox](https://dashboard.sandbox.midtrans.com)
2. Navigate to **Settings → Payment → Notification URL**
3. Set your notification URL:

   **Local Development (with ngrok):**

   ```
   https://your-ngrok-url.ngrok.io/api/midtrans/notification
   ```

   **Production:**

   ```
   https://yourdomain.com/api/midtrans/notification
   ```

### Using ngrok for Local Testing

```bash
# Install ngrok (if not installed)
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose port 3000
ngrok http 3000

# Copy the HTTPS URL and set it in Midtrans Dashboard
```

## API Endpoints

| Endpoint                                       | Method | Description                                  |
| ---------------------------------------------- | ------ | -------------------------------------------- |
| `/api/midtrans/notification`                   | POST   | Receives payment notifications from Midtrans |
| `/api/midtrans/check-status?orderCode=ORD-xxx` | GET    | Check & sync single order status             |
| `/api/midtrans/check-status`                   | POST   | Batch sync all stuck pending orders          |
| `/api/orders/create`                           | POST   | Create new order with Midtrans payment       |

## Status Mapping

| Midtrans Status            | Database Status | Badge Color |
| -------------------------- | --------------- | ----------- |
| `settlement`, `capture`    | SUCCESS         | 🟢 Green    |
| `pending`                  | PENDING         | 🟠 Orange   |
| `expire`                   | EXPIRED         | 🔴 Red      |
| `deny`, `cancel`           | FAILED          | ⚫ Gray     |
| `refund`, `partial_refund` | REFUNDED        | 🟣 Purple   |

## Testing with Sandbox

### 1. Create a Test Order

- Go to customer order page
- Add items to cart
- Complete checkout
- Midtrans popup will appear

### 2. Test Payment Credentials

**Credit Card:**

```
Card Number: 4811 1111 1111 1114
Expiry: Any future date
CVV: 123
OTP: 112233
```

**Bank Transfer:** Follow instructions in popup

### 3. Simulate Expiration

In Midtrans Dashboard:

- Go to **Transactions**
- Find pending transaction
- Click **Simulate Payment Expired**

## Debugging Tips

### Check Notification Logs

Watch server console for `[MIDTRANS NOTIFICATION]` logs

### Force Sync Stuck Orders

```bash
# Single order
curl "http://localhost:3000/api/midtrans/check-status?orderCode=ORD-xxx"

# All pending orders older than 10 minutes
curl -X POST http://localhost:3000/api/midtrans/check-status
```

### Common Issues

1. **Notifications not received:**

   - Verify Notification URL in Midtrans Dashboard
   - Check ngrok is running (for local dev)
   - Check server logs for errors

2. **Signature validation failed:**

   - Verify `MIDTRANS_SERVER_KEY` is correct
   - Check gross_amount matches exactly

3. **Status not updating:**
   - Check PaymentLogs in database
   - Use check-status API to force sync

## Preventing Stuck PENDING Orders

The `/api/midtrans/check-status` POST endpoint automatically syncs orders that:

- Have `PENDING` status
- Are older than 10 minutes

**Recommended: Set up a cron job**

```bash
# Every 15 minutes
*/15 * * * * curl -X POST https://yourdomain.com/api/midtrans/check-status
```

Or use Vercel Cron Jobs in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/midtrans/check-status",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

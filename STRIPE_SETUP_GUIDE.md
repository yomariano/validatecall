# Stripe Payment Links Setup Guide

## Overview
The pricing page is now live at `/pricing` with three tiers:
- **Lite**: $199/month (100 calls)
- **Starter**: $499/month (500 calls) - Most Popular
- **Pro**: $1,340/month (2000 calls)

## Step 1: Create Stripe Account
1. Go to https://stripe.com and create an account
2. Complete the business verification process
3. Go to the Stripe Dashboard: https://dashboard.stripe.com

## Step 2: Create Products in Stripe

### Create Lite Plan
1. Navigate to **Products** in the Stripe Dashboard
2. Click **+ Add Product**
3. Fill in the details:
   - **Name**: ValidateCall Lite
   - **Description**: 100 AI research calls/month
   - **Pricing**: $199.00 USD
   - **Billing Period**: Monthly (recurring)
4. Click **Save product**

### Create Starter Plan
1. Click **+ Add Product**
2. Fill in the details:
   - **Name**: ValidateCall Starter
   - **Description**: 500 AI research calls/month - Most Popular
   - **Pricing**: $499.00 USD
   - **Billing Period**: Monthly (recurring)
3. Click **Save product**

### Create Pro Plan
1. Click **+ Add Product**
2. Fill in the details:
   - **Name**: ValidateCall Pro
   - **Description**: 2000 AI research calls/month - Best Value
   - **Pricing**: $1,340.00 USD
   - **Billing Period**: Monthly (recurring)
3. Click **Save product**

## Step 3: Create Payment Links

### For Each Product:
1. Go to **Payment Links** in the Stripe Dashboard
2. Click **+ New**
3. Select the product you created
4. Configure the payment link:
   - **After payment**: Redirect to a confirmation page (e.g., `/dashboard`)
   - **Allow promotion codes**: Yes (optional)
   - **Collect customer addresses**: Optional
   - **Enable free trial**: 14 days (optional)
5. Click **Create link**
6. Copy the payment link URL

## Step 4: Update the Application

Open the file: `src/pages/PricingPublic.jsx`

Replace the placeholder URLs with your actual Stripe payment links:

```javascript
const STRIPE_PAYMENT_LINKS = {
  lite: "YOUR_LITE_PAYMENT_LINK_HERE",
  starter: "YOUR_STARTER_PAYMENT_LINK_HERE",
  pro: "YOUR_PRO_PAYMENT_LINK_HERE",
};
```

Example:
```javascript
const STRIPE_PAYMENT_LINKS = {
  lite: "https://buy.stripe.com/test_dR66pp3m6ch1abc1gh",
  starter: "https://buy.stripe.com/test_eVa5llaSk2GNabc2hj",
  pro: "https://buy.stripe.com/test_fRacOO7Cm4OV7Z0dQS",
};
```

## Step 5: Test the Payment Flow

### Test Mode (Recommended First)
1. Stripe provides test payment links by default
2. Use test card numbers:
   - **Success**: 4242 4242 4242 4242
   - **Decline**: 4000 0000 0000 0002
3. Any future expiry date and any 3-digit CVC

### Live Mode
1. Switch to Live mode in Stripe Dashboard
2. Create new payment links for production
3. Update the `STRIPE_PAYMENT_LINKS` object with live URLs
4. Test with a real card (you can refund yourself)

## Step 6: Set Up Webhooks (Optional but Recommended)

To automatically update user subscriptions in your database:

1. Go to **Developers** > **Webhooks** in Stripe Dashboard
2. Click **+ Add endpoint**
3. Set the endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret**
6. Add it to your `.env` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Pricing Breakdown

### Cost Analysis (Based on Vapi)
- Base cost per call: $0.50 (5 minutes @ $0.10/min)

### Margins
- **Lite**: 75% margin ($2.00/call)
- **Starter**: 50% margin ($1.00/call)
- **Pro**: 25% margin ($0.67/call)

### Monthly Revenue vs Costs
- **Lite**: $199 revenue - $50 costs = **$149 profit** (75% margin)
- **Starter**: $499 revenue - $250 costs = **$249 profit** (50% margin)
- **Pro**: $1,340 revenue - $1,000 costs = **$340 profit** (25% margin)

## Additional Features to Consider

### 1. Usage-Based Billing
Add pay-as-you-go options for customers who exceed their plan limits:
- Lite overage: $2.50/call
- Starter overage: $1.25/call
- Pro overage: $0.85/call

### 2. Annual Plans
Offer discounted annual pricing (save 2 months):
- Lite Annual: $1,990/year (save $398)
- Starter Annual: $4,990/year (save $998)
- Pro Annual: $13,400/year (save $2,680)

### 3. Add-ons
- Extra languages pack: $49/month
- Premium voices: $29/month
- API access: $99/month
- Dedicated support: $199/month

## Support
- Stripe Documentation: https://stripe.com/docs/payments/payment-links
- Stripe Support: https://support.stripe.com

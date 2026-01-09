# Stripe Mode Switcher Guide

## Overview
The pricing page now has a built-in mode switcher that allows you to toggle between TEST and LIVE Stripe payment links.

## How to Use

### Activating the Switcher
1. Navigate to the pricing page: `http://localhost:5173/pricing`
2. Press **Ctrl+Shift+S** to toggle the switcher visibility
3. The switcher will appear in the bottom-right corner

### Switching Modes
- **Test Mode**: Uses test payment links (test card: 4242 4242 4242 4242)
- **Live Mode**: Uses production payment links (real payments)

Click the desired mode button and the page will reload with the new configuration.

## Mode Priority
The system determines which Stripe links to use in this priority order:

1. **localStorage** (set by the admin switcher) - Highest priority
2. **Environment Variable** (`VITE_STRIPE_MODE` in `.env`)
3. **Hostname Detection** (auto-detects `validatecall.com` as live) - Lowest priority

## Configuration Files

### Environment Variable (.env)
```bash
# Set to 'test' or 'live' to control default mode
VITE_STRIPE_MODE=test
```

### Payment Links (src/pages/PricingPublic.jsx)
```javascript
const STRIPE_PAYMENT_LINKS = {
  test: {
    lite: "https://buy.stripe.com/test_9B600ibzgboW0Na4I4fQI0d",
    starter: "https://buy.stripe.com/test_5kQeVc7j00KibrOa2ofQI0e",
    pro: "https://buy.stripe.com/test_7sYaEWcDk0KicvSdeAfQI0f",
  },
  live: {
    lite: "https://buy.stripe.com/live_REPLACE_WITH_YOUR_LITE_LINK",
    starter: "https://buy.stripe.com/live_REPLACE_WITH_YOUR_STARTER_LINK",
    pro: "https://buy.stripe.com/live_REPLACE_WITH_YOUR_PRO_LINK",
  }
};
```

## Creating LIVE Mode Payment Links

Since the Stripe CLI has restricted permissions, you'll need to create LIVE mode products manually in the Stripe Dashboard:

### Step 1: Access Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Toggle to **LIVE mode** (switch in the top-left corner)

### Step 2: Create Products

#### Lite Plan
1. Navigate to **Products** → **+ Add Product**
2. Fill in:
   - **Name**: ValidateCall Lite
   - **Description**: 100 AI research calls/month
   - **Price**: $197.00 USD
   - **Billing**: Recurring - Monthly
3. Click **Save product**

#### Starter Plan
1. Click **+ Add Product**
2. Fill in:
   - **Name**: ValidateCall Starter
   - **Description**: 500 AI research calls/month - Most Popular
   - **Price**: $497.00 USD
   - **Billing**: Recurring - Monthly
3. Click **Save product**

#### Pro Plan
1. Click **+ Add Product**
2. Fill in:
   - **Name**: ValidateCall Pro
   - **Description**: 2000 AI research calls/month - Best Value
   - **Price**: $1,337.00 USD
   - **Billing**: Recurring - Monthly
3. Click **Save product**

### Step 3: Create Payment Links

For each product:
1. Go to **Payment Links** → **+ New**
2. Select the product
3. Configure:
   - **After payment**: Redirect to `https://validatecall.com/dashboard`
   - **Allow promotion codes**: Yes (optional)
   - **Free trial**: 14 days (optional)
4. Click **Create link**
5. **Copy the payment link URL**

### Step 4: Update the Application

Replace the placeholder URLs in `src/pages/PricingPublic.jsx`:

```javascript
live: {
  lite: "https://buy.stripe.com/live_YOUR_ACTUAL_LITE_LINK_HERE",
  starter: "https://buy.stripe.com/live_YOUR_ACTUAL_STARTER_LINK_HERE",
  pro: "https://buy.stripe.com/live_YOUR_ACTUAL_PRO_LINK_HERE",
}
```

### Step 5: Test Both Modes

1. Press **Ctrl+Shift+S** to open the switcher
2. Select **Test Mode** → Verify test links work
3. Select **Live Mode** → Verify live links work
4. Check the mode indicator badge at the top of the pricing page

## Visual Indicators

### Test Mode
- Yellow badge: "Test Mode - Use card 4242 4242 4242 4242"
- Payment links redirect to Stripe test checkout

### Live Mode
- Green badge: "Live Mode - Real payments active"
- Payment links redirect to Stripe live checkout

## Security Notes

- The switcher is hidden by default (press Ctrl+Shift+S to reveal)
- Only admins who know the keyboard shortcut can access it
- Consider removing the switcher component in production builds
- Always test live mode with a real card before going public

## Deployment Considerations

### For Production (validatecall.com)
1. Create all LIVE mode products in Stripe Dashboard
2. Update the `live` object in PricingPublic.jsx with actual payment links
3. Set `VITE_STRIPE_MODE=live` in production .env
4. The system will automatically use live mode when hostname is `validatecall.com`

### For Staging/Development
1. Keep `VITE_STRIPE_MODE=test` in .env
2. Use the switcher to test live mode locally if needed
3. Test mode is safe for development - no real charges

## Troubleshooting

### Switcher Not Appearing
- Make sure you pressed **Ctrl+Shift+S** (not Ctrl+S)
- Check browser console for errors
- Refresh the page and try again

### Wrong Payment Links Loading
- Check localStorage: `localStorage.getItem('stripeMode')`
- Clear localStorage: `localStorage.removeItem('stripeMode')`
- Check .env file: `VITE_STRIPE_MODE` value
- Restart dev server after changing .env

### Mode Not Persisting
- The selected mode is saved to localStorage
- It persists across page reloads
- To reset: clear localStorage or switch modes again

## Files Modified

- `src/pages/PricingPublic.jsx` - Added mode detection and switcher component
- `src/components/admin/StripeModeSwitcher.jsx` - New switcher component
- `.env` - Added `VITE_STRIPE_MODE` variable
- `STRIPE_MODE_SWITCHER_GUIDE.md` - This documentation file

## Current Status

✅ **TEST Mode**: Fully configured with working payment links
❌ **LIVE Mode**: Needs payment links to be created in Stripe Dashboard

Once you create the LIVE mode payment links and update PricingPublic.jsx, you'll be able to switch between test and live modes seamlessly using Ctrl+Shift+S.

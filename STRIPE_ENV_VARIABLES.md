# Stripe Environment Variables - Complete Reference

## ✅ All Stripe Keys Now in Your .env Files

### Frontend (.env)

```bash
# Stripe Configuration
VITE_STRIPE_MODE=test

# Stripe Publishable Keys (safe to expose in frontend)
VITE_STRIPE_TEST_PUBLISHABLE_KEY=pk_test_51HgeL5Cnj3EJxpv0CbgG4x7m6Y2OG6IJSr9b9Z2DuYc8CBMoNcsZZat3ToWV6zgJiypSwCAeSP9itR1ikaQXlH9X00Wv2X1RAc
VITE_STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_51HgeL5Cnj3EJxpv0cgJ4ArnRVJSFu9FOXJpGcM7c6zZxmSRtkbi5e4uHzf6fufMSOef5zpz3YsAAqTcfur2YmSUp0077QX6RnG

# LIVE MODE Payment Links
VITE_STRIPE_LIVE_LITE_LINK=https://buy.stripe.com/6oUaEWeLs9gO8fCgqMfQI07
VITE_STRIPE_LIVE_STARTER_LINK=https://buy.stripe.com/28E6oG0UC78G53qb6sfQI08
VITE_STRIPE_LIVE_PRO_LINK=https://buy.stripe.com/00w4gyfPw64C53q4I4fQI09

# TEST MODE Payment Links
VITE_STRIPE_TEST_LITE_LINK=https://buy.stripe.com/test_9B600ibzgboW0Na4I4fQI0d
VITE_STRIPE_TEST_STARTER_LINK=https://buy.stripe.com/test_5kQeVc7j00KibrOa2ofQI0e
VITE_STRIPE_TEST_PRO_LINK=https://buy.stripe.com/test_7sYaEWcDk0KicvSdeAfQI0f
```

### Backend (validatecall-api/.env)

```bash
# TEST MODE Keys
STRIPE_TEST_SECRET_KEY=sk_test_your_test_secret_key_here

# LIVE MODE Keys
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# LIVE MODE Product IDs
STRIPE_LIVE_LITE_PRODUCT_ID=prod_TlAu6nvTUMDMGI
STRIPE_LIVE_LITE_PRICE_ID=price_1SneYWCnj3EJxpv00yk4KSRw
STRIPE_LIVE_STARTER_PRODUCT_ID=prod_TlAuuhhGS078r5
STRIPE_LIVE_STARTER_PRICE_ID=price_1SneYuCnj3EJxpv0AD1sbxtq
STRIPE_LIVE_PRO_PRODUCT_ID=prod_TlAutSfNd8N9NP
STRIPE_LIVE_PRO_PRICE_ID=price_1SneZLCnj3EJxpv0Yhg2229u

# LIVE MODE Payment Links
STRIPE_LIVE_LITE_PAYMENT_LINK=https://buy.stripe.com/6oUaEWeLs9gO8fCgqMfQI07
STRIPE_LIVE_STARTER_PAYMENT_LINK=https://buy.stripe.com/28E6oG0UC78G53qb6sfQI08
STRIPE_LIVE_PRO_PAYMENT_LINK=https://buy.stripe.com/00w4gyfPw64C53q4I4fQI09

# TEST MODE Product IDs
STRIPE_TEST_LITE_PRODUCT_ID=prod_TkyEwmEBQW7KtE
STRIPE_TEST_LITE_PRICE_ID=price_1SnXlFCnj3EJxpv0FLDiXFvV
STRIPE_TEST_STARTER_PRODUCT_ID=prod_TkyFI73K4lj9eQ
STRIPE_TEST_STARTER_PRICE_ID=price_1SnXllCnj3EJxpv0gBt1iwU2
STRIPE_TEST_PRO_PRODUCT_ID=prod_TkyFQsyLxLU0x5
STRIPE_TEST_PRO_PRICE_ID=price_1SnXmFCnj3EJxpv0uKV42Prr

# TEST MODE Payment Links
STRIPE_TEST_LITE_PAYMENT_LINK=https://buy.stripe.com/test_9B600ibzgboW0Na4I4fQI0d
STRIPE_TEST_STARTER_PAYMENT_LINK=https://buy.stripe.com/test_5kQeVc7j00KibrOa2ofQI0e
STRIPE_TEST_PRO_PAYMENT_LINK=https://buy.stripe.com/test_7sYaEWcDk0KicvSdeAfQI0f
```

## 📋 Variable Breakdown

### Key Types

| Variable Type | Location | Purpose | Safe to Commit? |
|--------------|----------|---------|-----------------|
| `STRIPE_SECRET_KEY` | Backend | API calls | ❌ NO |
| `STRIPE_TEST_SECRET_KEY` | Backend | Test API calls | ❌ NO |
| `STRIPE_WEBHOOK_SECRET` | Backend | Verify webhooks | ❌ NO |
| `VITE_STRIPE_*_PUBLISHABLE_KEY` | Frontend | Client-side Stripe.js | ✅ Yes (public) |
| `VITE_STRIPE_MODE` | Frontend | Control test/live | ✅ Yes |
| `STRIPE_*_PRODUCT_ID` | Backend | Product references | ✅ Yes (not secret) |
| `STRIPE_*_PRICE_ID` | Backend | Price references | ✅ Yes (not secret) |
| `*_PAYMENT_LINK` | Both | Quick reference | ✅ Yes (public URLs) |

## 🔐 Security Notes

### NEVER Commit These:
- ❌ `STRIPE_SECRET_KEY` (live)
- ❌ `STRIPE_TEST_SECRET_KEY` (test)
- ❌ `STRIPE_WEBHOOK_SECRET`

These are already in `.gitignore` via `.env`

### Safe to Expose:
- ✅ Publishable keys (`pk_test_...` / `pk_live_...`)
- ✅ Payment links (they're public URLs anyway)
- ✅ Product IDs and Price IDs (not sensitive)

## 📝 Usage Examples

### In Backend API Code:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// For test mode specifically
const stripeTest = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);
```

### In Frontend Code:
```javascript
// Get current mode
const mode = import.meta.env.VITE_STRIPE_MODE; // 'test' or 'live'

// Get publishable key
const publishableKey = mode === 'live'
  ? import.meta.env.VITE_STRIPE_LIVE_PUBLISHABLE_KEY
  : import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY;
```

## 🎯 Quick Reference

### Lite Plan - $197/month
- **Live Product**: `prod_TlAu6nvTUMDMGI`
- **Live Price**: `price_1SneYWCnj3EJxpv00yk4KSRw`
- **Live Link**: https://buy.stripe.com/6oUaEWeLs9gO8fCgqMfQI07
- **Test Link**: https://buy.stripe.com/test_9B600ibzgboW0Na4I4fQI0d

### Starter Plan - $497/month
- **Live Product**: `prod_TlAuuhhGS078r5`
- **Live Price**: `price_1SneYuCnj3EJxpv0AD1sbxtq`
- **Live Link**: https://buy.stripe.com/28E6oG0UC78G53qb6sfQI08
- **Test Link**: https://buy.stripe.com/test_5kQeVc7j00KibrOa2ofQI0e

### Pro Plan - $1,337/month
- **Live Product**: `prod_TlAutSfNd8N9NP`
- **Live Price**: `price_1SneZLCnj3EJxpv0Yhg2229u`
- **Live Link**: https://buy.stripe.com/00w4gyfPw64C53q4I4fQI09
- **Test Link**: https://buy.stripe.com/test_7sYaEWcDk0KicvSdeAfQI0f

## 🔄 Switching Between Test and Live

### Option 1: Environment Variable
```bash
# In .env
VITE_STRIPE_MODE=live  # or 'test'
```

### Option 2: Mode Switcher (Ctrl+Shift+S)
- Press Ctrl+Shift+S on pricing page
- Click "Test Mode" or "Live Mode"
- Saves to localStorage
- Overrides .env setting

### Option 3: Hostname Detection
- Automatically uses 'live' on validatecall.com
- Falls back to 'test' on localhost

## ✅ Files Updated

- ✅ `market-research-ai/.env` - Frontend with all Stripe variables
- ✅ `validatecall-api/.env` - Backend with all Stripe variables
- ✅ `market-research-ai/.env.example` - Template with placeholders
- ✅ `src/pages/PricingPublic.jsx` - Payment links hardcoded

## 📚 Related Documentation

- `STRIPE_LIVE_MODE_COMPLETE.md` - Full Stripe setup summary
- `STRIPE_MODE_SWITCHER_GUIDE.md` - How to use the mode switcher
- `STRIPE_QUICK_SETUP.md` - Quick reference guide
- `PRICING_CALCULATIONS.md` - Pricing strategy and margins

---

**Last Updated**: January 9, 2026
**Status**: ✅ All Stripe environment variables configured

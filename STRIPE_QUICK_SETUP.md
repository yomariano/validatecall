# Quick Stripe Live Mode Setup

## ✅ What's Already Done

1. **Mode Switcher Component** - Press Ctrl+Shift+S on pricing page
2. **Test Mode Payment Links** - All working
3. **Environment Configuration** - `.env` set to test mode
4. **Mode Detection Logic** - Automatic switching based on hostname
5. **Visual Indicators** - Yellow badge (test) / Green badge (live)

## 🔧 What You Need to Do

### Create LIVE Mode Products (5 minutes)

1. **Open Stripe Dashboard**: https://dashboard.stripe.com
2. **Switch to LIVE mode** (toggle in top-left)
3. **Go to Products** → Click **+ Add Product**

#### Product 1: Lite
```
Name: ValidateCall Lite
Description: 100 AI research calls/month
Price: $197
Billing: Recurring Monthly
```

#### Product 2: Starter
```
Name: ValidateCall Starter
Description: 500 AI research calls/month - Most Popular
Price: $497
Billing: Recurring Monthly
```

#### Product 3: Pro
```
Name: ValidateCall Pro
Description: 2000 AI research calls/month - Best Value
Price: $1,337
Billing: Recurring Monthly
```

4. **Create Payment Links** for each product:
   - Go to **Payment Links** → **+ New**
   - Select product
   - Set redirect: `https://validatecall.com/dashboard`
   - Optional: Enable 14-day free trial
   - Click **Create link**
   - **Copy the URL**

5. **Update the code**: Open `src/pages/PricingPublic.jsx` and replace:

```javascript
live: {
  lite: "PASTE_LITE_PAYMENT_LINK_HERE",
  starter: "PASTE_STARTER_PAYMENT_LINK_HERE",
  pro: "PASTE_PRO_PAYMENT_LINK_HERE",
}
```

## 🎮 How to Use the Mode Switcher

1. Go to: http://localhost:5173/pricing
2. Press: **Ctrl+Shift+S**
3. Click: **Test Mode** or **Live Mode**
4. Page reloads with selected mode

## 📊 Current Payment Links

### TEST Mode ✅
- **Lite**: `https://buy.stripe.com/test_9B600ibzgboW0Na4I4fQI0d`
- **Starter**: `https://buy.stripe.com/test_5kQeVc7j00KibrOa2ofQI0e`
- **Pro**: `https://buy.stripe.com/test_7sYaEWcDk0KicvSdeAfQI0f`

### LIVE Mode ⏳ (Awaiting your setup)
- **Lite**: `REPLACE_WITH_YOUR_LITE_LINK`
- **Starter**: `REPLACE_WITH_YOUR_STARTER_LINK`
- **Pro**: `REPLACE_WITH_YOUR_PRO_LINK`

## 🧪 Testing

### Test Mode
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Live Mode
Use a real card (you can refund yourself afterward)

## 🚀 For Production Deployment

1. Create LIVE products (steps above)
2. Update payment links in code
3. Set `.env`: `VITE_STRIPE_MODE=live`
4. Deploy to `validatecall.com`
5. System auto-detects production hostname

## 🎯 Quick Commands

```bash
# Test the pricing page
npm run dev
# Navigate to: http://localhost:5173/pricing
# Press: Ctrl+Shift+S

# Check current mode in browser console
localStorage.getItem('stripeMode')

# Reset mode to default
localStorage.removeItem('stripeMode')
```

## 📝 Files to Update

1. **src/pages/PricingPublic.jsx** - Add live payment link URLs (line 15-18)
2. **.env** - Change to `VITE_STRIPE_MODE=live` for production

That's it! Once you add the live payment links, you'll have a fully functional mode switcher. 🎉

# Get Stripe Full Secret Key for Live Mode

## Current Issue
Your Stripe CLI is using a **restricted key** (`rk_live_...`) which cannot create products.
You need a **full secret key** (`sk_live_...`) to create products via CLI.

## Steps to Get Full Secret Key

### 1. Go to Stripe Dashboard
Visit: https://dashboard.stripe.com/apikeys

### 2. Switch to LIVE Mode
Toggle the switch in the top-left corner to **LIVE mode** (not Test mode)

### 3. Reveal or Create Secret Key

#### Option A: Reveal Existing Key
- Look for "Secret key" section
- Click **"Reveal live key token"**
- Copy the key (starts with `sk_live_...`)

#### Option B: Create New Secret Key
- Click **"Create secret key"**
- Give it a name like "CLI Access"
- Copy the key immediately (you can't see it again!)

### 4. Configure Stripe CLI

Run this command in your terminal:
```bash
stripe login --api-key sk_live_YOUR_FULL_SECRET_KEY_HERE
```

Replace `sk_live_YOUR_FULL_SECRET_KEY_HERE` with your actual secret key.

### 5. Verify Configuration
```bash
stripe config --list
```

You should see `live_mode_api_key` starting with `sk_live_` (not `rk_live_`)

### 6. Tell Me When Ready
Once you've updated the Stripe CLI configuration, let me know and I'll create all three LIVE mode products with payment links automatically!

## Security Note
⚠️ **Full secret keys have unrestricted access**. Only use them in secure environments like your local development machine. Never commit them to Git or share them publicly.

## Alternative: Manual Creation
If you prefer not to use CLI, I can guide you through creating the products manually in the Stripe Dashboard instead.

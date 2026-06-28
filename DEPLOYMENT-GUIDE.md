# 🚀 SARAH FASHIONS — COMPLETE DEPLOYMENT GUIDE
## 100% Free · Netlify + Supabase · KES 0/month

---

## 📁 YOUR PROJECT FILES (all required)

```
sarah-fashions/
├── index.html          ← entry HTML
├── package.json        ← project config
├── vite.config.js      ← build tool config
├── netlify.toml        ← Netlify deploy config
├── .gitignore          ← files to ignore
└── src/
    ├── main.jsx        ← React entry point
    └── App.jsx         ← YOUR FULL WEBSITE CODE
```

---

## STEP 1 — INSTALL NODE.JS ON YOUR COMPUTER

1. Go to https://nodejs.org
2. Click "LTS" (the green button) — download and install
3. Restart your computer after installing
4. To confirm it worked: open Command Prompt and type:
   ```
   node --version
   ```
   You should see something like: v20.11.0

---

## STEP 2 — SET UP SUPABASE (free database)

### 2a. Create Account
1. Go to https://supabase.com
2. Click "Start your project" → Sign up with GitHub or email
3. Click "New Project"
4. Fill in:
   - Name: sarah-fashions
   - Database Password: (choose strong password, WRITE IT DOWN)
   - Region: West Europe (closest free region to Kenya)
5. Click "Create new project" — wait 2 minutes

### 2b. Get Your Keys
1. In your Supabase project, click "Settings" (gear icon, left sidebar)
2. Click "API"
3. You will see two values — copy both:
   - **Project URL** — looks like: https://abcdefgh.supabase.co
   - **anon public key** — long string starting with "eyJ..."

### 2c. Paste Keys into App.jsx
Open `src/App.jsx` and find lines 4-5 at the very top:
```js
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_KEY";
```
Replace with YOUR actual values:
```js
const SUPABASE_URL = "https://abcdefgh.supabase.co";
const SUPABASE_KEY = "eyJhbGci...your full key here...";
```
Save the file.

### 2d. Create Database Tables
1. In Supabase, click "SQL Editor" (left sidebar)
2. Click "New query"
3. Copy and paste ALL of this SQL, then click "Run":

```sql
-- PRODUCTS TABLE
create table products (
  id bigserial primary key,
  name text not null,
  category text not null default 'women',
  price numeric not null,
  original_price numeric,
  description text,
  stock integer default 0,
  discount integer default 0,
  featured boolean default false,
  image_url text,
  created_at timestamptz default now()
);
alter table products enable row level security;
create policy "read products" on products for select using (true);
create policy "insert products" on products for insert with check (true);
create policy "update products" on products for update using (true) with check (true);
create policy "delete products" on products for delete using (true);

-- ORDERS TABLE
create table orders (
  id bigserial primary key,
  customer_name text not null,
  phone text not null,
  county text not null,
  town text,
  address text,
  payment text,
  mpesa_code text,
  notes text,
  items jsonb not null default '[]',
  subtotal numeric not null default 0,
  delivery_fee numeric default 0,
  status text default 'Pending',
  created_at timestamptz default now()
);
alter table orders enable row level security;
create policy "insert orders" on orders for insert with check (true);
create policy "read orders" on orders for select using (true);
create policy "update orders" on orders for update using (true) with check (true);
```

You should see "Success. No rows returned."

### 2e. Create Image Storage Bucket
1. In Supabase, click "Storage" (left sidebar)
2. Click "New bucket"
3. Name: **products** (exactly this, lowercase)
4. Check "Public bucket" ✓
5. Click "Create bucket"

---

## STEP 3 — SET UP GITHUB (free code hosting)

1. Go to https://github.com → Sign up (free)
2. Click "+" top right → "New repository"
3. Name: sarah-fashions
4. Make it **Public**
5. Click "Create repository"

Now upload your files:
1. Click "uploading an existing file" link on the page
2. Drag ALL your project files/folders into the upload area:
   - index.html
   - package.json
   - vite.config.js
   - netlify.toml
   - .gitignore
   - src/ folder (containing main.jsx and App.jsx)
3. Scroll down → click "Commit changes"

---

## STEP 4 — DEPLOY ON NETLIFY (free, commercial allowed)

1. Go to https://netlify.com → Sign up with GitHub
2. Click "Add new site" → "Import an existing project"
3. Click "GitHub"
4. Find and click your "sarah-fashions" repository
5. Netlify auto-detects the settings from netlify.toml — DO NOT change them:
   - Build command: npm run build
   - Publish directory: dist
6. Click "Deploy site"
7. Wait 2-3 minutes
8. Your website goes live at: **something.netlify.app**

### Rename your site (optional)
1. In Netlify dashboard → Site configuration → Change site name
2. Type: sarah-fashions (or sarahfashions)
3. Your URL becomes: sarah-fashions.netlify.app

---

## STEP 5 — KEEP SUPABASE ALIVE (free — prevents pausing)

Free Supabase projects pause after 7 days of no activity.
Your website already pings the database every 12 seconds when visitors are on it.
For extra protection, set up Uptime Robot:

1. Go to https://uptimerobot.com → Sign up free
2. Click "Add New Monitor"
3. Choose "HTTP(S)"
4. Friendly name: Sarah Fashions
5. URL: https://sarah-fashions.netlify.app (your Netlify URL)
6. Monitoring interval: Every 5 minutes
7. Click "Create Monitor"

This pings your site every 5 minutes → site pings Supabase → Supabase never pauses.
**Completely free. Runs forever.**

---

## STEP 6 — TEST YOUR LIVE WEBSITE

Open your Netlify URL in the browser and test:

☐ Home page loads with hero and open/closed status
☐ Click "⚙ Seller" → login with password: **sarah2024**
☐ Add a product with photo → check it appears in the shop immediately
☐ Add product to cart → checkout → place test order
☐ In Seller panel → Orders → enter delivery fee → update status
☐ Open on your phone — confirm it looks good on mobile

---

## STEP 7 — CHANGE THE SELLER PASSWORD (important!)

Open `src/App.jsx`, find line:
```js
const PASS="sarah2024";
```
Change to your own private password:
```js
const PASS="YourSecretPassword123";
```
Save → commit to GitHub → Netlify auto-redeploys in 2 minutes.

---

## SUMMARY — WHAT YOU NOW HAVE

| Feature | Details |
|---------|---------|
| Hosting | Netlify Free — sarah-fashions.netlify.app |
| Database | Supabase Free — real Postgres |
| Images | Supabase Storage Free — 1 GB |
| Monthly Cost | **KES 0** |
| Products | Added by seller, appear instantly |
| Orders | Stored in database, visible to seller |
| Delivery fee | Set by seller per order |
| Payment | M-Pesa, Cash on Delivery, Bank Transfer |
| Shop status | Auto open/closed 7am–8pm |
| Mobile | Fully responsive |
| Keep-alive | Uptime Robot pings every 5 min |

---

## COMMON PROBLEMS & FIXES

**"Build failed" on Netlify**
→ Check that App.jsx has your real Supabase URL and KEY (not the placeholder text)

**Products not showing after adding**
→ Check you ran the SQL in Step 2d. Go to Supabase → Table Editor → confirm "products" table exists

**Images not uploading**
→ Confirm your Storage bucket is named exactly "products" and is set to PUBLIC

**Site shows but database not connecting**
→ Double-check SUPABASE_URL and SUPABASE_KEY in App.jsx — no extra spaces or quotes

**Supabase project paused**
→ Go to supabase.com → your project → click "Restore project". Then set up Uptime Robot (Step 5)

---

## SELLER PANEL — HOW TO USE DAILY

1. Go to your website
2. Click "⚙ Seller" in top right
3. Enter your password
4. **Add Product**: fill name, price, stock, photo → click Publish
5. **Edit Product**: click Edit on any product → change → Save
6. **Delete Product**: click Delete → confirm
7. **View Orders**: click Orders tab → see all customer orders
8. **Set Delivery Fee**: in each order, type the KES amount → click away to save
9. **Update Status**: click Pending → Confirmed → Dispatched → Delivered

---

*Sarah Fashions · Meru Nkubu, Kenya · 0701227713*

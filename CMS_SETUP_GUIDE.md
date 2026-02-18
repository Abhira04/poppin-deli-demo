# 📋 Poppin Deli Website CMS — Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **Poppin Deli Website CMS**

---

### Step 2: Create the `status` Sheet (Tab)

Click the **+** at the bottom to add a new sheet tab, name it exactly: `status`

Add these columns in **Row 1**:

| A | B | C |
|---|---|---|
| key | value | note |

Add these rows below:

| key | value | note |
|-----|-------|------|
| vibe_status | green | green / yellow / red |
| vibe_label | Poppin Right Now | Main text shown on website |
| vibe_subtext | Walk-ins welcome! | Small text below |
| wait_time | 0 | Wait time in minutes |

---

### Step 3: Make the Sheet Public (Read-Only)

1. Click **Share** button (top right)
2. Under "General access", click the dropdown
3. Select: **Anyone with the link**
4. Make sure it says **Viewer** (not Editor!)
5. Click **Done**

---

### Step 4: Get Your Sheet ID

Look at your browser URL. It looks like:
```
https://docs.google.com/spreadsheets/d/1ABC123xyz.../edit
```

The **Sheet ID** is the long random string between `/d/` and `/edit`

Example: `1ABC123xyz...`

---

### Step 5: Add Sheet ID to Website

1. Open file: `js/lib/googleSheets.js`
2. Find this line at the top:
   ```javascript
   const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
   ```
3. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID
4. Save the file

---

## 🎯 How to Update Live Status

### Daily Updates (Super Easy!)

Open your Google Sheet → Go to `status` tab

**To show "Open & Ready":**
| key | value |
|-----|-------|
| vibe_status | green |
| vibe_label | Poppin Right Now |
| vibe_subtext | Walk-ins welcome! |

**To show "Getting Busy":**
| key | value |
|-----|-------|
| vibe_status | yellow |
| vibe_label | Getting Busy |
| vibe_subtext | Short wait expected |
| wait_time | 10 |

**To show "Packed / Closed":**
| key | value |
|-----|-------|
| vibe_status | red |
| vibe_label | Fully Packed |
| vibe_subtext | Try again in 30 mins |
| wait_time | 30 |

---

## 📱 Update from Your Phone

1. Download **Google Sheets** app
2. Open your CMS spreadsheet
3. Tap the `status` tab
4. Edit the `value` column
5. Changes reflect on website in ~5 minutes

---

## ⚠️ Important Notes

- **Don't rename columns** — the website looks for exact column names
- **Don't delete rows** — just change the values
- **Spelling matters** — use exactly `green`, `yellow`, or `red`
- **Changes take 5 minutes** — website caches data to stay fast

---

## 🆘 Need Help?

If something breaks, check:
1. Is the Sheet still shared as "Anyone with link → Viewer"?
2. Are column names exactly: `key`, `value`, `note`?
3. Is the Sheet ID correct in `googleSheets.js`?

---

## 🌟 Featured Sections Setup

To make the "Today's Special" and "Poppin' Specials" work dynamically, create these two new sheets (tabs).

### Step 1: Create `now_brewing` Sheet (Tab)
1. Add a new tab named: `now_brewing`
2. **Copy & Paste** this exact data (including headers):

| menu_item_id | label | active |
|---|---|---|
| saigon-coconut-latte | Today Only | TRUE |
| vanilla-cold-brew | 50% Off | FALSE |

*   **menu_item_id**: Must match the ID from your menu (e.g., `saigon-coconut-latte`).
*   **active**: Only set **ONE** row to `TRUE`.

---

### Step 2: Create `specials` Sheet (Tab)
1. Add a new tab named: `specials`
2. **Copy & Paste** this exact data:

| menu_item_id | tag | active |
|---|---|---|
| grilled-chicken-hummus | Must Try | TRUE |
| chicken-makhani-biryani | Chef's Kiss | TRUE |
| firecracker-burger-nv | Spicy Hit | TRUE |
| loaded-burger | Limited | FALSE |

*   **tag**: The little badge text (e.g., "Must Try").
*   **active**: Set to `TRUE` for items you want to show (max 3 recommended).

---

### Step 3: Connect to Website
1. Get the **Sheet ID** for these new sheets (it's the same ID if they are tabs in the same spreadsheet).
2. If you created a **NEW spreadsheet**, you need to add its ID to `js/lib/googleSheets.js`.
3. If you added tabs to the **existing spreadsheet**, the ID is already there! You just need to make sure the tab names are exactly `now_brewing` and `specials`.

### Step 4: Add `pillars` Sheet (Optional)
To customize the "Fresh Ingredients" section:
1. Tab name: `pillars`
2. Data:
| icon | title | description |
|---|---|---|
| 🌿 | Fresh Ingredients | Farm-to-table produce... |
| ☕ | Cozy Vibe | Your happy place... |

### Step 5: Add `reviews` Sheet (Optional)
To update customer reviews:
1. Tab name: `reviews`
2. Data:
| name | rating | text | date |
|---|---|---|---|
| Rahul S. | 5 | Amazing coffee! | 2024-12 |

**Note:** If you don't add these tabs, the website will just show the default content.

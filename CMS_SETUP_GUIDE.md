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

## 📊 Optional: Add More Sheets

You can also create these tabs for more control:

- `menu` — Update menu items and prices
- `featured` — Choose homepage featured items
- `gallery` — Update cafe photos
- `site` — Update phone, address, hours

Ask your developer to set these up when ready!

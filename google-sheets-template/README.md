# 📊 Google Sheets Template - Import Instructions

This folder contains pre-made CSV files to import into Google Sheets.

## 🚀 How to Import (2 minutes)

### Step 1: Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it: **Poppin Deli Website CMS**

### Step 2: Import Each CSV

For each file below, do:
1. Go to **File → Import**
2. Click **Upload** tab → Select the CSV file
3. Choose: **Replace current sheet** (for first file) OR **Insert new sheet** (for others)
4. Click **Import data**
5. **Rename the sheet tab** at the bottom to match the file name (without .csv)

### Files to Import:

| File | Sheet Tab Name | Purpose |
|------|---------------|---------|
| `status.csv` | `status` | Live vibe indicator |
| `menu.csv` | `menu` | Full menu database |
| `featured.csv` | `featured` | Homepage featured items |
| `site.csv` | `site` | Contact info & hours |

### Step 3: Share the Sheet
1. Click **Share** (top right)
2. Under "General access" → **Anyone with the link**
3. Set permission to **Viewer**
4. Click **Done**

### Step 4: Get Your Sheet ID
Your Google Sheet URL looks like:
```
https://docs.google.com/spreadsheets/d/1ABC123xyz.../edit
```
The Sheet ID is: `1ABC123xyz...` (the part between `/d/` and `/edit`)

### Step 5: Add to Website
Open `js/lib/googleSheets.js` and replace:
```javascript
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
```
with your actual Sheet ID.

---

## ✅ Done!

Your website will now fetch data from your Google Sheet:
- Status updates every 5 minutes
- Menu changes reflect automatically
- Owner can edit from phone using Google Sheets app

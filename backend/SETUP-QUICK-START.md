# Quick Start Guide - Spring 2026 Setup

Complete setup guide for getting your Spring 2026 data working in the dashboard.

## Prerequisites ✅

- [ ] MongoDB Atlas account with `spring2026` database
- [ ] `applications` collection imported (applicant data)
- [ ] `evals` collection imported (evaluation data)
- [ ] `.env` file configured in `backend/` folder

## Step-by-Step Setup

### 1️⃣ Create Indexes (Performance)

Creates all database indexes for fast queries:

```bash
cd backend
npm run create-indexes
```

**What it does:**
- Creates indexes on `Full Name`, `Email`, `Year`, `Major`
- Indexes evaluation ratings for sorting
- Enables text search on names
- Sets up compound indexes for complex queries

**Time:** ~30 seconds

---

### 2️⃣ Create Aggregate Collection (Required)

Builds the aggregate collection with evaluation summaries:

```bash
npm run create-aggregate
```

**What it does:**
- Groups all evaluations by applicant
- Calculates average ratings (6 categories + overall)
- Creates evaluation summaries
- Shows top performers and statistics

**Time:** ~1-2 minutes for 1000 evaluations

**Output Example:**
```
✅ Successfully inserted 154 documents into 'aggregate' collection
📊 Total evaluations processed: 931
🏆 Top 5 Applicants by Average Rating:
   1. Jane Smith: 4.83 (12 evals)
   2. John Doe: 4.67 (8 evals)
   ...
```

---

### 3️⃣ Populate eval_data (Optional but Recommended)

Adds evaluation data directly to application documents:

```bash
npm run populate-eval-data
```

**What it does:**
- Matches applications with evaluations by name
- Adds `eval_data` field to each application
- Reports name mismatches

**Time:** ~30 seconds

**Output Example:**
```
✅ Applications updated with eval_data: 154
⚠️  Applications without evaluations: 3
```

---

### 4️⃣ Setup Atlas Search (Required for Fuzzy Matching)

**Manual step in MongoDB Atlas:**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your cluster → **Search** tab
3. Click **"Create Search Index"**
4. Configure:
   - **Index Name:** `id`
   - **Database:** `spring2026`
   - **Collection:** `aggregate`
   - **Definition:**
   ```json
   {
     "mappings": {
       "dynamic": false,
       "fields": {
         "_id": {
           "type": "string",
           "analyzer": "lucene.standard"
         }
       }
     }
   }
   ```
5. Click **"Create Search Index"**
6. Wait 1-2 minutes for it to build

📖 **Detailed guide:** See `ATLAS-SEARCH-SETUP.md`

---

### 5️⃣ Restart Backend

```bash
# If backend is running, stop it (Ctrl+C) then:
npm start

# Or restart the whole dev environment from project root:
cd ..
bun run dev
```

---

### 6️⃣ Verify Everything Works

Open your browser to `http://localhost:3000` and check:

- [ ] Dashboard shows applicants with evaluation counts
- [ ] No red borders on applicants with evaluations
- [ ] Clicking an applicant shows their details
- [ ] Evaluation cards display with ratings and comments
- [ ] Search works in the dashboard

---

## One-Command Setup 🚀

Run all scripts in sequence:

```bash
cd backend
npm run setup-all
```

This runs:
1. `create-indexes.js`
2. `create-aggregate.js`
3. `populate-eval-data.js`

**Note:** You still need to manually set up Atlas Search (Step 4)

---

## Troubleshooting

### ❌ "No evaluations found"

**Problem:** The `evals` collection is empty or not imported.

**Solution:**
```bash
# Check if evals exist
node test-db.js

# Import your evals data to MongoDB
```

---

### ⚠️ "Applications without evaluations: 50"

**Problem:** Name mismatch between `applications` and `evals` collections.

**Solution:**
1. Check name formatting in both collections
2. Look for extra spaces, different formats (First Last vs Last, First)
3. Update names in `evals` collection to match `applications`

**Example fix in MongoDB:**
```javascript
// Find mismatched names
db.evals.distinct("applicant")
db.applications.distinct("Full Name")

// Fix a name
db.evals.updateMany(
  { applicant: "John  Doe" },  // Extra space
  { $set: { applicant: "John Doe" } }
)

// Re-run the scripts
npm run create-aggregate
npm run populate-eval-data
```

---

### 🔍 "Fuzzy search not working"

**Problem:** Atlas Search index not created or not active.

**Solution:**
1. Go to MongoDB Atlas → Search tab
2. Check if `id` index exists and status is "Active"
3. If not, create it (see Step 4 above)
4. Wait 1-2 minutes for it to build
5. Test in Atlas Query Tester first

---

### 💥 "Index already exists" error

**Problem:** Running `create-indexes.js` when indexes already exist.

**Solution:** This is usually fine! The script will skip existing indexes. If you need to recreate:

```javascript
// In MongoDB shell or Compass
db.applications.dropIndexes()  // Keeps _id index
db.evals.dropIndexes()
db.aggregate.dropIndexes()

// Then re-run
npm run create-indexes
```

---

## File Reference

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `create-indexes.js` | Database performance | Once per database |
| `create-aggregate.js` | Build aggregate collection | After importing evals |
| `populate-eval-data.js` | Add eval_data to apps | After importing evals |
| `test-db.js` | Check database connection | Anytime for debugging |

## Documentation Reference

| File | Description |
|------|-------------|
| `SETUP-QUICK-START.md` | This file - quick setup guide |
| `AGGREGATION-GUIDE.md` | Detailed aggregation explanation |
| `ATLAS-SEARCH-SETUP.md` | Atlas Search configuration |
| `README.md` | Backend API documentation |

---

## Need Help?

Common issues and solutions:

1. **Connection errors** → Check `.env` file has correct `MONGODB_URI`
2. **No data** → Import `applications` and `evals` collections first
3. **Name mismatches** → See "Applications without evaluations" section above
4. **Slow queries** → Make sure indexes are created (Step 1)
5. **Search not working** → Set up Atlas Search (Step 4)

---

## Success Checklist ✅

After setup, you should have:

- [x] All indexes created (15+ indexes across 3 collections)
- [x] `aggregate` collection populated with evaluation summaries
- [x] `applications` collection has `eval_data` fields
- [x] Atlas Search index `id` is Active
- [x] Backend running without errors
- [x] Dashboard showing applicants with eval counts
- [x] Applicant detail pages showing evaluations

**You're ready to go! 🎉**

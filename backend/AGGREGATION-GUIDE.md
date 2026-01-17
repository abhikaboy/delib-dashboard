# Evaluation Data Aggregation Guide

This guide explains how to populate evaluation data for your applicants in the Spring 2026 database.

## Overview

Your system has three collections:
- **`applications`** - Applicant information and application responses
- **`evals`** - Individual evaluation records from brothers
- **`aggregate`** - Pre-computed evaluation summaries per applicant

## Two Approaches

You can use **either or both** of these approaches:

### Approach 1: Create Aggregate Collection (Recommended)
Creates a separate `aggregate` collection with pre-computed evaluation data. The frontend uses fuzzy search to match applicants with their evaluations.

**Pros:**
- Keeps data separated and clean
- Better for fuzzy name matching
- Easier to rebuild/refresh

**Cons:**
- Requires MongoDB Atlas Search index for best results
- Data is in a separate collection

### Approach 2: Populate eval_data in Applications
Directly adds `eval_data` field to each application document.

**Pros:**
- All data in one place
- Faster queries (no separate lookup needed)
- Works without Atlas Search

**Cons:**
- Duplicates data
- Harder to update when new evaluations come in

## Running the Scripts

### Prerequisites

1. Make sure your `.env` file is configured:
```bash
cd backend
cat .env  # Verify MONGODB_URI and DATABASE_NAME are set
```

2. Ensure you have imported your data:
   - `applications` collection has applicant data
   - `evals` collection has evaluation data

### Option 1: Create Aggregate Collection

```bash
cd backend
npm run create-aggregate
# or
node create-aggregate.js
```

**What it does:**
1. Groups all evaluations by applicant name
2. Calculates average ratings for each category:
   - Professional
   - Willingness
   - Brotherhood
   - Teamwork
   - Contribution (Personal)
   - Contribution (AKPsi)
3. Calculates overall average rating
4. Stores all individual evaluations for each applicant
5. Creates the `aggregate` collection with this data

**Output:**
```
✅ Successfully inserted 154 documents into 'aggregate' collection
📊 Statistics:
   Total applicants with evaluations: 154
   Total evaluations processed: 931
   Average evaluations per applicant: 6.0
```

### Option 2: Populate eval_data in Applications

```bash
cd backend
npm run populate-eval-data
# or
node populate-eval-data.js
```

**What it does:**
1. Aggregates evaluations by applicant name
2. Matches each application with their evaluations
3. Updates the application document with an `eval_data` field
4. Reports any applicants without evaluations

**Output:**
```
✅ Applications updated with eval_data: 154
⚠️  Applications without evaluations: 0
```

## Data Structure

### Aggregate Collection Document
```json
{
  "_id": "John Doe",
  "evals": 8,
  "avg_rating": 4.25,
  "averageScore": 4.25,
  "avg_professional": 4.5,
  "avg_willingness": 4.3,
  "avg_brotherhood": 4.0,
  "avg_teamwork": 4.2,
  "avg_contribution_personal": 4.4,
  "avg_contribution_akpsi": 4.1,
  "data": [
    {
      "_id": "...",
      "Timestamp": "2026-01-15T14:30:00.000Z",
      "brother_name": "Jane Smith",
      "applicant": "John Doe",
      "Event": "Coffee Chat",
      "professional": 5,
      "willingness": 4,
      "brotherhood": 4,
      "teamwork": 4,
      "contribution_personal": 5,
      "contribution_akpsi": 4,
      "comment": "Great candidate..."
    }
    // ... more evaluations
  ]
}
```

### Application with eval_data
```json
{
  "_id": "...",
  "Full Name": "John Doe",
  "Northeastern Email": "doe.j@northeastern.edu",
  // ... other application fields
  "eval_data": {
    "_id": "John Doe",
    "evals": 8,
    "avg_rating": 4.25,
    "averageScore": 4.25,
    "data": [/* array of evaluations */]
  }
}
```

## Troubleshooting

### Name Mismatches

If applicants show "0 evaluations" but you know they have evals:

1. **Check name formatting:**
   ```bash
   # In applications collection
   "Full Name": "John Doe"
   
   # In evals collection
   "applicant": "John  Doe"  # Extra space!
   # or
   "applicant": "Doe, John"  # Different format!
   ```

2. **Run a comparison query in MongoDB:**
   ```javascript
   // Get unique applicant names from evals
   db.evals.distinct("applicant")
   
   // Get unique names from applications
   db.applications.distinct("Full Name")
   ```

3. **Fix mismatches** by updating the evals collection:
   ```javascript
   db.evals.updateMany(
     { applicant: "John  Doe" },  // Wrong name
     { $set: { applicant: "John Doe" } }  // Correct name
   )
   ```

### Re-running Scripts

Both scripts are **safe to re-run**:
- `create-aggregate.js` clears the aggregate collection before inserting
- `populate-eval-data.js` overwrites existing eval_data fields

To refresh data after adding new evaluations:
```bash
npm run create-aggregate
# and/or
npm run populate-eval-data
```

## MongoDB Atlas Search (Optional)

For better fuzzy matching in the `aggregate` collection:

1. Go to MongoDB Atlas → Your Cluster → Search
2. Create a new Search Index on the `aggregate` collection
3. Index name: `id`
4. Index definition:
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "_id": {
        "type": "string"
      }
    }
  }
}
```

This enables the fuzzy search endpoint to find applicants even with slight name variations.

## Verification

After running the scripts, verify in your application:

1. **Dashboard View:**
   - Applicants should no longer have red borders (if they have evaluations)
   - Each card should show the number of evaluations

2. **Applicant Detail Page:**
   - Should show evaluation cards with comments
   - Should display average ratings
   - Rating bars should be populated

3. **MongoDB:**
   ```javascript
   // Check aggregate collection
   db.aggregate.countDocuments()
   
   // Check applications with eval_data
   db.applications.countDocuments({ eval_data: { $exists: true } })
   ```

## Questions?

- **Which approach should I use?** → Use **both** for maximum compatibility
- **How often should I run these?** → After importing new evaluation data
- **What if names don't match?** → See "Name Mismatches" section above
- **Can I automate this?** → Yes, you could add these as API endpoints or scheduled jobs

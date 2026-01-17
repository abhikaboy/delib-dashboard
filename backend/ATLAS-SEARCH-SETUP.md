# MongoDB Atlas Search Setup Guide

MongoDB Atlas Search provides advanced full-text search capabilities with fuzzy matching, which is perfect for finding applicants even when names don't match exactly.

## Why Atlas Search?

Regular text indexes are good, but Atlas Search is better for:
- **Fuzzy matching** - Finds "Jon Doe" when searching for "John Doe"
- **Typo tolerance** - Handles common misspellings
- **Relevance scoring** - Returns best matches first
- **Better performance** - Optimized for search queries

## Setup Instructions

### 1. Access MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Select your cluster (e.g., "delib")

### 2. Navigate to Search

1. Click on your cluster name
2. Click the **"Search"** tab (next to Collections, Metrics, etc.)
3. Click **"Create Search Index"**

### 3. Create Search Index for Aggregate Collection

This is the most important index for the fuzzy search feature.

#### Configuration:

**Index Name:** `id`

**Database:** `spring2026` (or your database name)

**Collection:** `aggregate`

**Index Definition (JSON Editor):**
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "_id": {
        "type": "string",
        "analyzer": "lucene.standard",
        "searchAnalyzer": "lucene.standard"
      }
    }
  }
}
```

**Visual Editor Settings:**
- Field name: `_id`
- Data type: String
- Enable: ✅ (checked)
- Index Analyzer: lucene.standard
- Search Analyzer: lucene.standard

Click **"Create Search Index"**

⏱️ **Wait 1-2 minutes** for the index to build.

### 4. Create Search Index for Applications Collection (Optional)

For better applicant search in the dashboard.

**Index Name:** `applicants`

**Database:** `spring2026`

**Collection:** `applications`

**Index Definition:**
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "Full Name": {
        "type": "string",
        "analyzer": "lucene.standard",
        "searchAnalyzer": "lucene.standard"
      },
      "Northeastern Email": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "Major": {
        "type": "string"
      },
      "Year": {
        "type": "string"
      }
    }
  }
}
```

### 5. Create Search Index for Evals Collection (Optional)

For searching evaluations by applicant or brother name.

**Index Name:** `evaluations`

**Database:** `spring2026`

**Collection:** `evals`

**Index Definition:**
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "applicant": {
        "type": "string",
        "analyzer": "lucene.standard",
        "searchAnalyzer": "lucene.standard"
      },
      "brother_name": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "Event": {
        "type": "string"
      },
      "comment": {
        "type": "string",
        "analyzer": "lucene.english"
      }
    }
  }
}
```

## Verify Search Indexes

1. In Atlas, go to **Search** tab
2. You should see your indexes with status: **"Active"**
3. Click on an index to see statistics (documents indexed, etc.)

## Test the Fuzzy Search

You can test the search directly in MongoDB Atlas:

1. Click on your `id` search index in the `aggregate` collection
2. Click **"Query"** or **"Search Tester"**
3. Try this query:
```json
{
  "index": "id",
  "text": {
    "query": "John Doe",
    "path": "_id",
    "fuzzy": {
      "maxEdits": 2
    }
  }
}
```

This should find "John Doe" even if you search for "Jon Do" or "Jhon Doe".

## Using Search in Your Application

The backend is already configured to use Atlas Search! The endpoint:

```
GET /api/applications/:id/fuzzy-evals
```

Uses this aggregation pipeline:
```javascript
{
  '$search': {
    'index': 'id', 
    'text': {
      'query': applicantName, 
      'path': '_id'
    }
  }
}
```

## Advanced: Custom Analyzers (Optional)

For even better name matching, you can create a custom analyzer:

```json
{
  "analyzer": "customNameAnalyzer",
  "charFilters": [],
  "tokenizer": {
    "type": "standard"
  },
  "tokenFilters": [
    {
      "type": "lowercase"
    },
    {
      "type": "asciiFolding"
    }
  ]
}
```

This handles:
- Case insensitivity (John = john)
- Accent removal (José = Jose)
- Special characters

## Troubleshooting

### Index Not Working?

1. **Check Status**: Make sure index status is "Active" (not "Building" or "Failed")
2. **Wait**: Indexes can take 1-2 minutes to build
3. **Rebuild**: Delete and recreate the index if it failed

### No Results from Fuzzy Search?

1. **Check Index Name**: Must be exactly `id` (case-sensitive)
2. **Check Path**: Must be `_id` in the search query
3. **Check Data**: Make sure `aggregate` collection has data
4. **Test in Atlas**: Use the Query Tester to verify

### Search Returns Wrong Results?

1. **Adjust Fuzzy Settings**: Reduce `maxEdits` from 2 to 1
2. **Use Different Analyzer**: Try `lucene.keyword` for exact matches
3. **Add Scoring**: Boost exact matches higher than fuzzy matches

## Performance Considerations

- **Index Size**: Search indexes add ~10-20% to collection size
- **Build Time**: Initial build takes 1-2 minutes per 1000 documents
- **Query Speed**: Atlas Search queries are typically 10-50ms
- **Updates**: Indexes update automatically (within seconds)

## Cost

Atlas Search is included in:
- ✅ M10+ clusters (free tier M0 has limited search)
- ✅ All paid tiers
- ❌ Not available on free M0 clusters (use regular text indexes instead)

## Alternative: Regular Text Indexes

If you can't use Atlas Search (free tier), the `create-indexes.js` script already created regular text indexes that work for basic search:

```javascript
// Already created by create-indexes.js
db.aggregate.createIndex({ "_id": "text" })
```

Use with:
```javascript
db.aggregate.find({ $text: { $search: "John Doe" } })
```

This doesn't have fuzzy matching, but works for exact word matches.

## Summary

**Required:**
- ✅ `id` index on `aggregate` collection → Enables fuzzy eval search

**Optional but Recommended:**
- 📋 `applicants` index on `applications` collection → Better applicant search
- 📊 `evaluations` index on `evals` collection → Search within evaluations

**Already Done:**
- ✅ Regular indexes (from `create-indexes.js`)
- ✅ Backend code configured to use Atlas Search
- ✅ Frontend ready to display fuzzy search results

## Next Steps

1. ✅ Create the `id` search index (required)
2. 🧪 Test fuzzy search in your application
3. 📊 Monitor search performance in Atlas
4. 🎯 Optionally create additional search indexes

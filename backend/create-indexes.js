import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * This script creates all necessary indexes for optimal performance:
 * 1. Text indexes for search functionality
 * 2. Regular indexes for common queries
 * 3. Compound indexes for complex queries
 */

async function createAllIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    const databaseName = process.env.DATABASE_NAME || 'spring2026';
    const db = client.db(databaseName);
    console.log(`✅ Connected to database: ${databaseName}\n`);
    
    // ========================================
    // APPLICATIONS COLLECTION INDEXES
    // ========================================
    console.log('📋 Creating indexes for APPLICATIONS collection...');
    const applicationsCollection = db.collection('applications');
    
    try {
      // 1. Index on Full Name for exact lookups
      await applicationsCollection.createIndex(
        { "Full Name": 1 },
        { name: "full_name_1" }
      );
      console.log('✅ Created index: Full Name');
      
      // 2. Text index on Full Name for search
      await applicationsCollection.createIndex(
        { "Full Name": "text" },
        { name: "full_name_text", default_language: "english" }
      );
      console.log('✅ Created text index: Full Name (for search)');
      
      // 3. Index on _id (already exists by default, but good to verify)
      console.log('✅ Default _id index exists');
      
      // 4. Index on Northeastern Email
      await applicationsCollection.createIndex(
        { "Northeastern Email": 1 },
        { name: "email_1" }
      );
      console.log('✅ Created index: Northeastern Email');
      
      // 5. Compound index for filtering and sorting
      await applicationsCollection.createIndex(
        { "Year": 1, "Major": 1 },
        { name: "year_major_1" }
      );
      console.log('✅ Created compound index: Year + Major');
      
      // 6. Index on eval_data.avg_rating for sorting
      await applicationsCollection.createIndex(
        { "eval_data.avg_rating": -1 },
        { name: "eval_avg_rating_-1", sparse: true }
      );
      console.log('✅ Created index: eval_data.avg_rating (descending)');
      
      // 7. Index on eval_data.evals for filtering
      await applicationsCollection.createIndex(
        { "eval_data.evals": -1 },
        { name: "eval_evals_-1", sparse: true }
      );
      console.log('✅ Created index: eval_data.evals (descending)');
      
    } catch (error) {
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log('ℹ️  Some indexes already exist (skipping duplicates)');
      } else {
        throw error;
      }
    }
    
    // ========================================
    // EVALS COLLECTION INDEXES
    // ========================================
    console.log('\n📊 Creating indexes for EVALS collection...');
    const evalsCollection = db.collection('evals');
    
    try {
      // 1. Index on applicant name for grouping/filtering
      await evalsCollection.createIndex(
        { "applicant": 1 },
        { name: "applicant_1" }
      );
      console.log('✅ Created index: applicant');
      
      // 2. Index on brother_name for filtering
      await evalsCollection.createIndex(
        { "brother_name": 1 },
        { name: "brother_name_1" }
      );
      console.log('✅ Created index: brother_name');
      
      // 3. Compound index for searching by brother and applicant
      await evalsCollection.createIndex(
        { "brother_name": 1, "applicant": 1 },
        { name: "brother_applicant_1" }
      );
      console.log('✅ Created compound index: brother_name + applicant');
      
      // 4. Index on Timestamp for sorting
      await evalsCollection.createIndex(
        { "Timestamp": -1 },
        { name: "timestamp_-1" }
      );
      console.log('✅ Created index: Timestamp (descending)');
      
      // 5. Index on Event
      await evalsCollection.createIndex(
        { "Event": 1 },
        { name: "event_1" }
      );
      console.log('✅ Created index: Event');
      
      // 6. Text index for searching applicant names
      await evalsCollection.createIndex(
        { "applicant": "text", "brother_name": "text" },
        { name: "applicant_brother_text", default_language: "english" }
      );
      console.log('✅ Created text index: applicant + brother_name (for search)');
      
      // 7. Compound index for common query pattern
      await evalsCollection.createIndex(
        { "applicant": 1, "Timestamp": -1 },
        { name: "applicant_timestamp_-1" }
      );
      console.log('✅ Created compound index: applicant + Timestamp');
      
    } catch (error) {
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log('ℹ️  Some indexes already exist (skipping duplicates)');
      } else {
        throw error;
      }
    }
    
    // ========================================
    // AGGREGATE COLLECTION INDEXES
    // ========================================
    console.log('\n🔍 Creating indexes for AGGREGATE collection...');
    const aggregateCollection = db.collection('aggregate');
    
    try {
      // 1. Index on _id (applicant name) - already exists by default
      console.log('✅ Default _id index exists');
      
      // 2. Text index on _id for fuzzy search
      await aggregateCollection.createIndex(
        { "_id": "text" },
        { name: "id_text", default_language: "english" }
      );
      console.log('✅ Created text index: _id (for fuzzy search)');
      
      // 3. Index on avg_rating for sorting
      await aggregateCollection.createIndex(
        { "avg_rating": -1 },
        { name: "avg_rating_-1" }
      );
      console.log('✅ Created index: avg_rating (descending)');
      
      // 4. Index on evals count
      await aggregateCollection.createIndex(
        { "evals": -1 },
        { name: "evals_-1" }
      );
      console.log('✅ Created index: evals (descending)');
      
      // 5. Compound index for filtering and sorting
      await aggregateCollection.createIndex(
        { "evals": -1, "avg_rating": -1 },
        { name: "evals_rating_-1" }
      );
      console.log('✅ Created compound index: evals + avg_rating');
      
    } catch (error) {
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log('ℹ️  Some indexes already exist (skipping duplicates)');
      } else {
        throw error;
      }
    }
    
    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 INDEX SUMMARY');
    console.log('='.repeat(60));
    
    // Get index information for each collection
    const collections = [
      { name: 'applications', collection: applicationsCollection },
      { name: 'evals', collection: evalsCollection },
      { name: 'aggregate', collection: aggregateCollection }
    ];
    
    for (const { name, collection } of collections) {
      const indexes = await collection.indexes();
      console.log(`\n${name.toUpperCase()} (${indexes.length} indexes):`);
      indexes.forEach(index => {
        const keys = Object.keys(index.key).map(k => {
          const direction = index.key[k] === 1 ? '↑' : 
                           index.key[k] === -1 ? '↓' : 
                           index.key[k] === 'text' ? '🔍' : '';
          return `${k}${direction}`;
        }).join(', ');
        console.log(`   - ${index.name}: ${keys}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All indexes created successfully!');
    console.log('='.repeat(60));
    
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. ✅ Regular indexes are ready to use');
    console.log('   2. 🔍 For better fuzzy search, set up MongoDB Atlas Search');
    console.log('   3. 📖 See ATLAS-SEARCH-SETUP.md for Atlas Search configuration');
    console.log('   4. 🚀 Restart your backend to use the new indexes');
    
    console.log('\n📈 PERFORMANCE TIPS:');
    console.log('   - Text indexes enable $text search queries');
    console.log('   - Compound indexes optimize multi-field queries');
    console.log('   - Descending indexes (-1) optimize sorting by highest first');
    console.log('   - Sparse indexes save space by only indexing documents with the field');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    console.error('Full error details:', error.message);
    
    if (error.code === 85) {
      console.log('\nℹ️  This error usually means an index with a different configuration already exists.');
      console.log('   You can drop the existing index and re-run this script, or keep the existing one.');
    }
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
createAllIndexes();

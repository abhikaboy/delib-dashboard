import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * This script creates the 'aggregate' collection by:
 * 1. Grouping evaluations by applicant name
 * 2. Calculating average ratings for each applicant
 * 3. Collecting all evaluation details
 * 4. Creating a comprehensive document for each applicant
 */

async function createAggregateCollection() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    const databaseName = process.env.DATABASE_NAME || 'spring2026';
    const db = client.db(databaseName);
    console.log(`✅ Connected to database: ${databaseName}`);
    
    // Collections
    const evalsCollection = db.collection('evals');
    const aggregateCollection = db.collection('aggregate');
    
    // Check if evals collection has data
    const evalsCount = await evalsCollection.countDocuments();
    console.log(`📊 Found ${evalsCount} evaluations in 'evals' collection`);
    
    if (evalsCount === 0) {
      console.log('⚠️  No evaluations found. Please import your evals data first.');
      return;
    }
    
    console.log('\n🔄 Running aggregation pipeline...');
    
    // Aggregation pipeline to group and calculate
    const pipeline = [
      // Stage 1: Group by applicant name
      {
        $group: {
          _id: '$applicant', // Group by applicant name
          evals: { $sum: 1 }, // Count number of evaluations
          
          // Calculate average for each rating category
          avg_professional: { $avg: '$professional' },
          avg_willingness: { $avg: '$willingness' },
          avg_brotherhood: { $avg: '$brotherhood' },
          avg_teamwork: { $avg: '$teamwork' },
          avg_contribution_personal: { $avg: '$contribution_personal' },
          avg_contribution_akpsi: { $avg: '$contribution_akpsi' },
          
          // Collect all evaluation documents
          data: {
            $push: {
              _id: '$_id',
              Timestamp: '$Timestamp',
              brother_name: '$brother_name',
              applicant: '$applicant',
              Event: '$Event',
              professional: '$professional',
              willingness: '$willingness',
              brotherhood: '$brotherhood',
              teamwork: '$teamwork',
              contribution_personal: '$contribution_personal',
              contribution_akpsi: '$contribution_akpsi',
              comment: '$comment'
            }
          }
        }
      },
      
      // Stage 2: Calculate overall average rating
      {
        $addFields: {
          avg_rating: {
            $avg: [
              '$avg_professional',
              '$avg_willingness',
              '$avg_brotherhood',
              '$avg_teamwork',
              '$avg_contribution_personal',
              '$avg_contribution_akpsi'
            ]
          },
          averageScore: {
            $avg: [
              '$avg_professional',
              '$avg_willingness',
              '$avg_brotherhood',
              '$avg_teamwork',
              '$avg_contribution_personal',
              '$avg_contribution_akpsi'
            ]
          }
        }
      },
      
      // Stage 3: Project final structure
      {
        $project: {
          _id: 1,
          evals: 1,
          avg_rating: { $round: ['$avg_rating', 2] },
          averageScore: { $round: ['$averageScore', 2] },
          avg_professional: { $round: ['$avg_professional', 2] },
          avg_willingness: { $round: ['$avg_willingness', 2] },
          avg_brotherhood: { $round: ['$avg_brotherhood', 2] },
          avg_teamwork: { $round: ['$avg_teamwork', 2] },
          avg_contribution_personal: { $round: ['$avg_contribution_personal', 2] },
          avg_contribution_akpsi: { $round: ['$avg_contribution_akpsi', 2] },
          data: 1
        }
      },
      
      // Stage 4: Sort by average rating (highest first)
      {
        $sort: { avg_rating: -1 }
      }
    ];
    
    // Execute aggregation
    const results = await evalsCollection.aggregate(pipeline).toArray();
    
    console.log(`✨ Aggregation complete! Found ${results.length} unique applicants`);
    
    if (results.length > 0) {
      console.log('\n📋 Sample aggregated data:');
      console.log(JSON.stringify(results[0], null, 2));
    }
    
    // Clear existing aggregate collection
    console.log('\n🗑️  Clearing existing aggregate collection...');
    await aggregateCollection.deleteMany({});
    
    // Insert aggregated results
    console.log('💾 Inserting aggregated data into aggregate collection...');
    if (results.length > 0) {
      await aggregateCollection.insertMany(results);
      console.log(`✅ Successfully inserted ${results.length} documents into 'aggregate' collection`);
    }
    
    // Create index on _id for fuzzy search
    console.log('\n🔍 Creating search index on _id field...');
    try {
      await aggregateCollection.createIndex({ _id: 'text' });
      console.log('✅ Text index created successfully');
    } catch (error) {
      console.log('ℹ️  Index might already exist or Atlas Search should be configured manually');
    }
    
    // Show statistics
    console.log('\n📊 Statistics:');
    console.log(`   Total applicants with evaluations: ${results.length}`);
    console.log(`   Total evaluations processed: ${evalsCount}`);
    console.log(`   Average evaluations per applicant: ${(evalsCount / results.length).toFixed(1)}`);
    
    // Show top 5 applicants
    console.log('\n🏆 Top 5 Applicants by Average Rating:');
    results.slice(0, 5).forEach((applicant, index) => {
      console.log(`   ${index + 1}. ${applicant._id}: ${applicant.avg_rating} (${applicant.evals} evals)`);
    });
    
    // Show applicants with few evaluations
    const fewEvals = results.filter(a => a.evals < 3).length;
    if (fewEvals > 0) {
      console.log(`\n⚠️  ${fewEvals} applicant(s) have fewer than 3 evaluations`);
    }
    
    console.log('\n✅ Aggregate collection created successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. The aggregate collection is now ready to use');
    console.log('   2. The frontend will automatically use this data via fuzzy search');
    console.log('   3. For better search, configure MongoDB Atlas Search index on the _id field');
    
  } catch (error) {
    console.error('❌ Error creating aggregate collection:', error);
    console.error('Full error details:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
createAggregateCollection();

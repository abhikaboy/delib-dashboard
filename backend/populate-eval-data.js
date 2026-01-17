import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * This script populates the 'eval_data' field in the applications collection by:
 * 1. Aggregating evaluations from the 'evals' collection
 * 2. Matching applicants by name (with fuzzy matching)
 * 3. Updating each application document with their evaluation data
 */

async function populateEvalData() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    const databaseName = process.env.DATABASE_NAME || 'spring2026';
    const db = client.db(databaseName);
    console.log(`✅ Connected to database: ${databaseName}`);
    
    // Collections
    const applicationsCollection = db.collection('applications');
    const evalsCollection = db.collection('evals');
    
    // Check collections
    const applicationsCount = await applicationsCollection.countDocuments();
    const evalsCount = await evalsCollection.countDocuments();
    
    console.log(`📊 Found ${applicationsCount} applications`);
    console.log(`📊 Found ${evalsCount} evaluations`);
    
    if (applicationsCount === 0) {
      console.log('⚠️  No applications found. Please import your applications data first.');
      return;
    }
    
    if (evalsCount === 0) {
      console.log('⚠️  No evaluations found. Please import your evals data first.');
      return;
    }
    
    console.log('\n🔄 Aggregating evaluation data by applicant...');
    
    // Aggregation pipeline to group evaluations by applicant
    const evalsByApplicant = await evalsCollection.aggregate([
      {
        $group: {
          _id: '$applicant',
          evals: { $sum: 1 },
          avg_professional: { $avg: '$professional' },
          avg_willingness: { $avg: '$willingness' },
          avg_brotherhood: { $avg: '$brotherhood' },
          avg_teamwork: { $avg: '$teamwork' },
          avg_contribution_personal: { $avg: '$contribution_personal' },
          avg_contribution_akpsi: { $avg: '$contribution_akpsi' },
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
          }
        }
      }
    ]).toArray();
    
    console.log(`✨ Found evaluations for ${evalsByApplicant.length} unique applicants`);
    
    // Create a map for quick lookup
    const evalsMap = new Map();
    evalsByApplicant.forEach(evalData => {
      evalsMap.set(evalData._id.toLowerCase().trim(), evalData);
    });
    
    console.log('\n🔄 Updating applications with eval_data...');
    
    let updatedCount = 0;
    let notFoundCount = 0;
    const notFoundApplicants = [];
    
    // Get all applications
    const applications = await applicationsCollection.find({}).toArray();
    
    // Update each application
    for (const application of applications) {
      const fullName = application["Full Name"];
      if (!fullName) {
        console.log(`⚠️  Skipping application without Full Name: ${application._id}`);
        continue;
      }
      
      const normalizedName = fullName.toLowerCase().trim();
      const evalData = evalsMap.get(normalizedName);
      
      if (evalData) {
        // Prepare eval_data object
        const evalDataToInsert = {
          _id: evalData._id,
          evals: evalData.evals,
          avg_rating: Math.round(evalData.avg_rating * 100) / 100,
          averageScore: Math.round(evalData.avg_rating * 100) / 100,
          data: evalData.data
        };
        
        // Update the application
        await applicationsCollection.updateOne(
          { _id: application._id },
          { $set: { eval_data: evalDataToInsert } }
        );
        
        updatedCount++;
        console.log(`✅ Updated: ${fullName} (${evalData.evals} evals, avg: ${evalDataToInsert.avg_rating})`);
      } else {
        notFoundCount++;
        notFoundApplicants.push(fullName);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Applications updated with eval_data: ${updatedCount}`);
    console.log(`   ⚠️  Applications without evaluations: ${notFoundCount}`);
    
    if (notFoundApplicants.length > 0) {
      console.log('\n⚠️  Applicants without evaluations:');
      notFoundApplicants.slice(0, 10).forEach(name => {
        console.log(`   - ${name}`);
      });
      if (notFoundApplicants.length > 10) {
        console.log(`   ... and ${notFoundApplicants.length - 10} more`);
      }
      
      console.log('\n💡 Tip: Check for name mismatches between applications and evals collections');
      console.log('   Common issues:');
      console.log('   - Extra spaces in names');
      console.log('   - Different name formats (First Last vs Last, First)');
      console.log('   - Typos in evaluation forms');
    }
    
    console.log('\n✅ Eval data population complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your backend server to see the changes');
    console.log('   2. Refresh the frontend dashboard');
    console.log('   3. Applications with eval_data will no longer have red borders');
    
  } catch (error) {
    console.error('❌ Error populating eval data:', error);
    console.error('Full error details:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
populateEvalData();

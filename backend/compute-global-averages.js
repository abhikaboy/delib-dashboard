import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * This script computes global averages from all evaluations
 * These averages are used as comparison benchmarks in the applicant detail page
 */

async function computeGlobalAverages() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    const databaseName = process.env.DATABASE_NAME || 'spring2026';
    const db = client.db(databaseName);
    console.log(`✅ Connected to database: ${databaseName}\n`);
    
    const evalsCollection = db.collection('evals');
    
    // Check if evals collection has data
    const evalsCount = await evalsCollection.countDocuments();
    console.log(`📊 Found ${evalsCount} evaluations in 'evals' collection`);
    
    if (evalsCount === 0) {
      console.log('⚠️  No evaluations found. Please import your evals data first.');
      return;
    }
    
    console.log('\n🔄 Computing global averages...\n');
    
    // Aggregation pipeline to compute averages
    const pipeline = [
      {
        $group: {
          _id: null,
          avg_professional: { $avg: '$professional' },
          avg_willingness: { $avg: '$willingness' },
          avg_brotherhood: { $avg: '$brotherhood' },
          avg_teamwork: { $avg: '$teamwork' },
          avg_contribution_personal: { $avg: '$contribution_personal' },
          avg_contribution_akpsi: { $avg: '$contribution_akpsi' },
          count: { $sum: 1 }
        }
      }
    ];
    
    const results = await evalsCollection.aggregate(pipeline).toArray();
    
    if (results.length === 0) {
      console.log('❌ No results from aggregation');
      return;
    }
    
    const averages = results[0];
    
    // Calculate overall average
    const overall = (
      averages.avg_professional +
      averages.avg_willingness +
      averages.avg_brotherhood +
      averages.avg_teamwork +
      averages.avg_contribution_personal +
      averages.avg_contribution_akpsi
    ) / 6;
    
    // Calculate combined contribution average
    const contribution = (
      averages.avg_contribution_personal +
      averages.avg_contribution_akpsi
    ) / 2;
    
    console.log('📊 GLOBAL AVERAGES');
    console.log('='.repeat(60));
    console.log(`Based on ${averages.count} evaluations:\n`);
    console.log(`Professional:              ${averages.avg_professional.toFixed(15)}`);
    console.log(`Willingness:               ${averages.avg_willingness.toFixed(15)}`);
    console.log(`Brotherhood:               ${averages.avg_brotherhood.toFixed(15)}`);
    console.log(`Teamwork:                  ${averages.avg_teamwork.toFixed(15)}`);
    console.log(`Contribution (Personal):   ${averages.avg_contribution_personal.toFixed(15)}`);
    console.log(`Contribution (AKPsi):      ${averages.avg_contribution_akpsi.toFixed(15)}`);
    console.log(`\nOverall Average:           ${overall.toFixed(15)}`);
    console.log(`Combined Contribution:     ${contribution.toFixed(15)}`);
    console.log('='.repeat(60));
    
    console.log('\n📝 CODE TO UPDATE IN ApplicantDetailPage.tsx:');
    console.log('='.repeat(60));
    console.log('\nReplace the GLOBAL_AVERAGES object with:\n');
    console.log('const GLOBAL_AVERAGES = {');
    console.log(`  professional: ${averages.avg_professional},`);
    console.log(`  willingness: ${averages.avg_willingness},`);
    console.log(`  brotherhood: ${averages.avg_brotherhood},`);
    console.log(`  teamwork: ${averages.avg_teamwork},`);
    console.log(`  contribution_personal: ${averages.avg_contribution_personal},`);
    console.log(`  contribution_akpsi: ${averages.avg_contribution_akpsi},`);
    console.log('  // Calculate overall average from the individual averages');
    console.log('  get overall() {');
    console.log('    return (this.professional + this.willingness + this.brotherhood + this.teamwork + this.contribution_personal + this.contribution_akpsi) / 6');
    console.log('  },');
    console.log('  // Calculate combined contribution average');
    console.log('  get contribution() {');
    console.log('    return (this.contribution_personal + this.contribution_akpsi) / 2');
    console.log('  }');
    console.log('}');
    console.log('\n='.repeat(60));
    
    console.log('\n💡 Location: src/components/ApplicantDetailPage.tsx (around line 12)');
    
    // Also show distribution statistics
    console.log('\n📈 DISTRIBUTION STATISTICS');
    console.log('='.repeat(60));
    
    const distributionPipeline = [
      {
        $facet: {
          professional: [
            { $group: { _id: '$professional', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          willingness: [
            { $group: { _id: '$willingness', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          brotherhood: [
            { $group: { _id: '$brotherhood', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          teamwork: [
            { $group: { _id: '$teamwork', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          contribution_personal: [
            { $group: { _id: '$contribution_personal', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          contribution_akpsi: [
            { $group: { _id: '$contribution_akpsi', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ];
    
    const distribution = await evalsCollection.aggregate(distributionPipeline).toArray();
    
    const categories = ['professional', 'willingness', 'brotherhood', 'teamwork', 'contribution_personal', 'contribution_akpsi'];
    
    for (const category of categories) {
      const data = distribution[0][category];
      console.log(`\n${category.toUpperCase()}:`);
      data.forEach(item => {
        const percentage = ((item.count / evalsCount) * 100).toFixed(1);
        const bar = '█'.repeat(Math.round(percentage / 2));
        console.log(`  ${item._id}: ${item.count.toString().padStart(4)} (${percentage.padStart(5)}%) ${bar}`);
      });
    }
    
    console.log('\n='.repeat(60));
    console.log('✅ Global averages computed successfully!');
    
  } catch (error) {
    console.error('❌ Error computing global averages:', error);
    console.error('Full error details:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
computeGlobalAverages();

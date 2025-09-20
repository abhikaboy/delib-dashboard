import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db(process.env.DATABASE_NAME);
    console.log(`Connected to database: ${process.env.DATABASE_NAME}`);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(col => console.log(`- ${col.name}`));
    
    // Check each expected collection
    const expectedCollections = ['applications', 'evals', 'aggregate'];
    
    for (const collectionName of expectedCollections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`\n${collectionName} collection: ${count} documents`);
        
        if (count > 0) {
          // Show sample document
          const sample = await collection.findOne();
          console.log(`Sample document keys: ${Object.keys(sample).join(', ')}`);
        }
      } catch (error) {
        console.log(`\n${collectionName} collection: Error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await client.close();
  }
}

testDatabase();

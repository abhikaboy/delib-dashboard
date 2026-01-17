import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Print all environment variables for debugging
console.log('🔍 Environment Variables:');
console.log('========================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '[SET]' : '[NOT SET]');
console.log('DATABASE_NAME:', 'spring2026');
console.log('COLLECTION_NAME:', process.env.COLLECTION_NAME);
console.log('========================');

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
let db;
const client = new MongoClient(process.env.MONGODB_URI);

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : '[NOT SET]');
    
    await client.connect();
    
    // Ensure we're using the spring2026 database
    const databaseName = process.env.DATABASE_NAME || 'spring2026';
    db = client.db(databaseName);
    
    console.log(`✅ Connected to MongoDB database: ${databaseName}`);
    
    // Test the connection by listing collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    // Test if we can access the applications collection
    const collectionName = process.env.COLLECTION_NAME || 'applications';
    const testCollection = db.collection(collectionName);
    const count = await testCollection.countDocuments();
    console.log(`📊 Documents in ${collectionName} collection: ${count}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('Full error details:', error.message);
    process.exit(1);
  }
}

// Routes

// Proxy endpoint for Google Drive images to bypass CORS
app.get('/api/proxy/image/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Try multiple Google Drive endpoints (using successful pattern first)
    const imageUrls = [
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=s4000`,
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=s2048`,
    ];
    
    let imageResponse = null;
    let lastError = null;
    
    // Try each URL until one works
    for (const imageUrl of imageUrls) {
      try {
        console.log(`Trying to fetch image from: ${imageUrl}`);
        const response = await fetch(imageUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          redirect: 'follow'
        });
        
        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
          imageResponse = response;
          console.log(`Successfully fetched image from: ${imageUrl}`);
          break;
        } else {
          console.log(`Failed to fetch from ${imageUrl}, status: ${response.status}`);
        }
      } catch (error) {
        console.log(`Error fetching from ${imageUrl}:`, error.message);
        lastError = error;
      }
    }
    
    if (!imageResponse) {
      console.error('All image URLs failed, last error:', lastError);
      return res.status(404).json({
        success: false,
        message: 'Image not found or not accessible'
      });
    }
    
    // Set appropriate headers
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const contentLength = imageResponse.headers.get('content-length');
    
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    
    if (contentLength) {
      res.set('Content-Length', contentLength);
    }
    
    // Stream the image data
    imageResponse.body.pipe(res);
    
  } catch (error) {
    console.error('Error in image proxy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to proxy image',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Delibs backend is running',
    timestamp: new Date().toISOString()
  });
});

// Get all evaluations
app.get('/api/evaluations', async (req, res) => {
  try {
    const collection = db.collection('evals'); // assuming evals collection name
    const evaluations = await collection.find({}).toArray();
    
    console.log('Fetched evaluations count:', evaluations.length);
    if (evaluations.length > 0) {
      console.log('Sample evaluation structure:', JSON.stringify(evaluations[0], null, 2));
    }
    
    res.json({
      success: true,
      count: evaluations.length,
      data: evaluations
    });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluations',
      error: error.message
    });
  }
});

// Search evaluations by applicant name
app.get('/api/evaluations/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const collection = db.collection('evals');
    
    const evaluations = await collection.find({
      applicant: { $regex: new RegExp(query, 'i') }
    }).toArray();
    
    res.json({
      success: true,
      count: evaluations.length,
      data: evaluations
    });
  } catch (error) {
    console.error('Error searching evaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search evaluations',
      error: error.message
    });
  }
});

// Get evaluations by brother name
app.get('/api/evaluations/brother/:brotherName', async (req, res) => {
  try {
    const { brotherName } = req.params;
    const collection = db.collection('evals');
    
    const evaluations = await collection.find({
      brother_name: brotherName
    }).toArray();
    
    console.log(`Fetched ${evaluations.length} evaluations for brother: ${brotherName}`);
    
    res.json({
      success: true,
      count: evaluations.length,
      data: evaluations
    });
  } catch (error) {
    console.error('Error fetching evaluations by brother:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluations by brother',
      error: error.message
    });
  }
});

// Search evaluations by brother and applicant name
app.get('/api/evaluations/brother/:brotherName/search/:query', async (req, res) => {
  try {
    const { brotherName, query } = req.params;
    const collection = db.collection('evals');
    
    const evaluations = await collection.find({
      brother_name: brotherName,
      applicant: { $regex: new RegExp(query, 'i') }
    }).toArray();
    
    res.json({
      success: true,
      count: evaluations.length,
      data: evaluations
    });
  } catch (error) {
    console.error('Error searching evaluations by brother:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search evaluations by brother',
      error: error.message
    });
  }
});

// Fuzzy search for applicant evaluations using MongoDB Atlas Search
app.get('/api/applications/:id/fuzzy-evals', async (req, res) => {
  try {
    const { id } = req.params;
    const aggregateCollection = db.collection('aggregate');
    
    console.log(`Performing fuzzy search for applicant: ${id}`);
    
    const pipeline = [
      {
        '$search': {
          'index': 'id', 
          'text': {
            'query': id, 
            'path': '_id'
          }
        }
      }
    ];
    
    const results = await aggregateCollection.aggregate(pipeline).toArray();
    
    console.log(`Fuzzy search found ${results.length} results for: ${id}`);
    
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error performing fuzzy search for evaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform fuzzy search for evaluations',
      error: error.message
    });
  }
});

// Get all applications
app.get('/api/applications', async (req, res) => {
  try {
    const collectionName = process.env.COLLECTION_NAME || 'applications';
    const collection = db.collection(collectionName);
    const applications = await collection.find({}).toArray();
    
    console.log('Fetched applications count:', applications.length);
    if (applications.length > 0) {
      console.log('Sample application structure:', JSON.stringify(applications[0], null, 2));
    }
    
    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Get application by ID
app.get('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collectionName = process.env.COLLECTION_NAME || 'applications';
    const collection = db.collection(collectionName);
    
    // Try to find by MongoDB ObjectId or by custom id field
    let application;
    try {
      const { ObjectId } = await import('mongodb');
      application = await collection.findOne({ _id: new ObjectId(id) });
    } catch {
      // If not a valid ObjectId, search by other id fields
      application = await collection.findOne({ 
        $or: [
          { id: id },
          { applicantId: id },
          { "Full Name": { $regex: new RegExp(id.replace(/-/g, ' '), 'i') } },
          { name: { $regex: new RegExp(id.replace(/-/g, ' '), 'i') } }
        ]
      });
    }
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message
    });
  }
});

// Search applications by name
app.get('/api/applications/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const collectionName = process.env.COLLECTION_NAME || 'applications';
    const collection = db.collection(collectionName);
    
    const applications = await collection.find({
      $or: [
        { "Full Name": { $regex: new RegExp(query, 'i') } },
        { name: { $regex: new RegExp(query, 'i') } },
        { firstName: { $regex: new RegExp(query, 'i') } },
        { lastName: { $regex: new RegExp(query, 'i') } },
        { fullName: { $regex: new RegExp(query, 'i') } }
      ]
    }).toArray();
    
    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error searching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search applications',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
async function startServer() {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Delibs backend server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 Applications API: http://localhost:${PORT}/api/applications`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await client.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await client.close();
  process.exit(0);
});

// Start the server
startServer().catch(console.error);

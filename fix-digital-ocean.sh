#!/bin/bash

echo "🔧 Digital Ocean MongoDB Fix Script"
echo "===================================="
echo ""
echo "This script will help you fix the MongoDB authentication error"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found in current directory"
    echo ""
    echo "Creating .env file..."
    echo "Please provide your MongoDB connection details:"
    echo ""
    
    read -p "MongoDB Username: " MONGO_USER
    read -sp "MongoDB Password: " MONGO_PASS
    echo ""
    read -p "MongoDB Cluster (e.g., cluster0.xxxxx.mongodb.net): " MONGO_CLUSTER
    read -p "Database Name [spring2026]: " DB_NAME
    DB_NAME=${DB_NAME:-spring2026}
    
    # Create .env file
    cat > .env << EOF
# MongoDB Configuration
MONGODB_URI=mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority
COLLECTION_NAME=applications

# Server Configuration
PORT=3001
NODE_ENV=production
EOF
    
    echo "✅ .env file created!"
else
    echo "✅ .env file exists"
fi

echo ""
echo "📋 Current .env contents (passwords hidden):"
cat .env | sed 's/\(MONGODB_URI=.*:\/\/[^:]*:\)[^@]*\(@.*\)/\1***PASSWORD_HIDDEN***\2/'

echo ""
echo "🔍 Testing MongoDB connection..."
echo ""

# Test connection using Node.js
node << 'EOJS'
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log(`📁 Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    const applicationsCount = await db.collection('applications').countDocuments();
    console.log(`📊 Applications: ${applicationsCount} documents`);
    
    const evalsCount = await db.collection('evals').countDocuments();
    console.log(`📊 Evaluations: ${evalsCount} documents`);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    console.error('');
    console.error('Common issues:');
    console.error('1. Wrong username or password');
    console.error('2. IP address not whitelisted in MongoDB Atlas');
    console.error('3. Incorrect cluster URL');
    console.error('');
    console.error('To fix:');
    console.error('- Go to MongoDB Atlas → Network Access');
    console.error('- Add your server IP or 0.0.0.0/0');
    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection();
EOJS

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ MongoDB connection successful!"
    echo ""
    echo "🚀 Now restart your Docker containers:"
    echo "   docker-compose -f docker-compose.prod.yml down"
    echo "   docker-compose -f docker-compose.prod.yml up -d"
else
    echo ""
    echo "❌ MongoDB connection failed!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Check your .env file has correct credentials"
    echo "2. Go to MongoDB Atlas → Network Access"
    echo "3. Add your Digital Ocean IP address"
    echo "4. Or add 0.0.0.0/0 to allow all IPs"
fi

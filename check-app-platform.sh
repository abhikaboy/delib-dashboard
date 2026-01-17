#!/bin/bash

# Digital Ocean App Platform Configuration Checker
# This script helps verify your App Platform setup

echo "🔍 Digital Ocean App Platform Configuration Checker"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}This script will help you verify your App Platform configuration.${NC}"
echo ""

# Check 1: Environment Variables
echo -e "${YELLOW}📋 Step 1: Environment Variables${NC}"
echo "In your Digital Ocean App Platform dashboard:"
echo "  1. Go to Apps → Your app"
echo "  2. Click 'Settings' tab"
echo "  3. Scroll to 'App-Level Environment Variables'"
echo ""
echo "You should have these variables set:"
echo "  ✓ MONGODB_URI"
echo "  ✓ DATABASE_NAME (spring2026)"
echo "  ✓ COLLECTION_NAME (applications)"
echo "  ✓ PORT (3001)"
echo "  ✓ NODE_ENV (production)"
echo ""
read -p "Have you set all environment variables? (y/n) " env_set

if [[ $env_set != "y" ]]; then
    echo -e "${RED}❌ Please set environment variables first!${NC}"
    echo ""
    echo "Example MONGODB_URI format:"
    echo "mongodb+srv://username:password@cluster.mongodb.net/spring2026?retryWrites=true&w=majority"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Check 2: MongoDB Atlas Network Access
echo -e "${YELLOW}🌐 Step 2: MongoDB Atlas Network Access${NC}"
echo "In your MongoDB Atlas dashboard:"
echo "  1. Go to https://cloud.mongodb.com/"
echo "  2. Select your cluster"
echo "  3. Click 'Network Access' (left sidebar)"
echo "  4. Check if you have '0.0.0.0/0' in the IP Access List"
echo ""
echo "If not:"
echo "  1. Click '+ ADD IP ADDRESS'"
echo "  2. Click 'ALLOW ACCESS FROM ANYWHERE'"
echo "  3. Click 'Confirm'"
echo ""
read -p "Is 0.0.0.0/0 whitelisted in MongoDB Atlas? (y/n) " ip_whitelisted

if [[ $ip_whitelisted != "y" ]]; then
    echo -e "${RED}❌ Please whitelist IPs in MongoDB Atlas!${NC}"
    echo ""
    echo "This is the most common cause of 'bad auth' errors!"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ MongoDB Atlas network access configured${NC}"
echo ""

# Check 3: Docker Image
echo -e "${YELLOW}🐳 Step 3: Docker Image${NC}"
echo "Make sure your latest Docker image is pushed to GHCR:"
echo ""
echo "Run this command to push the latest image:"
echo "  ./push-to-ghcr.sh"
echo ""
read -p "Have you pushed the latest Docker image? (y/n) " image_pushed

if [[ $image_pushed != "y" ]]; then
    echo -e "${YELLOW}⚠️  Push your Docker image before deploying${NC}"
    echo ""
    read -p "Do you want to push now? (y/n) " push_now
    if [[ $push_now == "y" ]]; then
        ./push-to-ghcr.sh
    else
        echo "Run: ./push-to-ghcr.sh when ready"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Docker image is up to date${NC}"
echo ""

# Check 4: MongoDB Credentials
echo -e "${YELLOW}🔐 Step 4: Test MongoDB Connection${NC}"
echo "Let's verify your MongoDB credentials..."
echo ""
read -p "Enter your MONGODB_URI: " mongodb_uri

if [[ -z "$mongodb_uri" ]]; then
    echo -e "${RED}❌ MongoDB URI is required${NC}"
    exit 1
fi

# Extract database name from URI
if [[ $mongodb_uri =~ /([^/?]+)\? ]]; then
    db_name="${BASH_REMATCH[1]}"
    echo "Database name: $db_name"
else
    echo -e "${YELLOW}⚠️  Could not extract database name from URI${NC}"
    db_name="spring2026"
fi

# Test connection using Node.js
echo ""
echo "Testing MongoDB connection..."
cat > /tmp/test-mongo-connection.js << 'EOF'
const { MongoClient } = require('mongodb');

const uri = process.argv[2];
const dbName = process.argv[3] || 'spring2026';

async function testConnection() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    
    console.log(`\n📁 Collections in database '${dbName}':`);
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check for required collections
    const collectionNames = collections.map(c => c.name);
    const required = ['applications', 'evals'];
    const missing = required.filter(name => !collectionNames.includes(name));
    
    if (missing.length > 0) {
      console.log(`\n⚠️  Missing collections: ${missing.join(', ')}`);
    } else {
      console.log('\n✅ All required collections exist!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('bad auth')) {
      console.log('\n💡 Fix: Check your username and password in MONGODB_URI');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Fix: Check your cluster URL in MONGODB_URI');
    } else if (error.message.includes('IP')) {
      console.log('\n💡 Fix: Whitelist 0.0.0.0/0 in MongoDB Atlas Network Access');
    }
    
    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection();
EOF

# Check if we're in backend directory or root
if [ -d "backend" ]; then
    cd backend
fi

if [ -f "package.json" ]; then
    node /tmp/test-mongo-connection.js "$mongodb_uri" "$db_name"
    connection_result=$?
else
    echo -e "${YELLOW}⚠️  Cannot test connection (mongodb package not found)${NC}"
    echo "Skipping connection test..."
    connection_result=0
fi

rm -f /tmp/test-mongo-connection.js

if [ $connection_result -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ MongoDB connection test failed${NC}"
    echo ""
    echo "Please fix the connection issues before deploying."
    exit 1
fi

echo ""
echo -e "${GREEN}✅ MongoDB connection successful${NC}"
echo ""

# Final Summary
echo "=================================================="
echo -e "${GREEN}🎉 All checks passed!${NC}"
echo "=================================================="
echo ""
echo "Your App Platform should be configured correctly."
echo ""
echo "Next steps:"
echo "  1. Go to your App Platform dashboard"
echo "  2. Check 'Runtime Logs' for any errors"
echo "  3. Visit your app URL to verify it's working"
echo ""
echo "If you still see 'bad auth' error:"
echo "  1. Double-check MONGODB_URI in App Platform settings"
echo "  2. Verify 0.0.0.0/0 is in MongoDB Atlas Network Access"
echo "  3. Try redeploying: Deployments → Deploy → Force Rebuild"
echo ""
echo -e "${BLUE}📚 For more help, see: DIGITAL-OCEAN-APP-PLATFORM.md${NC}"
echo ""

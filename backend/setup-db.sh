#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🗄️  Miniferias Database Setup Script"
echo "===================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please copy .env.example to .env and configure it first:"
    echo "  cp .env.example .env"
    echo "  # Then edit .env with your database credentials"
    exit 1
fi

# Check if DATABASE_URL is configured
if grep -q "postgresql://user:password@localhost" .env; then
    echo -e "${YELLOW}⚠️  Warning: DATABASE_URL looks like the example${NC}"
    echo "Please update your .env file with real database credentials"
    exit 1
fi

echo "📦 Step 1/4: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo "🔧 Step 2/4: Generating Prisma Client..."
npm run prisma:generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

echo "🗃️  Step 3/4: Pushing schema to database..."
npm run prisma:push
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push schema${NC}"
    echo "Please check your DATABASE_URL in .env"
    exit 1
fi
echo -e "${GREEN}✅ Schema pushed successfully${NC}"
echo ""

echo "🌱 Step 4/4: Seeding database with test users..."
npm run prisma:seed
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to seed database${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Database seeded successfully${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Database setup completed!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You can now start the server with:"
echo "  npm run dev"
echo ""
echo "Test credentials are in TEST_CREDENTIALS.md"
echo ""

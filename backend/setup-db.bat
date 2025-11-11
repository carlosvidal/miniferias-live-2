@echo off
echo.
echo 🗄️  Miniferias Database Setup Script
echo ====================================
echo.

REM Check if .env exists
if not exist .env (
    echo ❌ Error: .env file not found
    echo Please copy .env.example to .env and configure it first:
    echo   copy .env.example .env
    echo   REM Then edit .env with your database credentials
    exit /b 1
)

echo 📦 Step 1/4: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)
echo ✅ Dependencies installed
echo.

echo 🔧 Step 2/4: Generating Prisma Client...
call npm run prisma:generate
if errorlevel 1 (
    echo ❌ Failed to generate Prisma Client
    exit /b 1
)
echo ✅ Prisma Client generated
echo.

echo 🗃️  Step 3/4: Pushing schema to database...
call npm run prisma:push
if errorlevel 1 (
    echo ❌ Failed to push schema
    echo Please check your DATABASE_URL in .env
    exit /b 1
)
echo ✅ Schema pushed successfully
echo.

echo 🌱 Step 4/4: Seeding database with test users...
call npm run prisma:seed
if errorlevel 1 (
    echo ❌ Failed to seed database
    exit /b 1
)
echo ✅ Database seeded successfully
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🎉 Database setup completed!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo You can now start the server with:
echo   npm run dev
echo.
echo Test credentials are in TEST_CREDENTIALS.md
echo.
pause

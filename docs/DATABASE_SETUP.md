# 🗄️ Database Setup Guide - Miniferias

Complete guide to set up your database for the Miniferias Live Shopping Platform.

---

## 🚀 Quick Start (Automated)

### For macOS/Linux:
```bash
cd backend
chmod +x setup-db.sh
./setup-db.sh
```

### For Windows:
```bash
cd backend
setup-db.bat
```

This will automatically:
1. Install dependencies
2. Generate Prisma Client
3. Push schema to database
4. Seed test users

---

## 📋 Manual Setup (Step by Step)

### Step 1: Configure Database Connection

**Option A: Using Supabase (Recommended)**

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings → Database**
4. Copy the **Connection string** (URI format)
5. Replace `[YOUR-PASSWORD]` with your database password

Example:
```env
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Option B: Using Local PostgreSQL**

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/miniferias"
```

### Step 2: Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set at minimum:
```env
DATABASE_URL="your-database-url-here"
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-key"
JWT_SECRET="your-secret-key"
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Generate Prisma Client

```bash
npm run prisma:generate
```

This creates the Prisma Client from your schema.

### Step 5: Push Schema to Database

```bash
npm run prisma:push
```

This creates all tables in your database.

### Step 6: Seed Test Users

```bash
npm run prisma:seed
```

This creates 3 test users (Admin, Exhibitor, Visitor).

---

## ✅ Verify Setup

After setup, you should see:
```
🌱 Seeding database...
✅ Admin user created: admin@miniferias.pe
✅ Exhibitor user created: expositor@miniferias.pe
✅ Visitor user created: visitante@miniferias.pe

📋 Test Users Created:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 ADMIN:
   Email: admin@miniferias.pe
   Password: admin123
...
```

---

## 🔧 Troubleshooting

### Error: "User was denied access on the database"

**Cause:** Schema hasn't been applied to the database yet.

**Solution:**
```bash
npm run prisma:push
npm run prisma:seed
```

### Error: "Can't reach database server"

**Cause:** DATABASE_URL is incorrect or database is not running.

**Solutions:**
1. Check your DATABASE_URL in `.env`
2. Verify database is running (for local PostgreSQL)
3. Check network connection (for Supabase)
4. Verify credentials are correct

### Error: "Environment variable not found: DATABASE_URL"

**Cause:** `.env` file is missing or not in the correct location.

**Solution:**
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
```

### Error: "prisma generate" fails

**Solution:**
```bash
npm install @prisma/client prisma --save-dev
npm run prisma:generate
```

### Error: Table already exists

**Cause:** You're running `prisma:migrate` after `prisma:push`.

**Solution:** Choose one approach:
- For development: Use `prisma:push` (no migrations)
- For production: Use `prisma:migrate` (with migrations)

### Seed script fails with unique constraint

**Cause:** Users already exist in database.

**Solution:**
```bash
# Option 1: Delete existing users manually
npm run prisma:studio
# Then delete users from User table

# Option 2: Reset database (WARNING: deletes all data)
npm run prisma:push -- --force-reset
npm run prisma:seed
```

---

## 🔄 Reset Database (Delete All Data)

⚠️ **WARNING:** This will delete all data!

```bash
npm run prisma:push -- --force-reset
npm run prisma:seed
```

---

## 🛠️ Useful Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (no migrations)
npm run prisma:push

# Create migration (for production)
npm run prisma:migrate

# Open Prisma Studio (visual database editor)
npm run prisma:studio

# Seed database with test users
npm run prisma:seed

# Reset database and seed
npm run prisma:push -- --force-reset && npm run prisma:seed
```

---

## 📊 Database Schema Overview

The database includes these tables:
- **User** - All users (Admin, Exhibitor, Visitor)
- **Event** - Virtual events
- **Booth** - Exhibitor booths
- **Product** - Product catalog
- **Order** - Customer orders
- **OrderItem** - Order line items
- **Message** - Chat messages

See `backend/prisma/schema.prisma` for full schema.

---

## 🔐 Supabase Configuration

### Getting Your Credentials

1. **SUPABASE_URL**:
   - Settings → API → Project URL

2. **SUPABASE_ANON_KEY**:
   - Settings → API → Project API keys → `anon` `public`

3. **SUPABASE_SERVICE_KEY**:
   - Settings → API → Project API keys → `service_role` `secret`

4. **DATABASE_URL**:
   - Settings → Database → Connection string (URI)
   - Select "Connection pooling" mode
   - Use the URL with port 6543 for connection pooling

### Enable Realtime (For Chat)

1. Go to **Database → Replication**
2. Enable replication for the `Message` table
3. This allows real-time subscriptions for chat

---

## 🌐 Production Deployment

For production on Render.com or similar:

1. Set environment variables in your hosting dashboard
2. Use connection pooling URL (port 6543)
3. Run migrations on deploy:
   ```bash
   npx prisma migrate deploy
   ```
4. Don't run seed in production (only for dev/test)

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

Last updated: 2025-11-11

# Many-to-Many Booth Members Migration

## Overview
This migration transforms the Booth-User relationship from **1:1** to **Many-to-Many**, enabling multiple users to manage a single booth with different roles (OWNER, OPERATOR, MODERATOR).

## What Changed

### Database Schema Changes
1. **New Enum**: `BoothRole` with values: OWNER, OPERATOR, MODERATOR
2. **New Table**: `BoothMember` (join table)
   - Links Users to Booths with roles
   - Supports multiple users per booth
   - Each user can be member of multiple booths
3. **Booth Model**: Removed direct `userId` field
4. **User Model**: Removed direct `booth` field

### API Changes
- **POST /booths**: Creates booth with owner as first member (role: OWNER)
- **GET /booths**: Returns booths with `members[]` instead of `user`
- **GET /booths/:id**: Returns booth with `members[]`
- **GET /exhibitor/my-booth**: Finds booths where user is a member
- **PUT /booths/:id**: Checks membership (OWNER or OPERATOR can update)
- **Streaming endpoints**: Check membership roles for permissions

## How to Apply Migration

### Step 1: Database Migration

Run the SQL migration on your PostgreSQL database:

```bash
cd /home/user/miniferias-live-2/backend
psql $DATABASE_URL -f prisma/migrations/add_booth_member_many_to_many.sql
```

Or if you have Prisma CLI working with internet connectivity:

```bash
cd /home/user/miniferias-live-2/backend
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate dev --name add-booth-member-many-to-many
```

### Step 2: Regenerate Prisma Client

```bash
cd /home/user/miniferias-live-2/backend
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

### Step 3: Restart Backend Server

```bash
cd /home/user/miniferias-live-2/backend
npm run dev
```

## Roles Explained

- **OWNER**: Full control - can manage booth settings, products, streaming, and members
- **OPERATOR**: Can operate streaming and manage products/orders
- **MODERATOR**: Can moderate chat and messages (for future use)

## Benefits

✅ **Flexible**: Multiple people can manage the same booth
✅ **Scalable**: One person can manage multiple booths
✅ **Role-based**: Different permission levels for team members
✅ **Future-ready**: Supports live streaming with operator + moderator

## Testing

After migration, test:
1. Create a new booth (should auto-create OWNER member)
2. Get booth details (should return `members[]`)
3. Update booth (should check membership permissions)
4. Start/stop streaming (should check OWNER/OPERATOR roles)

## Rollback (if needed)

If you need to rollback, you can:
1. Restore from database backup
2. Or manually revert schema changes

**Note**: Since no booths have been created yet, there's no data to migrate!

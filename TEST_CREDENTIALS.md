# 🔑 Test Credentials - Miniferias

Use these credentials to test the application with different user roles.

## How to Create Test Users

After setting up the database, run the seed script:

```bash
cd backend
npm run prisma:seed
```

## 👤 Test Users

### Administrator
```
Email: admin@miniferias.pe
Password: admin123
Role: ADMIN
```

**Capabilities:**
- Create and manage events
- Create and assign booths to exhibitors
- View all orders and messages
- Access admin dashboard
- Moderate content

---

### Exhibitor (Seller)
```
Email: expositor@miniferias.pe
Password: exhibitor123
Role: EXHIBITOR
```

**Capabilities:**
- Configure booth profile (name, description, logo, QR codes)
- Create and manage products
- Start/stop live streaming
- View and respond to chat messages
- Manage received orders
- Update order status

---

### Visitor (Buyer)
```
Email: visitante@miniferias.pe
Password: visitor123
Role: VISITOR
```

**Capabilities:**
- Browse events and booths
- Watch live streams
- Send chat messages
- Add products to cart
- Create orders
- View order history
- Save shipping address

---

## 🔐 Security Notes

⚠️ **IMPORTANT**:
- These are TEST credentials only
- Change or remove these users in production
- Never commit real passwords to version control
- Use environment variables for sensitive data

---

## 📝 Creating Additional Users

### Option 1: Using the API

**Register Visitor:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "999999999",
    "role": "VISITOR"
  }'
```

**Register Exhibitor:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@example.com",
    "password": "password123",
    "name": "Test Seller",
    "phone": "988888888",
    "role": "EXHIBITOR"
  }'
```

### Option 2: Using Prisma Studio

```bash
cd backend
npm run prisma:studio
```

Then manually create users in the User table.

### Option 3: Directly in Database

Connect to your Supabase database and run:

```sql
-- Remember to hash the password with bcrypt first!
INSERT INTO "User" (id, email, password, name, role)
VALUES (
  gen_random_uuid(),
  'newadmin@miniferias.pe',
  '$2b$10$hashedpasswordhere',
  'New Admin',
  'ADMIN'
);
```

---

## 🧪 Testing Workflows

### Admin Workflow
1. Login as admin@miniferias.pe
2. Go to `/admin`
3. Create a new event
4. Create booths and assign to exhibitors
5. Monitor event stats

### Exhibitor Workflow
1. Login as expositor@miniferias.pe
2. Go to `/exhibitor`
3. Configure booth profile
4. Add products to catalog
5. Start live stream during event
6. Manage incoming orders

### Visitor Workflow
1. Login as visitante@miniferias.pe
2. Browse events on home page
3. Enter an event with active booths
4. Watch live stream
5. Chat with exhibitor
6. Add products to cart
7. Complete checkout with Yape/Plin

---

Last updated: 2025-11-11

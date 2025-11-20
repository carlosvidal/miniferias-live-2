# Multi-Provider Authentication Setup

This document explains the multi-provider authentication feature that allows users to link multiple authentication methods (Google, Facebook, TikTok, Email/Password) to a single account.

## Features Implemented

1. **Multiple Authentication Methods**: Users can link Google, Facebook, TikTok, and email/password authentication to one account
2. **Account Linking**: Automatically links social accounts with the same email to existing users
3. **Profile Management**: Users can view and manage linked accounts from their profile page
4. **Secure Unlinking**: Users must maintain at least one authentication method (cannot unlink the last method)

## Database Migration Required

### Step 1: Generate Prisma Client

Before running the application, you need to regenerate the Prisma client with the updated schema:

```bash
cd backend
npx prisma generate
```

### Step 2: Apply Database Migration

Apply the migration to create the `UserAuthProvider` table:

```bash
cd backend
npx prisma migrate deploy
```

Or if you're in development:

```bash
cd backend
npx prisma migrate dev
```

This migration will:
- Create the `UserAuthProvider` table to track multiple auth methods per user
- Migrate existing users to the new table structure
- Add necessary indexes and foreign keys

### Step 3: Update Environment Variables

Make sure your `.env` file includes the session secret:

```env
SESSION_SECRET=your-secure-session-secret-here
```

If not set, the application will use a default (not recommended for production).

## How It Works

### User Profile - Connected Accounts Section

Users can now manage their authentication methods from the profile page (`/profile`):

1. **View Linked Accounts**: See all connected authentication methods (Google, Facebook, TikTok)
2. **Link New Provider**: Click "Conectar" to add a new authentication method
3. **Unlink Provider**: Click "Desvincular" to remove an authentication method (requires at least 2 methods linked)

### Linking Flow

1. User clicks "Conectar" button for a provider in their profile
2. Frontend redirects to `/api/auth/link/{provider}?token={jwt}`
3. Backend verifies the JWT and stores user ID in session
4. OAuth flow initiates with the selected provider
5. After successful OAuth, the provider is linked to the user's account
6. User is redirected back to their profile with a success message

### Unlinking Flow

1. User clicks "Desvincular" button for a linked provider
2. Frontend shows a confirmation dialog
3. API call to `DELETE /api/auth/provider/{provider}`
4. Backend verifies user has at least 2 authentication methods
5. Provider is removed from the user's account
6. Profile page updates to reflect the change

## Backend API Endpoints

### Link Provider
```
GET /api/auth/link/google?token={jwt}
GET /api/auth/link/facebook?token={jwt}
GET /api/auth/link/tiktok?token={jwt}
```

Initiates OAuth flow to link a provider to the authenticated user's account.

### Link Callback
```
GET /api/auth/link/google/callback
GET /api/auth/link/facebook/callback
GET /api/auth/link/tiktok/callback
```

Handles OAuth callback and links the provider to the user's account.

### Unlink Provider
```
DELETE /api/auth/provider/{provider}
Authorization: Bearer {jwt}
```

Removes a provider from the user's account. Requires at least 2 providers to be linked.

## Database Schema

### UserAuthProvider Model

```prisma
model UserAuthProvider {
  id          String       @id @default(uuid())
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider    AuthProvider
  providerId  String
  createdAt   DateTime     @default(now())

  @@unique([provider, providerId])
  @@unique([userId, provider])
  @@index([userId])
}
```

This table tracks all authentication providers linked to each user.

## Security Considerations

1. **Minimum One Method**: Users cannot unlink their last authentication method
2. **Session-Based Linking**: Uses temporary session storage during OAuth flow
3. **JWT Authentication**: All unlink operations require valid JWT token
4. **Unique Constraints**: Prevents duplicate provider links across accounts
5. **Cascade Delete**: Removes all auth providers when user is deleted

## Testing

### Test Linking a Provider

1. Log in with email/password
2. Go to profile page (`/profile`)
3. Click "Conectar" on Google
4. Complete Google OAuth flow
5. Verify you're redirected back to profile with success message
6. Confirm Google shows as "Conectado" in the profile

### Test Unlinking a Provider

1. Ensure you have at least 2 providers linked
2. Click "Desvincular" on one provider
3. Confirm the action in the dialog
4. Verify provider is removed and shows as "No conectado"
5. Try unlinking when only 1 provider remains (should show error)

### Test Account Merging

1. Create account with email: test@example.com (password)
2. Log out
3. Sign in with Google using the same email: test@example.com
4. System should automatically link Google to existing account
5. Check profile - both LOCAL and GOOGLE should be connected

## Troubleshooting

### Prisma Client Not Generated

If you see `@prisma/client did not initialize yet`:

```bash
cd backend
npx prisma generate
```

### Migration Not Applied

If you see database errors about missing `UserAuthProvider` table:

```bash
cd backend
npx prisma migrate deploy
```

### Session Errors

If linking fails with "no_session" error, ensure:
1. Session middleware is configured in `app.js`
2. `SESSION_SECRET` is set in `.env`
3. Cookies are enabled in your browser

## Files Changed

### Backend
- `/backend/prisma/schema.prisma` - Added `UserAuthProvider` model
- `/backend/prisma/migrations/20251118203416_add_user_auth_providers/` - Migration files
- `/backend/src/app.js` - Added session middleware
- `/backend/src/config/passport.js` - Updated OAuth strategies to use `UserAuthProvider`
- `/backend/src/controllers/auth.controller.js` - Added `oauthLinkCallback` and `unlinkProvider`
- `/backend/src/routes/auth.routes.js` - Added link and unlink routes
- `/backend/src/middleware/auth-link.middleware.js` - New middleware for link endpoints

### Frontend
- `/frontend/src/views/ProfileView.vue` - Added connected accounts UI
- `/frontend/src/services/api.js` - Added `unlinkProvider` method
- `/frontend/src/stores/auth.js` - Updated to handle `authProviders`

## Next Steps

After applying the migration:

1. Test all authentication flows (email, Google, Facebook, TikTok)
2. Test linking and unlinking providers
3. Verify account merging works for same email addresses
4. Test edge cases (last provider, invalid tokens, etc.)
5. Monitor for any OAuth errors in production

import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as OAuth2Strategy } from 'passport-oauth2'
import prisma from './prisma.js'

/**
 * Configure Google OAuth Strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim()
        const profilePicture = profile.photos?.[0]?.value

        if (!email) {
          return done(new Error('No email found in Google profile'), null)
        }

        // Check if this specific Google account is already linked
        const authProvider = await prisma.userAuthProvider.findUnique({
          where: {
            provider_providerId: {
              provider: 'GOOGLE',
              providerId: profile.id
            }
          },
          include: { user: true }
        })

        let user = null

        if (authProvider) {
          // User found by Google provider
          user = authProvider.user
        } else {
          // Check if email already exists (user registered with different method)
          const existingUser = await prisma.user.findUnique({
            where: { email }
          })

          if (existingUser) {
            // Link Google account to existing user
            await prisma.userAuthProvider.create({
              data: {
                userId: existingUser.id,
                provider: 'GOOGLE',
                providerId: profile.id
              }
            })

            // Update profile picture if they don't have one
            if (!existingUser.profilePicture && profilePicture) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { profilePicture }
              })
            }

            user = existingUser
          } else {
            // Create new user
            user = await prisma.user.create({
              data: {
                email,
                name,
                provider: 'GOOGLE',
                providerId: profile.id,
                profilePicture,
                role: 'VISITOR',
                authProviders: {
                  create: {
                    provider: 'GOOGLE',
                    providerId: profile.id
                  }
                }
              }
            })
          }
        }

        return done(null, user)
      } catch (error) {
        console.error('Google OAuth error:', error)
        return done(error, null)
      }
    }
  )
)

/**
 * Configure Facebook OAuth Strategy
 */
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'emails', 'name', 'displayName', 'picture.type(large)']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim()
        const profilePicture = profile.photos?.[0]?.value

        if (!email) {
          return done(new Error('No email found in Facebook profile'), null)
        }

        // Check if this specific Facebook account is already linked
        const authProvider = await prisma.userAuthProvider.findUnique({
          where: {
            provider_providerId: {
              provider: 'FACEBOOK',
              providerId: profile.id
            }
          },
          include: { user: true }
        })

        let user = null

        if (authProvider) {
          // User found by Facebook provider
          user = authProvider.user
        } else {
          // Check if email already exists (user registered with different method)
          const existingUser = await prisma.user.findUnique({
            where: { email }
          })

          if (existingUser) {
            // Link Facebook account to existing user
            await prisma.userAuthProvider.create({
              data: {
                userId: existingUser.id,
                provider: 'FACEBOOK',
                providerId: profile.id
              }
            })

            // Update profile picture if they don't have one
            if (!existingUser.profilePicture && profilePicture) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { profilePicture }
              })
            }

            user = existingUser
          } else {
            // Create new user
            user = await prisma.user.create({
              data: {
                email,
                name,
                provider: 'FACEBOOK',
                providerId: profile.id,
                profilePicture,
                role: 'VISITOR',
                authProviders: {
                  create: {
                    provider: 'FACEBOOK',
                    providerId: profile.id
                  }
                }
              }
            })
          }
        }

        return done(null, user)
      } catch (error) {
        console.error('Facebook OAuth error:', error)
        return done(error, null)
      }
    }
  )
)

/**
 * Configure TikTok OAuth Strategy (using generic OAuth2)
 * TikTok uses OAuth 2.0 with custom endpoints
 */
passport.use(
  'tiktok',
  new OAuth2Strategy(
    {
      authorizationURL: 'https://www.tiktok.com/v2/auth/authorize/',
      tokenURL: 'https://open.tiktokapis.com/v2/oauth/token/',
      clientID: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
      callbackURL: process.env.TIKTOK_CALLBACK_URL,
      scope: ['user.info.basic'],
      state: true
    },
    async (accessToken, refreshToken, params, profile, done) => {
      try {
        // Fetch user info from TikTok API
        const response = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()

        if (!data.data || !data.data.user) {
          return done(new Error('Failed to fetch TikTok user info'), null)
        }

        const tiktokUser = data.data.user
        const providerId = tiktokUser.union_id || tiktokUser.open_id
        const name = tiktokUser.display_name || 'TikTok User'
        const profilePicture = tiktokUser.avatar_url

        // TikTok doesn't provide email by default, generate a placeholder
        // The user will need to update their email later
        const email = `tiktok_${providerId}@miniferias.temp`

        // Check if this specific TikTok account is already linked
        const authProvider = await prisma.userAuthProvider.findUnique({
          where: {
            provider_providerId: {
              provider: 'TIKTOK',
              providerId
            }
          },
          include: { user: true }
        })

        let user = null

        if (authProvider) {
          // User found by TikTok provider
          user = authProvider.user
        } else {
          // Create new user (TikTok users will have temp email)
          user = await prisma.user.create({
            data: {
              email,
              name,
              provider: 'TIKTOK',
              providerId,
              profilePicture,
              role: 'VISITOR',
              authProviders: {
                create: {
                  provider: 'TIKTOK',
                  providerId
                }
              }
            }
          })
        }

        return done(null, user)
      } catch (error) {
        console.error('TikTok OAuth error:', error)
        return done(error, null)
      }
    }
  )
)

/**
 * Serialize user for session (not used with JWT, but required by Passport)
 */
passport.serializeUser((user, done) => {
  done(null, user.id)
})

/**
 * Deserialize user from session
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        profilePicture: true,
        provider: true,
        providerId: true,
        shippingAddress: true
      }
    })
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

export default passport

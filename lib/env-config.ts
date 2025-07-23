export const envConfig = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,

  // App Configuration
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Telebirr Payment
  TELEBIRR_BASE_URL: process.env.TELEBIRR_BASE_URL!,
  TELEBIRR_MERCHANT_ID: process.env.TELEBIRR_MERCHANT_ID!,
  TELEBIRR_API_KEY: process.env.TELEBIRR_API_KEY!,
  TELEBIRR_API_SECRET: process.env.TELEBIRR_API_SECRET!,

  // Email Service
  RESEND_API_KEY: process.env.RESEND_API_KEY,

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

  // File Storage
  NEXT_PUBLIC_UPLOAD_URL: process.env.NEXT_PUBLIC_UPLOAD_URL || "http://localhost:3000/uploads",
  CERTIFICATE_STORAGE_PATH: process.env.CERTIFICATE_STORAGE_PATH || "./public/certificates",
  CERTIFICATE_BASE_URL: process.env.CERTIFICATE_BASE_URL || "http://localhost:3000/certificates",

  // Security
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,

  // Calendly
  CALENDLY_API_KEY: process.env.CALENDLY_API_KEY,

  // Monitoring
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  SENTRY_DSN: process.env.SENTRY_DSN,

  // Redis
  REDIS_URL: process.env.REDIS_URL,

  // AWS S3
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
}

// Validate required environment variables
export function validateEnv() {
  const required = [
    "DATABASE_URL",
    "JWT_SECRET",
    "NEXT_PUBLIC_APP_URL",
    "TELEBIRR_BASE_URL",
    "TELEBIRR_MERCHANT_ID",
    "TELEBIRR_API_KEY",
    "TELEBIRR_API_SECRET",
    "ENCRYPTION_KEY",
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}

const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const requiredVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "TELEBIRR_BASE_URL",
  "TELEBIRR_MERCHANT_ID",
  "TELEBIRR_API_KEY",
  "TELEBIRR_API_SECRET",
  "ENCRYPTION_KEY",
];

const optionalVars = [
  "RESEND_API_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "CALENDLY_API_KEY",
  "REDIS_URL",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_S3_BUCKET",
];

console.log("🔍 Validating environment variables...\n");

let hasErrors = false;

// Check required variables
console.log("✅ Required Variables:");
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: Missing`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const maskedValue =
      varName.includes("SECRET") ||
      varName.includes("KEY") ||
      varName.includes("PASSWORD")
        ? "*".repeat(Math.min(value.length, 8))
        : value.length > 50
          ? value.substring(0, 50) + "..."
          : value;
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

// Check optional variables
console.log("\n📋 Optional Variables:");
optionalVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    const maskedValue =
      varName.includes("SECRET") ||
      varName.includes("KEY") ||
      varName.includes("PASSWORD")
        ? "*".repeat(Math.min(value.length, 8))
        : value.length > 50
          ? value.substring(0, 50) + "..."
          : value;
    console.log(`✅ ${varName}: ${maskedValue}`);
  } else {
    console.log(`⚠️  ${varName}: Not set`);
  }
});

// Validate specific formats
console.log("\n🔧 Format Validation:");

// JWT Secret length
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret && jwtSecret.length < 32) {
  console.log("❌ JWT_SECRET: Should be at least 32 characters long");
  hasErrors = true;
} else if (jwtSecret) {
  console.log("✅ JWT_SECRET: Length is adequate");
}

// Encryption key length
const encryptionKey = process.env.ENCRYPTION_KEY;
if (encryptionKey && encryptionKey.length !== 32) {
  console.log("❌ ENCRYPTION_KEY: Must be exactly 32 characters long");
  hasErrors = true;
} else if (encryptionKey) {
  console.log("✅ ENCRYPTION_KEY: Length is correct");
}

// Database URL format
const dbUrl = process.env.DATABASE_URL;
if (dbUrl && !dbUrl.startsWith("postgresql://")) {
  console.log("❌ DATABASE_URL: Should start with postgresql://");
  hasErrors = true;
} else if (dbUrl) {
  console.log("✅ DATABASE_URL: Format looks correct");
}

// App URL format
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
if (appUrl && !appUrl.startsWith("http")) {
  console.log("❌ NEXT_PUBLIC_APP_URL: Should start with http:// or https://");
  hasErrors = true;
} else if (appUrl) {
  console.log("✅ NEXT_PUBLIC_APP_URL: Format looks correct");
}

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.log(
    "\n⚠️  .env.local file not found. Make sure to create it from .env.example"
  );
}

console.log("\n" + "=".repeat(50));

if (hasErrors) {
  console.log("❌ Environment validation failed!");
  console.log("Please fix the errors above before running the application.");
  process.exit(1);
} else {
  console.log("✅ All environment variables are properly configured!");
  console.log("You can now run your application.");
}

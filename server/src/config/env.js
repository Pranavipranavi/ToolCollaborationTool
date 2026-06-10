import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

function stripTrailingSlash(value) {
  return value?.replace(/\/+$/, "");
}

function requiredInProduction(name, value) {
  if (isProduction && !value) throw new Error(`${name} is required in production`);
  return value;
}

function withDevelopmentFallback(name, fallback) {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) return requiredInProduction(name, undefined);
  return fallback;
}

function assertProductionUrl(name, value) {
  if (!isProduction || !value) return;
  let parsed;
  try {
    parsed = new URL(value);
  } catch (_error) {
    throw new Error(`${name} must be a valid absolute URL`);
  }
  if (parsed.protocol !== "https:") throw new Error(`${name} must use https in production`);
  if (["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) throw new Error(`${name} cannot point to a local host in production`);
}

function assertMongoUri(value) {
  if (!value) return;
  if (!value.startsWith("mongodb+srv://") && !value.startsWith("mongodb://")) {
    throw new Error("MONGODB_URI must be a valid MongoDB connection string");
  }
}

const clientUrl = stripTrailingSlash(withDevelopmentFallback("CLIENT_URL", "http://localhost:5173"));
const serverUrl = stripTrailingSlash(withDevelopmentFallback("SERVER_URL", `http://localhost:${process.env.PORT || 5000}`));
const mongoUri = requiredInProduction("MONGODB_URI", process.env.MONGODB_URI);
const jwtSecret = requiredInProduction("JWT_SECRET", process.env.JWT_SECRET || (isProduction ? undefined : "development-taskflow-secret"));
const googleClientId = requiredInProduction("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID);
const googleClientSecret = requiredInProduction("GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET);
const googleCallbackUrl = `${serverUrl}/api/auth/google/callback`;

assertProductionUrl("CLIENT_URL", clientUrl);
assertProductionUrl("SERVER_URL", serverUrl);
assertMongoUri(mongoUri);

if (isProduction && jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production");
}

function buildAllowedOrigins() {
  const origins = new Set([clientUrl]);
  if (!isProduction) {
    origins.add(clientUrl.replace("localhost", "127.0.0.1"));
    origins.add(clientUrl.replace("127.0.0.1", "localhost"));
  }
  return Array.from(origins);
}

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv,
  isProduction,
  clientUrl,
  serverUrl,
  allowedOrigins: buildAllowedOrigins(),
  mongoUri,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  googleClientId,
  googleClientSecret,
  googleCallbackUrl,
};

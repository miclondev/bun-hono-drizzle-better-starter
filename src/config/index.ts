import dotenv from "dotenv";
import Joi from "joi";

// Load environment variables from .env file
dotenv.config();

// Define the schema for environment variables
const configSchema = Joi.object({
  // Server
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().default(3000),

  // Database
  DB_NAME: Joi.string().default("todos"),
  DB_USER: Joi.string().default("postgres"),
  DB_PASSWORD: Joi.string().default("postgres"),
  DB_HOST: Joi.string().default("localhost"),
  DB_PORT: Joi.number().default(5432),
  DATABASE_URL: Joi.string().optional(),

  // Connection Pool
  DB_POOL_MIN: Joi.number().default(2),
  DB_POOL_MAX: Joi.number().default(10),
  DB_IDLE_TIMEOUT: Joi.number().default(30),
  DB_CONNECT_TIMEOUT: Joi.number().default(10),
  DB_MAX_LIFETIME: Joi.number().default(60 * 60),

  // JWT
  JWT_SECRET: Joi.string().when("NODE_ENV", {
    is: "production",
    otherwise: Joi.string().default("dev-secret"),
  }),
  JWT_EXPIRES_IN: Joi.string().default("1d"),

  // AWS
  AWS_REGION: Joi.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),

  // Logging
  LOG_LEVEL: Joi.string().valid("error", "warn", "info", "http", "debug").default("info"),
});

// Map environment variables to config object
const mapEnvToConfig = (env: NodeJS.ProcessEnv) => ({
  server: {
    env: env.NODE_ENV || "development",
    port: parseInt(env.PORT || "3000", 10),
  },
  database: {
    name: env.DB_NAME || "todos",
    user: env.DB_USER || "postgres",
    password: env.DB_PASSWORD || "postgres",
    host: env.DB_HOST || "localhost",
    port: parseInt(env.DB_PORT || "5432", 10),
    url: env.DATABASE_URL,
    ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    pool: {
      min: parseInt(env.DB_POOL_MIN || "2", 10),
      max: parseInt(env.DB_POOL_MAX || "10", 10),
      idleTimeout: parseInt(env.DB_IDLE_TIMEOUT || "30", 10),
      connectTimeout: parseInt(env.DB_CONNECT_TIMEOUT || "10", 10),
      maxLifetime: parseInt(env.DB_MAX_LIFETIME || "3600", 10),
    },
  },
  jwt: {
    secret: env.JWT_SECRET || "dev-secret",
    expiresIn: env.JWT_EXPIRES_IN || "1d",
  },
  aws: {
    region: env.AWS_REGION || "us-east-1",
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  logging: {
    level: env.LOG_LEVEL || "info",
  },
});

// Build and validate config
const buildConfig = () => {
  // Validate environment variables against schema
  const { error, value: validatedEnv } = configSchema.validate(process.env, {
    allowUnknown: true, // Allow unknown env vars
    stripUnknown: true, // Remove unknown env vars
    abortEarly: false, // Report all validation errors
  });

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  // Map validated environment variables to config
  return mapEnvToConfig(validatedEnv);
};

// Export the config
export const config = buildConfig();

// Export individual configs for convenience
export const { server, database, jwt, aws, logging } = config;

// Export the schema and functions for testing
export { buildConfig, configSchema, mapEnvToConfig };

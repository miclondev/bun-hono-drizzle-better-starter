import { logger } from "@utils/logger";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { database } from "@/config";

// Connection string
const connectionString =
  database.url ||
  `postgres://${database.user}:${database.password}@${database.host}:${database.port}/${database.name}`;

export const migrationClient = postgres(connectionString, {
  ssl: database.ssl,
  max: 1, // Only need one connection for migrations
  idle_timeout: 10, // Short timeout for migrations
  connect_timeout: database.pool.connectTimeout,
});

// For query execution with enhanced connection pooling
export const queryClient = postgres(connectionString, {
  ssl: database.ssl,
  // Connection pool configuration
  max: database.pool.max, // Maximum number of connections in the pool
  idle_timeout: database.pool.idleTimeout, // How many seconds to keep an idle connection before closing (in seconds)
  connect_timeout: database.pool.connectTimeout, // How many seconds to wait for a connection (in seconds)

  // Additional options for production environments
  debug: process.env.NODE_ENV === "development", // Log queries in development
  transform: { undefined: null }, // Transform undefined values to null
  types: {
    // Custom type parsers if needed
    date: {
      to: 1184, // Postgres TIMESTAMPTZ OID
      from: [1082, 1083, 1114, 1184], // Postgres DATE, TIME, TIMESTAMP, TIMESTAMPTZ OIDs
      serialize: (date: Date) => date.toISOString(),
      parse: (str: string) => new Date(str),
    },
  },
});

// Note: postgres.js maintains its own connection pool automatically.
// It will keep a minimum number of connections alive based on demand
// and will close idle connections after the idle_timeout.

// Create database instance
export const db = drizzle(queryClient);

export const initDatabase = async (): Promise<void> => {
  try {
    // Test the connection
    await queryClient`SELECT 1`;

    // Log connection pool information
    logger.info("Database connection pool established successfully", {
      max: database.pool.max,
      idleTimeout: database.pool.idleTimeout,
      connectTimeout: database.pool.connectTimeout,
    });

    // Setup periodic health check for the connection pool
    if (process.env.NODE_ENV === "production") {
      setInterval(async () => {
        try {
          await queryClient`SELECT 1`;
          logger.debug("Connection pool health check passed");
        } catch (error) {
          logger.error("Connection pool health check failed:", error);
        }
      }, 60000); // Check every minute
    }
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
    throw error;
  }
};

// Function to gracefully close the database connections
export const closeDatabase = async (): Promise<void> => {
  try {
    logger.info("Closing database connections...");
    await queryClient.end();
    await migrationClient.end();
    logger.info("Database connections closed successfully");
  } catch (error) {
    logger.error("Error closing database connections:", error);
    throw error;
  }
};

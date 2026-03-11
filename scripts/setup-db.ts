#!/usr/bin/env bun
import postgres from "postgres";

const setupDatabase = async () => {
  console.log("Setting up database...");

  // Connect to postgres database (default)
  const sql = postgres({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: "postgres", // Connect to default postgres database
  });

  try {
    // Check if database exists
    const dbName = process.env.DB_NAME || "todos";
    const result = await sql`
      SELECT 1 FROM pg_database WHERE datname = ${dbName}
    `;

    if (result.length === 0) {
      console.log(`Creating database: ${dbName}`);
      // Note: Cannot use parameterized query for CREATE DATABASE
      await sql.unsafe(`CREATE DATABASE ${dbName}`);
      console.log(`✓ Database '${dbName}' created successfully`);
    } else {
      console.log(`✓ Database '${dbName}' already exists`);
    }

    await sql.end();
    console.log("\nDatabase setup complete!");
    console.log("Next steps:");
    console.log("1. Run: bun run db:push");
    console.log("2. Run: bun run dev");
  } catch (error) {
    console.error("Error setting up database:", error);
    await sql.end();
    process.exit(1);
  }
};

setupDatabase();

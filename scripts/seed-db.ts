#!/usr/bin/env bun
import { todoRepository } from "@db/repositories";
import { faker } from "@faker-js/faker";
import { logger } from "@/utils/logger";

const seedDatabase = async () => {
  console.log("🌱 Seeding database...\n");

  try {
    // Note: In a real scenario, you'd need actual user IDs from the database
    // For demo purposes, using a placeholder user ID
    const demoUserId = "demo-user-123";

    console.log("Creating sample todos...");

    const todos = [
      {
        title: "Complete project documentation",
        description: "Write comprehensive docs for the new Bun + Hono API",
        userId: demoUserId,
      },
      {
        title: "Review pull requests",
        description: "Check and merge pending PRs from the team",
        userId: demoUserId,
      },
      {
        title: "Update dependencies",
        description: "Run bun update to get latest package versions",
        userId: demoUserId,
      },
      {
        title: "Write unit tests",
        description: "Add test coverage for new features",
        userId: demoUserId,
      },
      {
        title: "Deploy to production",
        description: "Deploy the latest version after all tests pass",
        userId: demoUserId,
      },
    ];

    let createdCount = 0;

    for (const todo of todos) {
      await todoRepository.create(todo);
      createdCount++;
      console.log(`  ✓ Created: ${todo.title}`);
    }

    // Create some random todos
    console.log("\nCreating random todos...");

    for (let i = 0; i < 5; i++) {
      const randomTodo = {
        title: faker.lorem.sentence({ min: 3, max: 8 }),
        description: faker.lorem.paragraph(),
        userId: demoUserId,
      };

      await todoRepository.create(randomTodo);
      createdCount++;
      console.log(`  ✓ Created: ${randomTodo.title}`);
    }

    console.log(`\n✅ Successfully created ${createdCount} todos!`);
    console.log(`\nNote: All todos are assigned to user ID: ${demoUserId}`);
    console.log("To use these todos, you'll need to:");
    console.log("1. Register a user via /api/auth/sign-up/email");
    console.log("2. Update the todos with your actual user ID");
    console.log("   OR create new todos after authentication\n");
  } catch (error) {
    logger.error("Error seeding database:", error);
    console.error("❌ Failed to seed database:", error);
    process.exit(1);
  }
};

seedDatabase();

#!/usr/bin/env bun
export {};

const API_BASE_URL = "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

const testEndpoint = async (name: string, url: string, options?: RequestInit): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, options);
    const passed = response.status < 500; // Any non-500 error is considered a pass for connectivity

    results.push({
      name,
      passed,
      error: passed ? undefined : `Status: ${response.status}`,
    });

    const status = passed ? "✓" : "✗";
    console.log(`${status} ${name} - Status: ${response.status}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`✗ ${name} - Error: ${error}`);
  }
};

const runTests = async () => {
  console.log("🧪 Testing API Endpoints\n");
  console.log("Base URL:", API_BASE_URL);
  console.log("─".repeat(50));

  // Health Check
  console.log("\n📊 Health Check:");
  await testEndpoint("GET /health", "/health");

  // Auth Endpoints
  console.log("\n🔐 Authentication Endpoints:");
  await testEndpoint("GET /api/auth/session", "/api/auth/session");

  await testEndpoint("POST /api/auth/sign-up/email", "/api/auth/sign-up/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `test-${Date.now()}@example.com`,
      password: "TestPassword123!",
      name: "Test User",
    }),
  });

  // Todo Endpoints (should return 401 without auth)
  console.log("\n📝 Todo Endpoints (Unauthenticated):");
  await testEndpoint("GET /api/v1/todo", "/api/v1/todo");

  await testEndpoint("POST /api/v1/todo", "/api/v1/todo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Test Todo",
      description: "Test Description",
    }),
  });

  await testEndpoint("GET /api/v1/todo/test-id", "/api/v1/todo/test-id");

  await testEndpoint("PUT /api/v1/todo/test-id", "/api/v1/todo/test-id", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Updated Title",
    }),
  });

  await testEndpoint("DELETE /api/v1/todo/test-id", "/api/v1/todo/test-id", {
    method: "DELETE",
  });

  await testEndpoint("PATCH /api/v1/todo/test-id/toggle", "/api/v1/todo/test-id/toggle", {
    method: "PATCH",
  });

  // 404 Test
  console.log("\n🔍 Error Handling:");
  await testEndpoint("GET /non-existent", "/non-existent");

  // Summary
  console.log(`\n${"─".repeat(50)}`);
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`\n📊 Test Summary:`);
  console.log(`   Total: ${results.length}`);
  console.log(`   ✓ Passed: ${passed}`);
  console.log(`   ✗ Failed: ${failed}`);

  if (failed > 0) {
    console.log("\n❌ Failed Tests:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
  }

  console.log(`\n${failed === 0 ? "✅ All tests passed!" : "⚠️  Some tests failed"}`);
  console.log();

  process.exit(failed > 0 ? 1 : 0);
};

// Check if server is running
const checkServer = async () => {
  try {
    await fetch(`${API_BASE_URL}/health`);
    return true;
  } catch {
    return false;
  }
};

const main = async () => {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.error("❌ Server is not running!");
    console.error(`   Please start the server first: bun run dev`);
    console.error(`   Expected server at: ${API_BASE_URL}\n`);
    process.exit(1);
  }

  await runTests();
};

main();

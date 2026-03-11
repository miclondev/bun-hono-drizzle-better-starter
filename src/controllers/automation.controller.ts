import type { Context } from "hono";
import { automationRepository } from "../db/repositories";
import { createAutomationSchema, updateAutomationSchema } from "../validation/automation.validation";

/**
 * Get all automations for the authenticated user
 */
export async function getAutomations(c: Context) {
  try {
    const userId = c.get("userId");
    const automations = await automationRepository.findByUserId(userId);
    return c.json({ automations }, 200);
  } catch (error) {
    console.error("Error fetching automations:", error);
    return c.json({ error: "Failed to fetch automations" }, 500);
  }
}

/**
 * Get a single automation by ID
 */
export async function getAutomation(c: Context) {
  try {
    const userId = c.get("userId");
    const { id } = c.req.param();

    const automation = await automationRepository.findById(id, userId);
    if (!automation) {
      return c.json({ error: "Automation not found" }, 404);
    }

    return c.json({ automation }, 200);
  } catch (error) {
    console.error("Error fetching automation:", error);
    return c.json({ error: "Failed to fetch automation" }, 500);
  }
}

/**
 * Create a new automation
 */
export async function createAutomation(c: Context) {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();

    // Validate request body
    const { error, value } = createAutomationSchema.validate(body);
    if (error) {
      return c.json({ error: error.details[0].message }, 400);
    }

    const automation = await automationRepository.create({
      ...value,
      userId,
      active: value.active ?? true,
      videosGenerated: 0,
    });

    return c.json({ automation }, 201);
  } catch (error) {
    console.error("Error creating automation:", error);
    return c.json({ error: "Failed to create automation" }, 500);
  }
}

/**
 * Update an automation
 */
export async function updateAutomation(c: Context) {
  try {
    const userId = c.get("userId");
    const { id } = c.req.param();
    const body = await c.req.json();

    // Validate request body
    const { error, value } = updateAutomationSchema.validate(body);
    if (error) {
      return c.json({ error: error.details[0].message }, 400);
    }

    const automation = await automationRepository.update(id, userId, value);
    if (!automation) {
      return c.json({ error: "Automation not found" }, 404);
    }

    return c.json({ automation }, 200);
  } catch (error) {
    console.error("Error updating automation:", error);
    return c.json({ error: "Failed to update automation" }, 500);
  }
}

/**
 * Delete an automation
 */
export async function deleteAutomation(c: Context) {
  try {
    const userId = c.get("userId");
    const { id } = c.req.param();

    const deleted = await automationRepository.delete(id, userId);
    if (!deleted) {
      return c.json({ error: "Automation not found" }, 404);
    }

    return c.json({ message: "Automation deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting automation:", error);
    return c.json({ error: "Failed to delete automation" }, 500);
  }
}

/**
 * Toggle automation active status
 */
export async function toggleAutomation(c: Context) {
  try {
    const userId = c.get("userId");
    const { id } = c.req.param();

    const automation = await automationRepository.toggleActive(id, userId);
    if (!automation) {
      return c.json({ error: "Automation not found" }, 404);
    }

    return c.json({ automation }, 200);
  } catch (error) {
    console.error("Error toggling automation:", error);
    return c.json({ error: "Failed to toggle automation" }, 500);
  }
}

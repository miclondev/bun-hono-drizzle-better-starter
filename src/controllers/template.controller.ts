import type { Context } from "hono";
import { templateRepository } from "../db/repositories";
import { createTemplateSchema } from "../validation/template.validation";

/**
 * Get all templates for the authenticated user
 */
export async function getTemplates(c: Context) {
  try {
    const userId = c.get("userId");
    const templates = await templateRepository.findByUserId(userId);
    return c.json({ templates }, 200);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return c.json({ error: "Failed to fetch templates" }, 500);
  }
}

/**
 * Get a single template by ID
 */
export async function getTemplate(c: Context) {
  try {
    const userId = c.get("userId");
    const { id } = c.req.param();

    const template = await templateRepository.findById(id, userId);
    if (!template) {
      return c.json({ error: "Template not found" }, 404);
    }

    return c.json({ template }, 200);
  } catch (error) {
    console.error("Error fetching template:", error);
    return c.json({ error: "Failed to fetch template" }, 500);
  }
}

/**
 * Create a new template
 */
export async function createTemplate(c: Context) {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();

    // Validate request body
    const { error, value } = createTemplateSchema.validate(body);
    if (error) {
      return c.json({ error: error.details[0].message }, 400);
    }

    const template = await templateRepository.create({
      ...value,
      userId,
    });

    return c.json({ template }, 201);
  } catch (error) {
    console.error("Error creating template:", error);
    return c.json({ error: "Failed to create template" }, 500);
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(c: Context) {
  try {
    const userId = c.get("userId");
    const { id } = c.req.param();

    const deleted = await templateRepository.delete(id, userId);
    if (!deleted) {
      return c.json({ error: "Template not found" }, 404);
    }

    return c.json({ message: "Template deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting template:", error);
    return c.json({ error: "Failed to delete template" }, 500);
  }
}

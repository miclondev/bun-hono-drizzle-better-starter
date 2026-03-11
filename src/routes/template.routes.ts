import { Hono } from "hono";
import {
  getTemplates,
  getTemplate,
  createTemplate,
  deleteTemplate,
} from "../controllers/template.controller";
import { authMiddleware } from "../middleware/auth";

const templateRoutes = new Hono();

// All routes require authentication
templateRoutes.use("*", authMiddleware);

// Template CRUD operations
templateRoutes.get("/", getTemplates);
templateRoutes.get("/:id", getTemplate);
templateRoutes.post("/", createTemplate);
templateRoutes.delete("/:id", deleteTemplate);

export default templateRoutes;

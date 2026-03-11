import { Hono } from "hono";
import {
  getAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  toggleAutomation,
} from "../controllers/automation.controller";
import { authMiddleware } from "../middleware/auth";

const automationRoutes = new Hono();

// All routes require authentication
automationRoutes.use("*", authMiddleware);

// Automation CRUD operations
automationRoutes.get("/", getAutomations);
automationRoutes.get("/:id", getAutomation);
automationRoutes.post("/", createAutomation);
automationRoutes.patch("/:id", updateAutomation);
automationRoutes.delete("/:id", deleteAutomation);

// Automation actions
automationRoutes.patch("/:id/toggle", toggleAutomation);

export default automationRoutes;

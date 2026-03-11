import { Hono } from "hono";
import { creditsController } from "@/controllers/credits.controller";
import { authMiddleware } from "@/middleware/auth";

const router = new Hono();

// All credit routes require authentication
router.use("*", authMiddleware);

router.get("/balance", creditsController.getBalance);
router.get("/transactions", creditsController.getTransactions);
router.post("/purchase", creditsController.purchaseCredits);

export default router;

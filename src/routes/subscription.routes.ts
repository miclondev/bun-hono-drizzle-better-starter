import { Hono } from "hono";
import { subscriptionController } from "@/controllers/subscription.controller";
import { authMiddleware } from "@/middleware/auth";

const router = new Hono();

// All subscription routes require authentication
router.use("*", authMiddleware);

router.get("/", subscriptionController.getSubscription);
router.post("/checkout", subscriptionController.createCheckout);
router.post("/portal", subscriptionController.createPortal);
router.post("/cancel", subscriptionController.cancelSubscription);
router.post("/upgrade", subscriptionController.upgradeSubscription);

export default router;

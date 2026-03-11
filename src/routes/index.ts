import { Hono } from "hono";
import videoRoutes from "./video.routes";
import templateRoutes from "./template.routes";
import automationRoutes from "./automation.routes";
import tiktokRoutes from "./tiktok.routes";
import rssFeedRoutes from "./rss-feed.routes";
import statsRoutes from "./stats.routes";

const routes = new Hono();

// Mount all API routes
routes.route("/videos", videoRoutes);
routes.route("/templates", templateRoutes);
routes.route("/automations", automationRoutes);
routes.route("/tiktok", tiktokRoutes);
routes.route("/rss-feeds", rssFeedRoutes);
routes.route("/stats", statsRoutes);

export default routes;

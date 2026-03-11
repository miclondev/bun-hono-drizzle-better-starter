import { Hono } from "hono";
import todoRoutes from "./todo.routes";

const routes = new Hono();

// Mount todo routes
routes.route("/todo", todoRoutes);

export default routes;

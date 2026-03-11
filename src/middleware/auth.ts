import type { Context, Next } from "hono";
import { auth } from "@/utils/auth";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string;
  role?: string;
  banned?: boolean;
  bannedReason?: string;
  banExpires?: Date;
  isAnonymous?: boolean;
}

export const verifyToken = async (c: Context, next: Next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json({ message: "No Session provided" }, 401);
    }

    c.set("user", session.user as unknown as AuthUser);
    c.set("session", session.session);
    await next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return c.json({ message: "Unauthorized" }, 401);
  }
};

export const requireRole = (requiredRole: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user") as AuthUser | undefined;

    if (!user) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const role = user.role;
    if (!role || role !== requiredRole) {
      return c.json({ message: `Role ${requiredRole} required` }, 403);
    }

    await next();
  };
};

export const requireAnyRole = (requiredRoles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user") as AuthUser | undefined;

    if (!user) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const userRole = user.role;
    if (!userRole) {
      return c.json({ message: `One of roles ${requiredRoles.join(", ")} required` }, 403);
    }

    const hasAccess = requiredRoles.some((role) => userRole === role);

    if (!hasAccess) {
      return c.json({ message: `One of roles ${requiredRoles.join(", ")} required` }, 403);
    }

    await next();
  };
};

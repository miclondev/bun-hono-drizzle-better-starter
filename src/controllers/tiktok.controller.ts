import type { Context } from "hono";
import { tiktokRepository } from "../db/repositories";
import crypto from "crypto";

/**
 * Get TikTok connection status
 */
export async function getTikTokStatus(c: Context) {
  try {
    const userId = c.get("userId");
    const account = await tiktokRepository.findByUserId(userId);

    if (!account) {
      return c.json({ connected: false }, 200);
    }

    return c.json({
      connected: true,
      username: account.username,
      connectedAt: account.connectedAt,
      autoPost: account.autoPost,
    }, 200);
  } catch (error) {
    console.error("Error fetching TikTok status:", error);
    return c.json({ error: "Failed to fetch TikTok status" }, 500);
  }
}

/**
 * Get TikTok OAuth authorization URL
 */
export async function getOAuthUrl(c: Context) {
  try {
    const userId = c.get("userId");
    
    // Generate a random state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString("hex");
    
    // Store state in session or cache (for now, we'll include userId in state)
    // In production, store this in Redis or session storage
    const stateWithUserId = Buffer.from(JSON.stringify({ state, userId })).toString("base64");

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI;

    if (!clientKey || !redirectUri) {
      return c.json({ error: "TikTok OAuth not configured" }, 500);
    }

    // TikTok OAuth authorization URL
    const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
    authUrl.searchParams.append("client_key", clientKey);
    authUrl.searchParams.append("scope", "user.info.basic,video.upload,video.publish");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("state", stateWithUserId);

    return c.json({ authUrl: authUrl.toString() }, 200);
  } catch (error) {
    console.error("Error generating OAuth URL:", error);
    return c.json({ error: "Failed to generate OAuth URL" }, 500);
  }
}

/**
 * Handle TikTok OAuth callback
 */
export async function handleOAuthCallback(c: Context) {
  try {
    const { code, state } = c.req.query();

    if (!code || !state) {
      return c.json({ error: "Missing authorization code or state" }, 400);
    }

    // Decode and verify state
    let stateData: { state: string; userId: string };
    try {
      stateData = JSON.parse(Buffer.from(state, "base64").toString());
    } catch {
      return c.json({ error: "Invalid state parameter" }, 400);
    }

    const { userId } = stateData;

    // Exchange authorization code for access token
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI;

    if (!clientKey || !clientSecret || !redirectUri) {
      return c.json({ error: "TikTok OAuth not configured" }, 500);
    }

    // Call TikTok token endpoint
    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("TikTok token exchange failed:", errorData);
      return c.json({ error: "Failed to exchange authorization code" }, 500);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in, open_id } = tokenData;

    // Get user info from TikTok
    const userInfoResponse = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=display_name,username", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    let username = "TikTok User";
    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      username = userInfo.data?.user?.username || userInfo.data?.user?.display_name || username;
    }

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Save or update TikTok account
    await tiktokRepository.upsert({
      userId,
      username,
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenExpiresAt: expiresAt,
      autoPost: false,
    });

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return c.redirect(`${frontendUrl}/settings?tiktok=connected`);
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return c.redirect(`${frontendUrl}/settings?tiktok=error`);
  }
}

/**
 * Refresh TikTok access token
 */
export async function refreshToken(c: Context) {
  try {
    const userId = c.get("userId");
    const account = await tiktokRepository.findByUserId(userId);

    if (!account) {
      return c.json({ error: "TikTok account not connected" }, 404);
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    if (!clientKey || !clientSecret) {
      return c.json({ error: "TikTok OAuth not configured" }, 500);
    }

    // Call TikTok refresh token endpoint
    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: account.refreshToken,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("TikTok token refresh failed:", errorData);
      return c.json({ error: "Failed to refresh access token" }, 500);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Update tokens
    await tiktokRepository.updateTokens(userId, access_token, refresh_token, expiresAt);

    return c.json({ message: "Token refreshed successfully" }, 200);
  } catch (error) {
    console.error("Error refreshing token:", error);
    return c.json({ error: "Failed to refresh token" }, 500);
  }
}

/**
 * Disconnect TikTok account
 */
export async function disconnectTikTok(c: Context) {
  try {
    const userId = c.get("userId");
    const deleted = await tiktokRepository.delete(userId);

    if (!deleted) {
      return c.json({ error: "TikTok account not found" }, 404);
    }

    return c.json({ message: "TikTok account disconnected successfully" }, 200);
  } catch (error) {
    console.error("Error disconnecting TikTok:", error);
    return c.json({ error: "Failed to disconnect TikTok account" }, 500);
  }
}

/**
 * Post video to TikTok
 */
export async function postVideoToTikTok(c: Context) {
  try {
    const userId = c.get("userId");
    const { videoId } = c.req.param();

    // Check if TikTok is connected
    const account = await tiktokRepository.findByUserId(userId);
    if (!account) {
      return c.json({ error: "TikTok account not connected" }, 400);
    }

    // Check if token is expired
    if (await tiktokRepository.isTokenExpired(userId)) {
      return c.json({ error: "TikTok token expired. Please reconnect your account." }, 401);
    }

    // TODO: Implement actual TikTok video upload
    // This would involve:
    // 1. Get video from our storage
    // 2. Upload to TikTok using their API
    // 3. Publish the video
    // For now, return mock success

    return c.json({
      message: "Video posted to TikTok successfully",
      tiktokVideoId: `mock_${Date.now()}`,
    }, 200);
  } catch (error) {
    console.error("Error posting video to TikTok:", error);
    return c.json({ error: "Failed to post video to TikTok" }, 500);
  }
}

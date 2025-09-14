import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleLogin,
  handleSignup,
  handleGetProfile,
  handleGetUsers,
  handleVerifyEmail,
  handleResendVerification,
  handleGetCollegeData
} from "./routes/auth";
import { handleStatus } from "./routes/status";
import {
  handleVerifyCollegeEmail,
  handleSendVerificationEmail,
  handleCheckVerificationStatus
} from "./routes/collegeVerification";
import {
  handleClearDatabase,
  handleDatabaseStats,
  handleResetDatabase
} from "./routes/admin";
import {
  handleGetPosts,
  handleCreatePost,
  handleGetUserPosts,
  handleTogglePostLike,
  handleDeletePost
} from "./routes/posts";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());

  // Add error handling for JSON parsing
  app.use(express.json({
    verify: (req, res, buf) => {
      console.log("Raw request body:", buf.toString());
    }
  }));
  app.use(express.urlencoded({ extended: true }));

  // Error handling middleware for JSON parsing errors
  app.use((error: any, req: any, res: any, next: any) => {
    if (error instanceof SyntaxError && 'body' in error) {
      console.error('JSON Parse Error:', error);
      return res.status(400).json({
        success: false,
        message: "Invalid JSON in request body"
      });
    }
    next(error);
  });

  // Runtime env for client
  app.get('/env.js', (_req, res) => {
    const env = {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
    };
    res.type('application/javascript').send(`window.ENV=${JSON.stringify(env)};`);
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.get("/api/status", handleStatus);

  // Authentication routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/signup", handleSignup);
  app.get("/api/auth/profile", handleGetProfile);

  // Email verification routes
  app.post("/api/auth/verify-email", handleVerifyEmail);
  app.post("/api/auth/resend-verification", handleResendVerification);
  app.get("/api/auth/college-data", handleGetCollegeData);

  // College email verification routes
  app.post("/api/college/verify-email", handleVerifyCollegeEmail);
  app.post("/api/college/send-verification", handleSendVerificationEmail);
  app.get("/api/college/verification-status", handleCheckVerificationStatus);

  // Development helper route
  app.get("/api/auth/users", handleGetUsers);

  // Admin routes
  app.post("/api/admin/clear-database", handleClearDatabase);
  app.get("/api/admin/database-stats", handleDatabaseStats);
  app.post("/api/admin/reset-database", handleResetDatabase);

  // Posts routes
  app.get("/api/posts", handleGetPosts);
  app.post("/api/posts", handleCreatePost);
  app.get("/api/posts/user/:userId", handleGetUserPosts);
  app.post("/api/posts/:postId/like", handleTogglePostLike);
  app.delete("/api/posts/:postId", handleDeletePost);

  return app;
}

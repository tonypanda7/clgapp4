import { RequestHandler } from "express";
import { getStorage } from "../storage";

export const handleStatus: RequestHandler = async (req, res) => {
  try {
    const storage = getStorage();
    const users = await storage.getAllUsers();
    
    res.json({
      status: "✅ Backend is running!",
      timestamp: new Date().toISOString(),
      storage: {
        type: process.env.STORAGE_TYPE || 'database',
        userCount: users.length,
        persistent: true
      },
      features: {
        authentication: true,
        database: true,
        publicAccess: true,
        apiEndpoints: [
          "GET /api/status",
          "GET /api/ping",
          "GET /api/demo",
          "POST /api/auth/login",
          "POST /api/auth/signup",
          "GET /api/auth/profile",
          "POST /api/auth/verify-email",
          "POST /api/auth/resend-verification",
          "GET /api/auth/college-data",
          "GET /api/auth/users"
        ]
      },
      publicUrls: {
        homepage: req.protocol + '://' + req.get('host'),
        signup: req.protocol + '://' + req.get('host') + '/signup',
        apiTest: req.protocol + '://' + req.get('host') + '/api-test',
        dashboard: req.protocol + '://' + req.get('host') + '/dashboard'
      }
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      status: "❌ Backend error",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

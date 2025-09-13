import { RequestHandler } from "express";
import { getStorage } from "../storage";

// Clear all users from database
export const handleClearDatabase: RequestHandler = async (req, res) => {
  try {
    console.log("Clearing all users from database...");
    
    const storage = getStorage();
    
    // Get current user count before clearing
    const usersBefore = await storage.getAllUsers();
    const countBefore = usersBefore.length;
    
    // Clear all users
    await storage.clearAllUsers();
    
    // Verify users were cleared
    const usersAfter = await storage.getAllUsers();
    const countAfter = usersAfter.length;
    
    res.json({
      success: true,
      message: "Database cleared successfully",
      usersDeleted: countBefore,
      remainingUsers: countAfter,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Database cleared: ${countBefore} users deleted, ${countAfter} remaining`);
    
  } catch (error) {
    console.error('Clear database error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to clear database",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get database stats
export const handleDatabaseStats: RequestHandler = async (req, res) => {
  try {
    const storage = getStorage();
    const users = await storage.getAllUsers();
    
    // Calculate some basic stats
    const totalUsers = users.length;
    const verifiedUsers = users.filter(u => u.isEmailVerified).length;
    const unverifiedUsers = totalUsers - verifiedUsers;
    
    // Group by university
    const universityStats = users.reduce((acc, user) => {
      const uni = user.universityName || 'Unknown';
      acc[uni] = (acc[uni] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        universityStats,
        storageType: process.env.STORAGE_TYPE || 'database'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database stats error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get database stats",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Reset database (clear and recreate structure)
export const handleResetDatabase: RequestHandler = async (req, res) => {
  try {
    console.log("Resetting database...");
    
    const storage = getStorage();
    
    // Clear all users
    await storage.clearAllUsers();
    
    res.json({
      success: true,
      message: "Database reset successfully",
      timestamp: new Date().toISOString()
    });
    
    console.log("Database reset completed");
    
  } catch (error) {
    console.error('Reset database error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to reset database",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

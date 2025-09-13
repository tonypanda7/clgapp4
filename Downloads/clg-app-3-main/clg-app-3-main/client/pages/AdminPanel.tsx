import React, { useState, useEffect } from "react";

interface DatabaseStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  universityStats: Record<string, number>;
  storageType: string;
}

export default function AdminPanel() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/database-stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const clearDatabase = async () => {
    if (!confirm("Are you sure you want to clear ALL users from the database? This action cannot be undone!")) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/clear-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Database cleared successfully! ${data.usersDeleted} users removed.`);
        await loadStats(); // Refresh stats
      } else {
        setMessage(`❌ Failed to clear database: ${data.message}`);
      }

    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetDatabase = async () => {
    if (!confirm("Are you sure you want to reset the entire database? This will clear all data!")) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/reset-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage("✅ Database reset successfully!");
        await loadStats(); // Refresh stats
      } else {
        setMessage(`❌ Failed to reset database: ${data.message}`);
      }

    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-8 text-center text-red-600">
            🚨 Admin Panel - Database Management
          </h1>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800 font-semibold">⚠️ WARNING</div>
            <div className="text-red-700 text-sm">
              This admin panel allows you to permanently delete all user data. 
              Use with extreme caution!
            </div>
          </div>

          {/* Database Stats */}
          {stats && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Database Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="bg-white p-4 rounded">
                  <div className="text-2xl font-bold text-green-600">{stats.verifiedUsers}</div>
                  <div className="text-sm text-gray-600">Verified Users</div>
                </div>
                <div className="bg-white p-4 rounded">
                  <div className="text-2xl font-bold text-yellow-600">{stats.unverifiedUsers}</div>
                  <div className="text-sm text-gray-600">Unverified Users</div>
                </div>
                <div className="bg-white p-4 rounded">
                  <div className="text-sm font-semibold text-purple-600">{stats.storageType.toUpperCase()}</div>
                  <div className="text-sm text-gray-600">Storage Type</div>
                </div>
              </div>

              {/* University Breakdown */}
              {Object.keys(stats.universityStats).length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Users by University:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(stats.universityStats).map(([uni, count]) => (
                      <div key={uni} className="bg-white p-2 rounded text-sm">
                        <span className="font-medium">{uni}:</span> {count} users
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={loadStats}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
              >
                🔄 Refresh Stats
              </button>

              <button
                onClick={clearDatabase}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
              >
                {isLoading ? "Clearing..." : "🗑️ Clear All Users"}
              </button>

              <button
                onClick={resetDatabase}
                disabled={isLoading}
                className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg disabled:opacity-50"
              >
                {isLoading ? "Resetting..." : "💥 Reset Database"}
              </button>
            </div>

            {/* Message Display */}
            {message && (
              <div className="bg-gray-50 border rounded-lg p-4 text-center">
                <div className="text-lg">{message}</div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => window.open("/api/auth/users", "_blank")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                📊 View Raw User Data
              </button>
              
              <button
                onClick={() => window.open("/signup", "_blank")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                ➕ Test Signup Flow
              </button>
              
              <button
                onClick={() => window.open("/college-test", "_blank")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                🎓 Test College Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

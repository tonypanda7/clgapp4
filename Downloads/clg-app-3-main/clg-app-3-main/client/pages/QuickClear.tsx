import React, { useState } from "react";

export default function QuickClear() {
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState("");

  const clearNow = async () => {
    setIsClearing(true);
    setResult("");

    try {
      const response = await fetch("/api/admin/clear-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ SUCCESS: Database cleared! ${data.usersDeleted} users removed.`);
      } else {
        setResult(`❌ FAILED: ${data.message}`);
      }

    } catch (error) {
      setResult(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">🗑️ Quick Database Clear</h1>
        
        <p className="text-gray-600 mb-6">
          This will immediately delete all users from the database.
        </p>

        <button
          onClick={clearNow}
          disabled={isClearing}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          {isClearing ? "Clearing Database..." : "🚨 CLEAR DATABASE NOW"}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <div className="text-lg font-medium">{result}</div>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <a href="/admin" className="text-blue-600 hover:underline">
            → Go to Full Admin Panel
          </a>
        </div>
      </div>
    </div>
  );
}

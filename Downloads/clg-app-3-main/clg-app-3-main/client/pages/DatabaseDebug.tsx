import React, { useState } from "react";

export default function DatabaseDebug() {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createTestUser = async () => {
    setIsLoading(true);
    setResult("");

    try {
      // Create the user that's failing to login
      const signupData = {
        fullName: "Test User",
        universityEmail: "a@snuchennai.edu.in",
        password: ".x-K,.2RWPj*>i@",
        confirmPassword: ".x-K,.2RWPj*>i@"
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();
      setResult(`User Creation Result:
Status: ${response.status}
Success: ${data.success}
Message: ${data.message}
${data.errors ? `Errors: ${JSON.stringify(data.errors, null, 2)}` : ""}`);

    } catch (error) {
      setResult(`Error creating user: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    setResult("");

    try {
      const loginData = {
        username: "a@snuchennai.edu.in",
        password: ".x-K,.2RWPj*>i@"
      };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      setResult(`Login Test Result:
Status: ${response.status}
Success: ${data.success}
Message: ${data.message}
${data.user ? `User: ${data.user.fullName} (${data.user.universityEmail})` : ""}`);

    } catch (error) {
      setResult(`Error during login: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const listUsers = async () => {
    setIsLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/auth/users");
      const data = await response.json();
      
      setResult(`Database Users:
Total: ${data.users?.length || 0}
${data.users?.map((u: any) => `- ${u.universityEmail} (${u.fullName})`).join('\n') || 'No users found'}`);

    } catch (error) {
      setResult(`Error listing users: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearDatabase = async () => {
    setIsLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/admin/clear-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      setResult(`Database Clear Result:
Status: ${response.status}
Success: ${data.success}
Message: ${data.message || 'Database cleared'}`);

    } catch (error) {
      setResult(`Error clearing database: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-red-600">
          🔧 401 Database Debug Tools
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">Current Issue:</h3>
            <code className="text-red-700 text-sm">
              HTTP 401 - User "a@snuchennai.edu.in" login failing
            </code>
          </div>

          <h2 className="text-xl font-semibold mb-4">Debug Actions</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={listUsers}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded disabled:opacity-50"
            >
              📋 List Users
            </button>
            
            <button
              onClick={createTestUser}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded disabled:opacity-50"
            >
              ➕ Create User
            </button>
            
            <button
              onClick={testLogin}
              disabled={isLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded disabled:opacity-50"
            >
              🔑 Test Login
            </button>
            
            <button
              onClick={clearDatabase}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded disabled:opacity-50"
            >
              🗑️ Clear DB
            </button>
          </div>

          {isLoading && (
            <div className="text-center text-blue-600 mb-4">
              Processing...
            </div>
          )}
        </div>

        {result && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2 text-white">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Quick Fix Steps:</h3>
          <ol className="text-yellow-700 text-sm space-y-1 list-decimal list-inside">
            <li><strong>List Users</strong> - See what's in the database</li>
            <li><strong>Create User</strong> - Add the failing user to database</li>
            <li><strong>Test Login</strong> - Verify the login works</li>
            <li><strong>Check Server Logs</strong> - Watch console for debug details</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

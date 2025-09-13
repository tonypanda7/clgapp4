import React, { useState } from "react";

export default function Fix401() {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createMissingUser = async () => {
    setIsLoading(true);
    setResult("Creating missing user...");

    try {
      // Create the exact user that's failing to login
      const userData = {
        fullName: "Test User",
        universityEmail: "a@snuchennai.edu.in",
        password: ".x-K,.2RWPj*>i@",
        confirmPassword: ".x-K,.2RWPj*>i@"
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        setResult(`✅ SUCCESS! User created successfully.

Email: ${userData.universityEmail}
Status: ${response.status}
Message: ${data.message}

🎉 The 401 error should now be fixed! 
Try logging in again with these credentials.`);
      } else {
        setResult(`❌ User creation failed:
Status: ${response.status}
Message: ${data.message}
Errors: ${data.errors ? JSON.stringify(data.errors, null, 2) : 'None'}`);
      }

    } catch (error) {
      setResult(`❌ Network error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    setResult("Testing login...");

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

      if (response.status === 200 && data.success) {
        setResult(`✅ LOGIN SUCCESS!

User: ${data.user.fullName}
Email: ${data.user.universityEmail}
Token: ${data.token ? 'Generated' : 'None'}

🎉 401 error is completely fixed!`);
      } else {
        setResult(`❌ Login still failing:
Status: ${response.status}
Message: ${data.message}

Check server logs for more details.`);
      }

    } catch (error) {
      setResult(`❌ Login test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-red-600">
          🚨 Fix HTTP 401 Error
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">Problem Identified:</h3>
            <p className="text-red-700 text-sm">
              User "a@snuchennai.edu.in" doesn't exist in the database.
              <br />
              <strong>Server logs show:</strong> "Login failed: User not found"
            </p>
          </div>

          <h2 className="text-xl font-semibold mb-4">Quick Fix</h2>
          
          <div className="space-y-4">
            <button
              onClick={createMissingUser}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg disabled:opacity-50 font-semibold"
            >
              {isLoading ? "⏳ Creating User..." : "1️⃣ Create Missing User"}
            </button>
            
            <button
              onClick={testLogin}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-lg disabled:opacity-50 font-semibold"
            >
              {isLoading ? "⏳ Testing..." : "2️⃣ Test Login"}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-gray-900 text-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-green-400">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">After Fix:</h3>
          <p className="text-blue-700 text-sm mb-3">
            Once the user is created, try logging in normally:
          </p>
          <a
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
          >
            🔓 Go to Login Page
          </a>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";

export default function LoginTest() {
  const [testResult, setTestResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testValidLogin = async () => {
    setIsLoading(true);
    setTestResult("");

    try {
      // First create a user to test with
      const signupData = {
        fullName: "Test User",
        universityEmail: "test@snuchennai.edu.in",
        password: "password123",
        confirmPassword: "password123",
        phoneNumber: "1234567890",
        universityName: "snuchennai",
        universityId: "TEST123",
        program: "Computer Science",
        yearOfStudy: "1st"
      };

      // Clear database first
      await fetch("/api/admin/clear-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      // Create user
      await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      // Now test login
      const loginData = {
        username: "test@snuchennai.edu.in",
        password: "password123"
      };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const responseText = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        parsedData = { error: "Not JSON", rawText: responseText };
      }

      setTestResult(`Valid Login Test:
Status: ${response.status}
Response: ${JSON.stringify(parsedData, null, 2)}`);

    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testInvalidCredentials = async () => {
    setIsLoading(true);
    setTestResult("");

    try {
      const loginData = {
        username: "nonexistent@example.com",
        password: "wrongpassword"
      };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const responseText = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        parsedData = { error: "Not JSON", rawText: responseText };
      }

      setTestResult(`Invalid Credentials Test:
Status: ${response.status}
Response: ${JSON.stringify(parsedData, null, 2)}`);

    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEmptyFields = async () => {
    setIsLoading(true);
    setTestResult("");

    try {
      const loginData = {
        username: "",
        password: ""
      };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const responseText = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        parsedData = { error: "Not JSON", rawText: responseText };
      }

      setTestResult(`Empty Fields Test:
Status: ${response.status}
Response: ${JSON.stringify(parsedData, null, 2)}`);

    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-600">
          🔧 Login Error Debug & Test
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">Error Being Fixed:</h3>
            <code className="text-red-700 text-sm">
              Login error: handleSubmit@Index.tsx:36:41
            </code>
          </div>

          <h2 className="text-xl font-semibold mb-4">Test Login Scenarios</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={testValidLogin}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded disabled:opacity-50"
            >
              ✅ Test Valid Login
            </button>
            
            <button
              onClick={testInvalidCredentials}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded disabled:opacity-50"
            >
              ❌ Test Invalid Credentials
            </button>
            
            <button
              onClick={testEmptyFields}
              disabled={isLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded disabled:opacity-50"
            >
              📝 Test Empty Fields
            </button>
          </div>

          {isLoading && (
            <div className="text-center text-blue-600 mb-4">
              Testing login functionality...
            </div>
          )}
        </div>

        {testResult && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2 text-white">Test Result:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto">
              {testResult}
            </pre>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">What Was Fixed:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>✅ <strong>Response Handling:</strong> Added proper error response parsing</li>
              <li>✅ <strong>Frontend Validation:</strong> Check fields before API call</li>
              <li>✅ <strong>User Messages:</strong> Clear error messages for all scenarios</li>
              <li>✅ <strong>LocalStorage:</strong> Safe storage with error handling</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Test Real Login:</h3>
            <p className="text-green-700 text-sm mb-3">
              After testing here, try the actual login form:
            </p>
            <a
              href="/"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded inline-block"
            >
              🚀 Go to Login Form
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

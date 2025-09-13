import React, { useState } from "react";

export default function ResponseErrorTest() {
  const [testResult, setTestResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testResponseError = async () => {
    setIsLoading(true);
    setTestResult("");

    try {
      // First, create a user to ensure duplicate email scenario
      const userData = {
        fullName: "Test User",
        universityEmail: "responsetest@snuchennai.edu.in",
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

      // Create first user
      const firstResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      console.log("First signup status:", firstResponse.status);

      // Try to create duplicate user (this should trigger the error)
      const secondResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      console.log("Second signup status:", secondResponse.status);

      // Test our error handling approach
      let result = `Response Error Handling Test:
First signup: ${firstResponse.status}
Second signup: ${secondResponse.status}

`;

      if (!secondResponse.ok) {
        let errorData: any = null;
        let responseText = "";

        // Test the same approach used in SignUp.tsx
        try {
          const responseClone = secondResponse.clone();
          errorData = await secondResponse.json();
          result += `✅ Direct JSON parsing succeeded:\n${JSON.stringify(errorData, null, 2)}\n\n`;
        } catch (jsonError) {
          result += `⚠️ Direct JSON parsing failed: ${jsonError}\n`;
          
          try {
            responseText = await secondResponse.text();
            result += `📄 Raw response text: ${responseText}\n`;
            
            if (responseText.trim()) {
              try {
                errorData = JSON.parse(responseText);
                result += `✅ Text-to-JSON parsing succeeded:\n${JSON.stringify(errorData, null, 2)}\n\n`;
              } catch (parseError) {
                result += `❌ Text-to-JSON parsing failed: ${parseError}\n\n`;
              }
            }
          } catch (readError) {
            result += `❌ Could not read response at all: ${readError}\n\n`;
          }
        }

        // Show what the user would see
        if (errorData && errorData.errors && Array.isArray(errorData.errors)) {
          result += `👤 User would see errors:\n`;
          errorData.errors.forEach((err: string, index: number) => {
            if (err.includes("already registered")) {
              result += `${index + 1}. ⚠️ This email address is already registered. Please try one of these options:\n`;
            } else {
              result += `${index + 1}. ${err}\n`;
            }
          });
        } else if (errorData && errorData.message) {
          result += `👤 User would see message:\n`;
          if (errorData.message.includes("already registered")) {
            result += "⚠️ This email address is already registered. Please try one of these options:\n";
          } else {
            result += `${errorData.message}\n`;
          }
        }
      }

      setTestResult(result);

    } catch (error) {
      setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testActualSignupForm = () => {
    // Open signup form in new tab for testing
    window.open("/signup", "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-red-600">
          🔧 Response Error Fix Test
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">Error Being Fixed:</h3>
            <code className="text-red-700 text-sm block">
              HTTP error: 400<br/>
              Could not read response: handleSubmit@SignUp.tsx:112:51
            </code>
          </div>

          <h2 className="text-xl font-semibold mb-4">Test Response Error Handling</h2>
          
          <div className="space-y-4">
            <button
              onClick={testResponseError}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
            >
              {isLoading ? "Testing..." : "🧪 Test Response Error Handling"}
            </button>

            <button
              onClick={testActualSignupForm}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg ml-4"
            >
              🚀 Test Real Signup Form
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p><strong>This test will:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Create a user in the database</li>
              <li>Try to create a duplicate user (triggering 400 error)</li>
              <li>Test our improved response error handling</li>
              <li>Show exactly what the user would see</li>
            </ul>
          </div>
        </div>

        {testResult && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2 text-white">Test Results:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto">
              {testResult}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">🔧 Fixes Applied:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>✅ <strong>Response Cloning:</strong> Clone response before attempting JSON parsing</li>
            <li>✅ <strong>Multiple Approaches:</strong> Try JSON first, then text as fallback</li>
            <li>✅ <strong>Error Tolerance:</strong> Handle all types of response reading failures</li>
            <li>✅ <strong>User-Friendly Messages:</strong> Convert technical errors to helpful messages</li>
            <li>✅ <strong>Graceful Degradation:</strong> Fallback to HTTP status-based messages if all else fails</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

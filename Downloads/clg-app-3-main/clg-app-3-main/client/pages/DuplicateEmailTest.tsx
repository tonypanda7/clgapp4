import React, { useState } from "react";

export default function DuplicateEmailTest() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");

  const testDuplicateEmailScenario = async () => {
    setIsLoading(true);
    setResult("");

    try {
      const userData = {
        fullName: "Ajay Saravana Chocklingam",
        universityEmail: "ajay24110062@snuchennai.edu.in",
        password: "password123",
        confirmPassword: "password123",
        phoneNumber: "9876543210",
        universityName: "snuchennai",
        universityId: "HBS10C02",
        program: "Computer Science",
        yearOfStudy: "2nd"
      };

      console.log("Testing duplicate email error handling...");

      // First, ensure the email is already in the database
      const firstResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      console.log("First signup status:", firstResponse.status);

      // Now try to sign up again with the same email (should fail)
      const secondResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      console.log("Second signup status:", secondResponse.status);

      // Read the error response manually to see what we get
      const responseText = await secondResponse.text();
      console.log("Raw response text:", responseText);

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
        console.log("Parsed response:", parsedResponse);
      } catch (parseError) {
        console.log("Response is not JSON:", parseError);
        parsedResponse = { error: "Not JSON", rawText: responseText };
      }

      setResult(`Test Results:
First Signup Status: ${firstResponse.status}
Second Signup Status: ${secondResponse.status}

Raw Response Text:
${responseText}

Parsed Response:
${JSON.stringify(parsedResponse, null, 2)}

Expected: Should show user-friendly message about email already being registered.`);

      setStep(2);

    } catch (error) {
      console.error("Test error:", error);
      setResult(`Test failed with error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAndTest = async () => {
    setIsLoading(true);
    setResult("");

    try {
      // Clear database first
      console.log("Clearing database...");
      const clearResponse = await fetch("/api/admin/clear-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const clearData = await clearResponse.json();
      console.log("Database cleared:", clearData);

      // Then run the duplicate test
      await testDuplicateEmailScenario();

    } catch (error) {
      setResult(`Clear and test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-red-600">
          🔧 Fix Test: Duplicate Email Error Handling
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">Error Being Fixed:</h3>
            <code className="text-red-700 text-sm block">
              HTTP error: 400<br/>
              JSON parsing failed, trying text<br/>
              Could not read error response at all
            </code>
          </div>

          <div className="space-y-4">
            {step === 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Step 1: Test the Fix</h3>
                <p className="text-gray-600 mb-4">
                  This will simulate the exact scenario that was causing the error:
                  trying to register with an email that's already in use.
                </p>
                <button
                  onClick={clearAndTest}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
                >
                  {isLoading ? "Testing..." : "🧪 Run Duplicate Email Test"}
                </button>
              </div>
            )}

            {step >= 2 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Step 2: Test Real Signup Form</h3>
                <p className="text-gray-600 mb-4">
                  Now test the actual signup form to see the improved error messages.
                </p>
                <a
                  href="/signup"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg inline-block"
                >
                  🚀 Go to Signup Form
                </a>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-white">Test Result:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">What Was Fixed:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>✅ <strong>Response Reading:</strong> Now reads response as text first, then parses JSON</li>
            <li>✅ <strong>Error Handling:</strong> Better fallback when JSON parsing fails</li>
            <li>✅ <strong>User Messages:</strong> Clear, friendly error messages</li>
            <li>✅ <strong>No More Crashes:</strong> Graceful handling of all response types</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

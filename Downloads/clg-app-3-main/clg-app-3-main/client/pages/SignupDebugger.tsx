import React, { useState } from "react";

export default function SignupDebugger() {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testSignupWithCurrentUser = async () => {
    setIsLoading(true);
    setResult("");

    const testData = {
      fullName: "Ajay Saravana Chocklingam",
      universityEmail: "ajay24110062@snuchennai.edu.in",
      password: "password123",
      confirmPassword: "password123",
      phoneNumber: "1234567890",
      universityName: "snuchennai",
      universityId: "HBS10C02",
      program: "computer science",
      yearOfStudy: "2nd"
    };

    try {
      console.log("Sending signup request with data:", testData);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);

      // Read response as text first
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        parsedData = { error: "Could not parse as JSON", rawText: responseText };
      }

      setResult(JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        rawResponse: responseText,
        parsedData: parsedData
      }, null, 2));

    } catch (error) {
      console.error("Request error:", error);
      setResult(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCollegeVerification = async () => {
    setIsLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/college/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "ajay24110062@snuchennai.edu.in" }),
      });

      const responseText = await response.text();
      console.log("College verification response:", responseText);

      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        parsedData = { error: "Could not parse as JSON", rawText: responseText };
      }

      setResult(`College Verification Result:\n${JSON.stringify(parsedData, null, 2)}`);

    } catch (error) {
      setResult(`College verification failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearDatabase = async () => {
    if (!confirm("Clear all users from database?")) return;

    setIsLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/admin/clear-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        parsedData = { error: "Could not parse as JSON", rawText: responseText };
      }

      setResult(`Database Clear Result:\n${JSON.stringify(parsedData, null, 2)}`);

    } catch (error) {
      setResult(`Clear database failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Signup Error Debugger</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Actions</h2>
          <div className="space-y-4">
            <button
              onClick={testSignupWithCurrentUser}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md disabled:opacity-50 mr-4"
            >
              {isLoading ? "Testing..." : "Test Signup (Your Data)"}
            </button>

            <button
              onClick={testCollegeVerification}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md disabled:opacity-50 mr-4"
            >
              {isLoading ? "Testing..." : "Test College Verification"}
            </button>

            <button
              onClick={clearDatabase}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md disabled:opacity-50"
            >
              {isLoading ? "Clearing..." : "Clear Database First"}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-white">Debug Result:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

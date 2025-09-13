import { useState } from "react";

export default function SignupDebug() {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testSignup = async () => {
    setIsLoading(true);
    setResult("");

    try {
      const testData = {
        fullName: "Debug Test User",
        universityEmail: "debug@test.edu",
        password: "password123",
        confirmPassword: "password123",
        phoneNumber: "1234567890",
        universityName: "harvard",
        universityId: "DEBUG123",
        program: "computer science",
        yearOfStudy: "1st"
      };

      console.log("Sending signup request:", testData);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      console.log("Response received:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        setResult(`HTTP Error ${response.status}: ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log("Response data:", data);
      setResult(JSON.stringify(data, null, 2));

    } catch (error) {
      console.error("Signup test error:", error);
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testBackendStatus = async () => {
    setIsLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/status");
      console.log("Status response:", response.status);
      
      if (!response.ok) {
        setResult(`Status check failed: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Status check error:", error);
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Signup Debug Tool</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testBackendStatus}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md disabled:opacity-50 mr-4"
          >
            {isLoading ? "Testing..." : "Test Backend Status"}
          </button>
          
          <button
            onClick={testSignup}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Test Signup API"}
          </button>
        </div>

        {result && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

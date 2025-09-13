import React, { useState } from "react";

export default function RequestDebug() {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testRequest = async () => {
    setIsLoading(true);
    setResult("");

    try {
      // Test with minimal valid data
      const testData = {
        fullName: "Test User",
        universityEmail: "test@university.edu",
        password: "password123",
        confirmPassword: "password123",
        phoneNumber: "1234567890",
        universityName: "harvard",
        universityId: "TEST123",
        program: "computer science",
        yearOfStudy: "1st"
      };

      console.log("Sending test data:", testData);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);

      let responseText;
      try {
        responseText = await response.text();
        console.log("Raw response text:", responseText);
      } catch (textError) {
        console.error("Could not read response text:", textError);
        responseText = "Could not read response";
      }

      // Try to parse as JSON
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
        console.log("Parsed JSON:", parsedData);
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        parsedData = { error: "Not valid JSON", rawText: responseText };
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

  const testEmptyRequest = async () => {
    setIsLoading(true);
    setResult("");

    try {
      console.log("Sending empty request");

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const responseText = await response.text();
      console.log("Empty request response:", responseText);

      setResult(`Empty request result:\nStatus: ${response.status}\nResponse: ${responseText}`);

    } catch (error) {
      console.error("Empty request error:", error);
      setResult(`Empty request failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Request Debug Tool</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testRequest}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md disabled:opacity-50 mr-4"
          >
            {isLoading ? "Testing..." : "Test Valid Signup Request"}
          </button>
          
          <button
            onClick={testEmptyRequest}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Test Empty Request"}
          </button>
        </div>

        {result && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Debug Result:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";

export default function ErrorMessageTest() {
  const [testResult, setTestResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testInvalidEmail = async () => {
    setIsLoading(true);
    setTestResult("");

    const invalidData = {
      fullName: "Test User",
      universityEmail: "invalid-email", // Invalid email format
      password: "password123",
      confirmPassword: "password123",
      phoneNumber: "1234567890",
      universityName: "test",
      universityId: "TEST123",
      program: "Test Program",
      yearOfStudy: "1st"
    };

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      const data = await response.json();
      setTestResult(`Invalid Email Test:\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDuplicateEmail = async () => {
    setIsLoading(true);
    setTestResult("");

    const userData = {
      fullName: "First User",
      universityEmail: "test@snuchennai.edu.in",
      password: "password123",
      confirmPassword: "password123",
      phoneNumber: "1234567890",
      universityName: "snuchennai",
      universityId: "TEST123",
      program: "Computer Science",
      yearOfStudy: "1st"
    };

    try {
      // First signup (should succeed)
      await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      // Second signup with same email (should fail)
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({...userData, fullName: "Second User"}),
      });

      const data = await response.json();
      setTestResult(`Duplicate Email Test:\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testMissingFields = async () => {
    setIsLoading(true);
    setTestResult("");

    const incompleteData = {
      fullName: "", // Missing
      universityEmail: "", // Missing
      password: "123", // Too short
      confirmPassword: "456", // Doesn't match
      phoneNumber: "",
      universityName: "",
      universityId: "",
      program: "",
      yearOfStudy: ""
    };

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incompleteData),
      });

      const data = await response.json();
      setTestResult(`Missing Fields Test:\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearDatabase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/clear-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setTestResult(`Database cleared: ${data.message}`);
    } catch (error) {
      setTestResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Error Message Testing</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Error Scenarios</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={clearDatabase}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded disabled:opacity-50"
            >
              🗑️ Clear Database First
            </button>
            
            <button
              onClick={testInvalidEmail}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded disabled:opacity-50"
            >
              📧 Test Invalid Email
            </button>
            
            <button
              onClick={testDuplicateEmail}
              disabled={isLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded disabled:opacity-50"
            >
              👥 Test Duplicate Email
            </button>
            
            <button
              onClick={testMissingFields}
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded disabled:opacity-50"
            >
              📝 Test Missing Fields
            </button>
          </div>

          {isLoading && (
            <div className="text-center text-blue-600 mb-4">
              Testing error messages...
            </div>
          )}
        </div>

        {testResult && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-white">Test Result:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto">
              {testResult}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Testing Instructions:</h3>
          <ol className="text-blue-700 text-sm space-y-1">
            <li>1. Click "Clear Database First" to start fresh</li>
            <li>2. Test each error scenario to see the improved messages</li>
            <li>3. Check the signup form at <a href="/signup" className="underline">/signup</a> to see how errors display</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

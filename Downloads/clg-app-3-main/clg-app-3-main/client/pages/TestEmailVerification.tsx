import { useState } from "react";

export default function TestEmailVerification() {
  const [testEmail, setTestEmail] = useState("test@harvard.edu");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testSignup = async () => {
    setIsLoading(true);
    setResult("");

    try {
      const signupData = {
        fullName: "Test Student",
        universityEmail: testEmail,
        password: "password123",
        confirmPassword: "password123",
        phoneNumber: "1234567890",
        universityName: "harvard",
        universityId: "TEST123",
        program: "computer science",
        yearOfStudy: "1st"
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testStatus = async () => {
    setIsLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/status");
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Email Verification Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Signup</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Test Email:</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="test@university.edu"
            />
          </div>
          <button
            onClick={testSignup}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Test Signup"}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Backend Status</h2>
          <button
            onClick={testStatus}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Test Status"}
          </button>
        </div>

        {result && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

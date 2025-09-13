import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function DuplicateEmailDemo() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");

  const createTestUser = async () => {
    setIsLoading(true);
    setResult("");

    try {
      // Clear database first
      await fetch("/api/admin/clear-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      // Create a test user with your email
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

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (response.ok || data.success) {
        setResult("✅ Test user created successfully!");
        setStep(2);
      } else {
        setResult(`❌ Failed to create test user: ${data.message}`);
      }

    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-red-600">
          📧 Duplicate Email Error Handling Demo
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Demo Purpose:</h3>
            <p className="text-blue-700 text-sm">
              This demo shows how the signup form handles duplicate email addresses with helpful error messages and action buttons.
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Step 1: Create Test User</h3>
                <p className="text-gray-600 mb-4">
                  First, let's create a user with your email address: <code className="bg-gray-100 px-2 py-1 rounded">ajay24110062@snuchennai.edu.in</code>
                </p>
                <button
                  onClick={createTestUser}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
                >
                  {isLoading ? "Creating User..." : "🔄 Create Test User"}
                </button>
              </div>
            </div>
          )}

          {step >= 2 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Step 2: Test Duplicate Email</h3>
                <p className="text-green-700 mb-4">
                  Great! Now go to the signup form and try to register with the same email address to see the enhanced error handling.
                </p>
                <div className="space-y-3">
                  <div className="text-sm text-green-600">
                    <strong>What you'll see:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>⚠️ Clear error message about duplicate email</li>
                      <li>🔑 "Try logging in instead" button</li>
                      <li>✏️ "Use a different email" button that clears the field</li>
                      <li>🔒 "Reset password" option</li>
                    </ul>
                  </div>
                  <Link
                    to="/signup"
                    className="inline-block bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg"
                  >
                    🚀 Go to Signup Form & Test
                  </Link>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Testing Instructions:</h4>
                <ol className="text-yellow-700 text-sm space-y-1">
                  <li>1. Fill out the signup form with email: <code>ajay24110062@snuchennai.edu.in</code></li>
                  <li>2. Complete all other required fields</li>
                  <li>3. Click "Sign Up" to see the enhanced error handling</li>
                  <li>4. Try the helpful action buttons in the error message</li>
                </ol>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold mb-2">Result:</h4>
              <div className="text-sm">{result}</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🔧 Enhanced Error Features:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Visual Improvements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Clear warning icon and styling</li>
                <li>✅ Red left border for attention</li>
                <li>✅ Professional error layout</li>
                <li>✅ Responsive design</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">User Actions:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>🔑 Login button (redirects to login page)</li>
                <li>✏️ Clear email field (for trying different email)</li>
                <li>🔒 Password reset option</li>
                <li>💡 Clear next steps guidance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

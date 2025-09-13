import React, { useState } from "react";

export default function QuickFix() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");

  const clearDatabase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/clear-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(`✅ Database cleared! ${data.usersDeleted} users removed.`);
        setStep(2);
      } else {
        setResult(`❌ Failed: ${data.message}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSignup = async () => {
    setIsLoading(true);
    try {
      const signupData = {
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
        body: JSON.stringify(signupData),
      });

      const data = await response.json();
      if (data.success) {
        setResult("✅ Signup successful! You can now use the main signup form.");
        setStep(3);
      } else {
        setResult(`❌ Signup failed: ${data.message || JSON.stringify(data)}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          🔧 Quick Fix for Signup Error
        </h1>

        <div className="space-y-6">
          {/* Problem Explanation */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">The Problem:</h3>
            <p className="text-red-700 text-sm">
              HTTP 400 error because your email <code>ajay24110062@snuchennai.edu.in</code> is already registered in the database.
            </p>
          </div>

          {/* Step 1 */}
          {step >= 1 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Step 1: Clear Database</h3>
              <p className="text-sm text-gray-600 mb-3">
                Remove existing registration to allow fresh signup.
              </p>
              <button
                onClick={clearDatabase}
                disabled={isLoading || step > 1}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {isLoading ? "Clearing..." : step > 1 ? "✓ Cleared" : "Clear Database"}
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step >= 2 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Step 2: Test Signup</h3>
              <p className="text-sm text-gray-600 mb-3">
                Test signup with your exact details to ensure it works.
              </p>
              <button
                onClick={testSignup}
                disabled={isLoading || step > 2}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {isLoading ? "Testing..." : step > 2 ? "✓ Tested" : "Test Signup"}
              </button>
            </div>
          )}

          {/* Step 3 */}
          {step >= 3 && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Step 3: Use Main Form</h3>
              <p className="text-sm text-green-700 mb-3">
                Now go back to the main signup form - it should work!
              </p>
              <a
                href="/signup"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
              >
                Go to Signup Form
              </a>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-gray-100 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Result:</h4>
              <div className="text-sm">{result}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

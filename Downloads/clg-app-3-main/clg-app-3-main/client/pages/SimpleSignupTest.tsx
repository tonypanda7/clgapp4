import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SimpleSignupTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const navigate = useNavigate();

  const testSimpleSignup = async () => {
    setIsLoading(true);
    setResult("");

    try {
      console.log("Starting simple signup test...");
      
      // Test data
      const testData = {
        fullName: "Simple Test User",
        universityEmail: "simple@test.edu",
        password: "password123",
        confirmPassword: "password123", 
        phoneNumber: "1234567890",
        universityName: "harvard",
        universityId: "SIMPLE123",
        program: "computer science",
        yearOfStudy: "1st"
      };

      console.log("Calling signup API...");
      
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      console.log("Response received:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        setResult(`HTTP Error: ${response.status} - ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log("Response data:", data);

      // Test the exact logic that's failing
      if (data.success && data.user) {
        if (data.requiresVerification) {
          setResult("SUCCESS: Requires verification");
        } else {
          console.log("About to test localStorage and navigation...");
          
          // Test localStorage
          try {
            if (data.token) {
              localStorage.setItem("authToken", data.token);
              localStorage.setItem("userData", JSON.stringify(data.user));
              console.log("localStorage operations succeeded");
            }
          } catch (storageError) {
            console.error("localStorage failed:", storageError);
            setResult(`localStorage failed: ${storageError}`);
            return;
          }

          // Test navigation
          try {
            console.log("About to navigate...");
            setResult("SUCCESS: About to navigate to dashboard");
            
            // Delay navigation to see the success message
            setTimeout(() => {
              navigate("/dashboard");
            }, 2000);
            
          } catch (navError) {
            console.error("Navigation failed:", navError);
            setResult(`Navigation failed: ${navError}`);
          }
        }
      } else {
        setResult(`Signup failed: ${data.message || "Unknown error"}`);
      }

    } catch (error) {
      console.error("Test error:", error);
      setResult(`Test error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simple Signup Test</h1>
        
        <div className="mb-8">
          <button
            onClick={testSimpleSignup}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Test Simple Signup Flow"}
          </button>
        </div>

        {result && (
          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Result:</h3>
            <div className="text-sm">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

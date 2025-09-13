import React, { useState } from "react";
import CollegeEmailVerifier from "../components/CollegeEmailVerifier";

export default function CollegeVerificationTest() {
  const [testEmail, setTestEmail] = useState("ajay24110062@snuchennai.edu.in");
  const [verificationStatus, setVerificationStatus] = useState<{
    isVerified: boolean;
    collegeInfo?: any;
  }>({ isVerified: false });

  const handleVerificationChange = (isVerified: boolean, collegeInfo?: any) => {
    setVerificationStatus({ isVerified, collegeInfo });
    console.log("Verification changed:", { isVerified, collegeInfo });
  };

  const testEmails = [
    "ajay24110062@snuchennai.edu.in",
    "student@vit.ac.in",
    "test@harvard.edu",
    "user@mit.edu",
    "invalid@gmail.com",
    "wrong@yahoo.com",
    "test@iitm.ac.in"
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">College Email Verification System</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Email Verification</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Enter College Email:
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="student@university.edu"
            />
          </div>

          {/* College Email Verifier Component */}
          <CollegeEmailVerifier
            email={testEmail}
            onVerificationChange={handleVerificationChange}
            showVerifyButton={true}
          />

          {/* Verification Status */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Verification Status:</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Status:</span>{" "}
                <span className={verificationStatus.isVerified ? "text-green-600" : "text-red-600"}>
                  {verificationStatus.isVerified ? "✅ Verified College Email" : "❌ Not Verified"}
                </span>
              </div>
              
              {verificationStatus.collegeInfo && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div><strong>College:</strong> {verificationStatus.collegeInfo.name}</div>
                  <div><strong>Domain:</strong> {verificationStatus.collegeInfo.domain}</div>
                  <div><strong>Country:</strong> {verificationStatus.collegeInfo.country}</div>
                  <div><strong>Type:</strong> {verificationStatus.collegeInfo.type}</div>
                  <div><strong>Verified Institution:</strong> {verificationStatus.collegeInfo.verified ? "Yes" : "No"}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Test Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Test Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testEmails.map((email) => (
              <button
                key={email}
                onClick={() => setTestEmail(email)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  testEmail === email 
                    ? "bg-blue-100 border-blue-300" 
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="font-medium text-sm">{email}</div>
                <div className="text-xs text-gray-500">
                  {email.includes('.edu') || email.includes('.ac.') ? 'College Email' : 'Personal Email'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* API Test Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Direct API Test</h2>
          <APITestSection />
        </div>
      </div>
    </div>
  );
}

function APITestSection() {
  const [apiResult, setApiResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async (endpoint: string, data: any) => {
    setIsLoading(true);
    setApiResult("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setApiResult(JSON.stringify({ status: response.status, data: result }, null, 2));
    } catch (error) {
      setApiResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          onClick={() => testAPI("/api/college/verify-email", { email: "ajay24110062@snuchennai.edu.in" })}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Verify SNU Email
        </button>
        
        <button
          onClick={() => testAPI("/api/college/verify-email", { email: "test@gmail.com" })}
          disabled={isLoading}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Invalid Email
        </button>

        <button
          onClick={() => testAPI("/api/college/send-verification", { email: "ajay24110062@snuchennai.edu.in" })}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Send Verification
        </button>
      </div>

      {isLoading && <div className="text-blue-600">Testing API...</div>}

      {apiResult && (
        <div className="bg-gray-900 text-green-400 rounded p-4">
          <h4 className="text-sm font-semibold mb-2">API Response:</h4>
          <pre className="text-xs overflow-auto">{apiResult}</pre>
        </div>
      )}
    </div>
  );
}

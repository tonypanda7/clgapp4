import React, { useState, useEffect, useRef } from "react";

interface CollegeInfo {
  name: string;
  domain: string;
  country: string;
  type: string;
  verified: boolean;
}

interface CollegeEmailVerifierProps {
  email: string;
  onVerificationChange: (
    isVerified: boolean,
    collegeInfo?: CollegeInfo,
    errorMessage?: string,
    suggestions?: string[],
  ) => void;
  showVerifyButton?: boolean;
}

export default function CollegeEmailVerifier({
  email,
  onVerificationChange,
  showVerifyButton = true,
}: CollegeEmailVerifierProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isCollegeEmail: boolean;
    collegeInfo?: CollegeInfo;
    suggestions?: string[];
    message: string;
  } | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // Use ref to store the latest callback to avoid dependency issues
  const onVerificationChangeRef = useRef(onVerificationChange);
  onVerificationChangeRef.current = onVerificationChange;

  // Auto-verify when email changes (with debouncing)
  useEffect(() => {
    // Cancel any ongoing request
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }

    // Clear previous result immediately when email changes
    setVerificationResult(null);
    setIsVerifying(false);

    // Only verify if email looks complete (has @ and a domain)
    if (
      email &&
      email.includes("@") &&
      email.includes(".") &&
      email.length > 5
    ) {
      // Debounce the verification to avoid too many API calls
      const timeoutId = setTimeout(() => {
        verifyCollegeEmail();
      }, 500); // Wait 500ms after user stops typing

      return () => clearTimeout(timeoutId);
    }
  }, [email]);

  const verifyCollegeEmail = async () => {
    if (!email) return;

    // Create new abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);

    setIsVerifying(true);
    try {
      const response = await fetch("/api/college/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      if (!response.ok) {
        // Handle HTTP error responses
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response isn't JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        setVerificationResult({
          isCollegeEmail: false,
          message: errorMessage,
        });
        onVerificationChangeRef.current(false, undefined, errorMessage, []);
        return;
      }

      const data = await response.json();
      console.log("College verification result:", data);

      setVerificationResult({
        isCollegeEmail: data.isCollegeEmail || false,
        collegeInfo: data.collegeInfo,
        suggestions: data.suggestions,
        message: data.message || "Verification completed",
      });

      onVerificationChangeRef.current(
        data.isCollegeEmail || false,
        data.collegeInfo,
        data.isCollegeEmail ? undefined : data.message,
        data.suggestions || [],
      );
    } catch (error) {
      // Don't show error if request was aborted (user is still typing)
      if (error instanceof Error && error.name === "AbortError") {
        console.log("College verification request aborted");
        return;
      }

      console.error("College verification error:", error);
      setVerificationResult({
        isCollegeEmail: false,
        message: "Network error. Please check your connection and try again.",
      });
      onVerificationChangeRef.current(false, undefined, "Network error. Please check your connection and try again.");
    } finally {
      setIsVerifying(false);
      setAbortController(null);
    }
  };

  const sendVerificationEmail = async () => {
    if (!email || !verificationResult?.isCollegeEmail) return;

    setIsSendingEmail(true);
    try {
      const response = await fetch("/api/college/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log("Verification email result:", data);

      if (data.success) {
        setEmailSent(true);
      } else {
        alert("Failed to send verification email: " + data.message);
      }
    } catch (error) {
      console.error("Send verification email error:", error);
      alert("Failed to send verification email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getStatusColor = () => {
    if (isVerifying) return "text-yellow-600";
    if (!verificationResult) return "text-gray-500";
    if (verificationResult.isCollegeEmail) return "text-green-600";
    return "text-red-600";
  };

  const getStatusIcon = () => {
    if (isVerifying) return "⏳";
    if (!verificationResult) return "📧";
    if (verificationResult.isCollegeEmail) return "✅";
    return "❌";
  };

  if (!email) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* College Info - Only show positive verification results */}
      {verificationResult?.isCollegeEmail && verificationResult.collegeInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm font-semibold text-green-800">
            {verificationResult.collegeInfo.name}
          </div>
          <div className="text-xs text-green-600">
            {verificationResult.collegeInfo.type.charAt(0).toUpperCase() +
              verificationResult.collegeInfo.type.slice(1)}{" "}
            • {verificationResult.collegeInfo.country}
            {verificationResult.collegeInfo.verified && (
              <span className="ml-2 text-green-700">
                ✓ Verified Institution
              </span>
            )}
          </div>
        </div>
      )}

      {/* Send Verification Email Button */}
      {showVerifyButton && verificationResult?.isCollegeEmail && !emailSent && (
        <div className="flex justify-center">
          <button
            onClick={sendVerificationEmail}
            disabled={isSendingEmail}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-roboto-condensed disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingEmail ? "Sending..." : "Send Verification Email"}
          </button>
        </div>
      )}

      {/* Email Sent Confirmation */}
      {emailSent && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            ✉️ Verification email sent to <strong>{email}</strong>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Please check your inbox and click the verification link.
          </div>
        </div>
      )}
    </div>
  );
}

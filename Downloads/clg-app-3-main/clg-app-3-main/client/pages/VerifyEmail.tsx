import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { VerifyEmailRequest, AuthResponse, EmailVerificationRequest, EmailVerificationResponse } from "@shared/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const verifyData: VerifyEmailRequest = { token: verificationToken };

      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verifyData),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user && data.token) {
        // Store user data and token in localStorage
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userData", JSON.stringify(data.user));

        setIsVerified(true);
        setMessage("Email verified successfully! Your college data has been retrieved.");
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } else {
        setError(data.message || "Email verification failed");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email) {
      setError("Please enter your university email");
      return;
    }

    setIsResending(true);
    setError("");
    setMessage("");

    try {
      const resendData: EmailVerificationRequest = { universityEmail: email };

      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resendData),
      });

      const data: EmailVerificationResponse = await response.json();

      if (data.success) {
        setMessage("Verification email sent successfully! Please check your inbox.");
      } else {
        setError(data.message || "Failed to resend verification email");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/63b43ce4dc3d2f841c3902f4e84bfe3c64ec714d?width=2880"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-white/10" />
      
      {/* Content Container */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white/20 backdrop-blur-md rounded-[50px] p-8 lg:p-16 border border-white/30">
          {/* Header Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Link 
              to="/"
              className="font-roboto-condensed text-xs font-normal text-black opacity-70 hover:opacity-100 transition-opacity"
            >
              Sign In
            </Link>
            <Link 
              to="/signup"
              className="font-roboto-condensed text-xs font-normal text-black opacity-70 hover:opacity-100 transition-opacity"
            >
              Sign Up
            </Link>
          </div>

          {/* Title */}
          <h1 className="font-roboto-condensed text-4xl lg:text-[40px] font-bold text-black mb-8">
            Email Verification
          </h1>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="font-roboto-condensed text-lg text-black">
                Verifying your email...
              </p>
            </div>
          )}

          {/* Success State */}
          {isVerified && (
            <div className="text-center">
              <div className="text-green-600 text-6xl mb-4">✓</div>
              <h2 className="font-roboto-condensed text-2xl font-bold text-black mb-4">
                Email Verified!
              </h2>
              <p className="font-roboto-condensed text-lg text-black mb-4">
                Your college data has been retrieved and your profile is now complete.
              </p>
              <p className="font-roboto-condensed text-sm text-black opacity-70">
                Redirecting to dashboard in 3 seconds...
              </p>
            </div>
          )}

          {/* Error State or Manual Verification */}
          {!isLoading && !isVerified && (
            <div>
              {/* Success Messages */}
              {message && (
                <div className="bg-green-500/20 border border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6">
                  {message}
                </div>
              )}

              {/* Error Messages */}
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {/* Instructions */}
              {!token && (
                <div className="mb-8">
                  <p className="font-roboto-condensed text-lg text-black mb-4">
                    Please check your university email for a verification link.
                  </p>
                  <p className="font-roboto-condensed text-sm text-black opacity-70 mb-6">
                    If you didn't receive the email, you can request a new verification email below.
                  </p>
                </div>
              )}

              {/* Resend Verification Form */}
              <div className="space-y-6">
                <div className="relative">
                  <label className="block font-roboto-condensed text-xs font-normal text-black opacity-60 mb-2">
                    University Email
                  </label>
                  <div className="relative">
                    <svg 
                      className="absolute inset-0 w-full h-[49px]" 
                      viewBox="0 0 376 49" 
                      fill="none"
                    >
                      <path 
                        d="M0 24.5C0 10.969 10.969 0 24.5 0H184.74H351.5C365.031 0 376 10.969 376 24.5C376 38.031 365.031 49 351.5 49H24.5C10.969 49 0 38.031 0 24.5Z" 
                        fill="white" 
                        opacity="0.5"
                      />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your university email"
                      className="relative z-10 w-full h-[49px] px-6 bg-transparent border-none outline-none font-roboto-condensed text-sm text-black placeholder-black/60"
                    />
                  </div>
                </div>

                {/* Resend Button */}
                <div className="flex justify-center pt-6">
                  <button
                    onClick={resendVerification}
                    disabled={isResending || !email}
                    className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* Button Background with Blur Effect */}
                    <svg 
                      className="absolute inset-0 transform translate-x-3" 
                      width="150" 
                      height="61" 
                      viewBox="0 0 150 61" 
                      fill="none"
                    >
                      <g opacity="0.5" filter="url(#filter0_f_resend_btn)">
                        <path 
                          d="M10 30.0735C10 18.9872 18.9872 10 30.0735 10H70H119.927C131.013 10 140 18.9872 140 30.0735C140 41.1598 131.013 50.1471 119.927 50.1471H30.0735C18.9872 50.1471 10 41.1598 10 30.0735Z" 
                          fill="white"
                        />
                      </g>
                      <defs>
                        <filter id="filter0_f_resend_btn" x="0" y="0" width="150" height="60.1471" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                          <feGaussianBlur stdDeviation="5" result="effect1_foregroundBlur_resend_btn"/>
                        </filter>
                      </defs>
                    </svg>
                    
                    {/* Button Text */}
                    <span className="relative z-10 flex items-center justify-center w-40 h-10 font-roboto-condensed text-[15px] font-normal text-black opacity-80 group-hover:opacity-100 transition-opacity">
                      {isResending ? "Sending..." : "Resend Email"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Additional Help */}
              <div className="mt-8 text-center">
                <p className="font-roboto-condensed text-xs text-black opacity-70">
                  Having trouble? Contact support or try{" "}
                  <Link to="/signup" className="underline hover:opacity-100">
                    creating a new account
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

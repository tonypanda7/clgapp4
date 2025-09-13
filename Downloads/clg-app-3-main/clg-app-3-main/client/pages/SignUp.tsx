import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignupRequest, AuthResponse } from "@shared/api";
import CollegeEmailVerifier from "../components/CollegeEmailVerifier";

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    universityEmail: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSignupComplete, setIsSignupComplete] = useState(false);
  const [isCollegeEmailVerified, setIsCollegeEmailVerified] = useState(false);
  const [collegeInfo, setCollegeInfo] = useState<any>(null);
  const [collegeEmailError, setCollegeEmailError] = useState<string>("");
  const [showCollegeEmailError, setShowCollegeEmailError] = useState<boolean>(false);
  const navigate = useNavigate();

  // Validate navigation function on component mount
  React.useEffect(() => {
    if (typeof navigate !== "function") {
      console.error("Navigation function is not available");
    }
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (error) setError("");
    if (errors.length > 0) setErrors([]);
    // Hide college email error display but keep the error stored for validation
    if (showCollegeEmailError) setShowCollegeEmailError(false);
  };

  const handleCollegeVerification = (
    isVerified: boolean,
    collegeData?: any,
    errorMessage?: string,
  ) => {
    setIsCollegeEmailVerified(isVerified);
    setCollegeInfo(collegeData);
    // Store the error but don't show it until form submission
    setCollegeEmailError(errorMessage || "");

    if (isVerified && collegeData) {
      console.log("College verified:", collegeData.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setErrors([]);
    setShowCollegeEmailError(false);

    // Helper to derive university name from email domain if verifier data unavailable
    const deriveUniversityName = (email: string) => {
      const domain = (email.split("@")[1] || "").toLowerCase();
      const first = domain.split(".")[0] || "";
      if (!first) return "";
      return first
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    // Store form data temporarily for profile page to pick up name and university
    try {
      const temp = {
        ...formData,
        universityName: collegeInfo?.name || deriveUniversityName(formData.universityEmail),
        newAccount: true,
      };
      localStorage.setItem("tempSignupData", JSON.stringify(temp));
      console.log("Stored temp signup data for profile:", temp.fullName, temp.universityName);
    } catch (error) {
      console.warn("Could not store temp signup data:", error);
    }

    try {
      // Frontend validation
      const frontendErrors: string[] = [];

      if (!formData.fullName?.trim())
        frontendErrors.push("Full name is required");
      if (!formData.universityEmail?.trim()) {
        frontendErrors.push("University email is required");
      } else if (
        !formData.universityEmail.includes("@") ||
        !formData.universityEmail.includes(".")
      ) {
        frontendErrors.push("Please enter a valid email address");
      } else if (!isCollegeEmailVerified) {
        frontendErrors.push(
          "Please use a verified college or university email address",
        );
        // Show the college email error when form is submitted
        if (collegeEmailError) {
          setShowCollegeEmailError(true);
        }
      }
      if (!formData.password?.trim())
        frontendErrors.push("Password is required");
      if (!formData.confirmPassword?.trim())
        frontendErrors.push("Confirm password is required");

      if (formData.password !== formData.confirmPassword) {
        frontendErrors.push("Passwords do not match");
      }

      if (formData.password && formData.password.length < 6) {
        frontendErrors.push("Password must be at least 6 characters long");
      }

      if (frontendErrors.length > 0) {
        setErrors(frontendErrors);
        setError("Please fix the following errors:");
        return;
      }

      const signupData: SignupRequest = formData;
      console.log("Submitting signup data:", {
        ...signupData,
        password: "[HIDDEN]",
        confirmPassword: "[HIDDEN]",
      });

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      console.log("Response status:", response.status, response.statusText);

      let data: AuthResponse;

      if (!response.ok) {
        console.error("HTTP error:", response.status, response.statusText);

        // Handle specific error cases based on status code
        if (response.status === 400) {
          setError(
            "⚠️ This email address is already registered. Please try logging in instead.",
          );
        } else if (response.status === 409) {
          setError(
            "⚠️ This email address is already registered. Please try logging in instead.",
          );
        } else {
          setError(`Server error (${response.status}). Please try again.`);
        }
        setErrors([]);
        return;

        // Process the error data we've obtained
        if (errorData) {
          // Handle specific error scenarios with user-friendly messages
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Process error array and make messages more user-friendly
            const friendlyErrors = errorData.errors.map((err: string) => {
              if (err.includes("already registered")) {
                return "⚠️ This email address is already registered. Please try one of these options:";
              }
              if (err.includes("Invalid email")) {
                return "Please enter a valid email address.";
              }
              if (err.includes("Password")) {
                return err; // Password errors are usually clear
              }
              if (err.includes("required")) {
                return err; // Required field errors are usually clear
              }
              return err; // Default to original error
            });

            setErrors(friendlyErrors);
            setError("");
          } else if (errorData.message) {
            // Handle single error message
            let friendlyMessage = errorData.message;
            if (errorData.message.includes("already registered")) {
              friendlyMessage =
                "⚠️ This email address is already registered. Please try one of these options:";
            } else if (errorData.message.includes("Invalid email")) {
              friendlyMessage = "Please enter a valid email address.";
            } else if (errorData.message.includes("Validation failed")) {
              friendlyMessage = "Please check your information and try again.";
            }

            setError(friendlyMessage);
            setErrors([]);
          } else {
            setError("Something went wrong. Please try again.");
            setErrors([]);
          }
        } else {
          // No parsed data available, use raw response or generic error
          if (responseText.trim()) {
            // Check for common error patterns in raw text
            if (responseText.includes("already registered")) {
              setError(
                "⚠️ This email address is already registered. Please try one of these options:",
              );
            } else {
              setError(responseText);
            }
          } else {
            // Final fallback based on HTTP status
            if (response.status === 400) {
              setError("Please check your information and try again.");
            } else if (response.status === 409) {
              setError(
                "⚠️ This email address is already registered. Please try one of these options:",
              );
            } else {
              setError(
                `Server error: ${response.status} ${response.statusText}`,
              );
            }
          }
          setErrors([]);
        }
        return;
      }

      // Parse successful response
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("JSON parsing error for successful response:", jsonError);
        setError("Invalid response format from server. Please try again.");
        return;
      }

      console.log("Signup response:", data);

      if (data.success && data.user) {
        if (data.requiresVerification) {
          // Show verification message instead of redirecting
          console.log("Requiring email verification");
          setIsSignupComplete(true);
        } else {
          // User is verified (either already verified or email service failed)
          console.log("User verified, proceeding to dashboard");

          // Store authentication data if available
          if (data.token) {
            try {
              localStorage.setItem("authToken", data.token);
              localStorage.setItem("userData", JSON.stringify(data.user));
            } catch (storageError) {
              console.warn("LocalStorage error:", storageError);
              // Continue anyway - they can still access the dashboard
            }
          }

          // Navigate to sign in page
          try {
            navigate("/");
          } catch (navError) {
            console.error("Navigation error:", navError);
            setError("Signup successful! Please navigate to sign in page.");
          }
        }
      } else {
        console.error("Signup failed:", data);
        setError(data.message || "Signup failed");
        if ("errors" in data && data.errors) {
          setErrors(data.errors);
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
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
              to="/forgot-password"
              className="font-roboto-condensed text-xs font-normal text-black opacity-70 hover:opacity-100 transition-opacity"
            >
              Forgot Password
            </Link>
          </div>

          {/* Title */}
          <h1 className="font-roboto-condensed text-4xl lg:text-[40px] font-bold text-black mb-8">
            {isSignupComplete ? "Check Your Email" : "Create Account"}
          </h1>

          {/* Signup Complete Message */}
          {isSignupComplete ? (
            <div className="text-center space-y-6">
              <div className="text-blue-600 text-6xl mb-4">📧</div>
              <h2 className="font-roboto-condensed text-2xl font-bold text-black mb-4">
                Verification Email Sent!
              </h2>
              <p className="font-roboto-condensed text-lg text-black mb-6">
                We've sent a verification email to{" "}
                <strong>{formData.universityEmail}</strong>
              </p>
              <p className="font-roboto-condensed text-sm text-black opacity-70 mb-8">
                Please check your university email and click the verification
                link to complete your registration and retrieve your college
                data.
              </p>

              <div className="space-y-4">
                <div className="flex justify-center">
                  <Link to="/verify-email" className="relative group">
                    <svg
                      className="absolute inset-0 transform translate-x-3"
                      width="180"
                      height="61"
                      viewBox="0 0 180 61"
                      fill="none"
                    >
                      <g opacity="0.5" filter="url(#filter0_f_verify_btn)">
                        <path
                          d="M10 30.0735C10 18.9872 18.9872 10 30.0735 10H90H149.927C161.013 10 170 18.9872 170 30.0735C170 41.1598 161.013 50.1471 149.927 50.1471H30.0735C18.9872 50.1471 10 41.1598 10 30.0735Z"
                          fill="white"
                        />
                      </g>
                      <defs>
                        <filter
                          id="filter0_f_verify_btn"
                          x="0"
                          y="0"
                          width="180"
                          height="60.1471"
                          filterUnits="userSpaceOnUse"
                          colorInterpolationFilters="sRGB"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                          />
                          <feGaussianBlur
                            stdDeviation="5"
                            result="effect1_foregroundBlur_verify_btn"
                          />
                        </filter>
                      </defs>
                    </svg>

                    <span className="relative z-10 flex items-center justify-center w-48 h-10 font-roboto-condensed text-[15px] font-normal text-black opacity-80 group-hover:opacity-100 transition-opacity">
                      Go to Verification
                    </span>
                  </Link>
                </div>

                <p className="font-roboto-condensed text-xs text-black opacity-70">
                  Didn't receive the email? Check your spam folder or{" "}
                  <Link
                    to="/verify-email"
                    className="underline hover:opacity-100"
                  >
                    request a new one
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Error Messages */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-400 text-xl">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">
                        {error}
                      </p>
                      {/* Show helpful actions for duplicate email */}
                      {error.includes("already registered") && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-red-600 font-medium">
                            What you can do:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to="/"
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
                            >
                              🔑 Try logging in instead
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  universityEmail: "",
                                }));
                                setError("");
                              }}
                              className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors"
                            >
                              ✏️ Use a different email
                            </button>
                            <Link
                              to="/forgot-password"
                              className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full hover:bg-yellow-200 transition-colors"
                            >
                              🔒 Reset password
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {errors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-400 text-xl">❌</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm text-red-700">
                        <p className="font-medium mb-2">
                          Please fix the following issues:
                        </p>
                        <ul className="space-y-2">
                          {errors.map((err, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-red-400 mr-2">��</span>
                              <div className="flex-1">
                                <span>{err}</span>
                                {/* Show helpful actions for duplicate email in error list */}
                                {err.includes("already registered") && (
                                  <div className="mt-2 space-y-1">
                                    <p className="text-xs text-red-600 font-medium">
                                      What you can do:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      <Link
                                        to="/"
                                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
                                      >
                                        🔑 Login instead
                                      </Link>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFormData((prev) => ({
                                            ...prev,
                                            universityEmail: "",
                                          }));
                                          setErrors([]);
                                        }}
                                        className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors"
                                      >
                                        ✏️ Different email
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Name Field */}
              <div className="relative">
                <label className="block font-roboto-condensed text-xs font-normal text-black opacity-60 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <svg
                    className="absolute inset-0 w-full h-[49px]"
                    viewBox="0 0 373 49"
                    fill="none"
                  >
                    <path
                      d="M0 24.5C0 10.969 10.969 0 24.5 0H183.266H348.5C362.031 0 373 24.5C373 24.5C373 38.031 362.031 49 348.5 49H24.5C10.969 49 0 38.031 0 24.5Z"
                      fill="white"
                      opacity="0.5"
                    />
                  </svg>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    className="relative z-10 w-full h-[49px] px-6 bg-transparent border-none outline-none font-roboto-condensed text-sm text-black placeholder-black/60"
                    required
                  />
                </div>
              </div>

              {/* University Mail ID Field */}
              <div className="relative">
                <label className="block font-roboto-condensed text-xs font-normal text-black opacity-60 mb-2">
                  University Mail ID
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
                    value={formData.universityEmail}
                    onChange={(e) =>
                      handleInputChange("universityEmail", e.target.value)
                    }
                    className="relative z-10 w-full h-[49px] px-6 bg-transparent border-none outline-none font-roboto-condensed text-sm text-black placeholder-black/60"
                    required
                  />
                </div>

                {/* College Email Verification */}
                <CollegeEmailVerifier
                  email={formData.universityEmail}
                  onVerificationChange={handleCollegeVerification}
                  showVerifyButton={false}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className="block font-roboto-condensed text-xs font-normal text-black opacity-60 mb-2">
                  Password
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
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="relative z-10 w-full h-[49px] px-6 bg-transparent border-none outline-none font-roboto-condensed text-sm text-black placeholder-black/60"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <label className="block font-roboto-condensed text-xs font-normal text-black opacity-60 mb-2">
                  Confirm Password
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
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="relative z-10 w-full h-[49px] px-6 bg-transparent border-none outline-none font-roboto-condensed text-sm text-black placeholder-black/60"
                    required
                  />
                </div>
              </div>

              {/* Sign Up Button */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Button Background with Blur Effect */}
                  <svg
                    className="absolute inset-0 transform translate-x-3"
                    width="119"
                    height="61"
                    viewBox="0 0 119 61"
                    fill="none"
                  >
                    <g opacity="0.5" filter="url(#filter0_f_signup_btn)">
                      <path
                        d="M10 30.0735C10 18.9872 18.9872 10 30.0735 10H58.4855H88.6088C99.6951 10 108.682 18.9872 108.682 30.0735C108.682 41.1598 99.6951 50.1471 88.6088 50.1471H30.0735C18.9872 50.1471 10 41.1598 10 30.0735Z"
                        fill="white"
                      />
                    </g>
                    <defs>
                      <filter
                        id="filter0_f_signup_btn"
                        x="0"
                        y="0"
                        width="118.682"
                        height="60.1471"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="BackgroundImageFix"
                          result="shape"
                        />
                        <feGaussianBlur
                          stdDeviation="5"
                          result="effect1_foregroundBlur_signup_btn"
                        />
                      </filter>
                    </defs>
                  </svg>

                  {/* Button Text */}
                  <span className="relative z-10 flex items-center justify-center w-32 h-10 font-roboto-condensed text-[15px] font-normal text-black opacity-80 group-hover:opacity-100 transition-opacity">
                    {isLoading ? "Creating..." : "Sign Up"}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

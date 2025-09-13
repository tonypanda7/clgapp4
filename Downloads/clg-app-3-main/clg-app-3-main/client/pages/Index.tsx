import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginRequest, AuthResponse } from "@shared/api";

export default function Index() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Frontend validation
    if (!username?.trim()) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    if (!password?.trim()) {
      setError("Please enter your password");
      setIsLoading(false);
      return;
    }

    if (!username.includes('@')) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const loginData: LoginRequest = { username, password };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      // Handle error responses first
      if (!response.ok) {
        console.error("HTTP error:", response.status, response.statusText);

        // Handle errors based on status code
        if (response.status === 400) {
          setError("Please check your email and password and try again.");
        } else if (response.status === 401) {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else if (response.status === 404) {
          setError("Account not found. Please check your email or sign up for a new account.");
        } else {
          setError(`Login failed (${response.status}). Please try again.`);
        }
        return;
      }

      // Parse successful response
      let data: AuthResponse;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("JSON parsing error for successful response:", jsonError);
        setError("Invalid response format. Please try again.");
        return;
      }

      if (data.success && data.user && data.token) {
        // Store user data and token in localStorage
        try {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userData", JSON.stringify(data.user));
          console.log("Login successful:", data.user);
          navigate("/dashboard");
        } catch (storageError) {
          console.error("LocalStorage error:", storageError);
          setError("Unable to save login data. Please try again.");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/3e2ae61c8720c2d62b0cdc29498449d6d9387331?width=2880"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-white/10" />
      
      {/* Content Container */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/20 backdrop-blur-md rounded-[50px] p-16 border border-white/30">
          {/* Welcome Title */}
          <h1 className="font-roboto-condensed text-4xl lg:text-[40px] font-bold text-black mb-6 text-center">
            Welcome back !
          </h1>
          
          {/* Login Form Container */}
          <div className="space-y-6">
            {/* Login Subtitle */}
            <h2 className="font-roboto-condensed text-3xl lg:text-[30px] font-normal text-black">
              Login
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Username Field */}
              <div className="relative">
                <label className="block font-roboto-condensed text-xs font-normal text-black opacity-60 mb-2">
                  Username / Mail ID
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
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="relative z-10 w-full h-[49px] px-6 bg-transparent border-none outline-none font-roboto-condensed text-sm text-black placeholder-black/60"
                    placeholder=""
                  />
                </div>
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative z-10 w-full h-[49px] px-6 bg-transparent border-none outline-none font-roboto-condensed text-sm text-black placeholder-black/60"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Links Row */}
              <div className="flex justify-between items-center">
                <Link 
                  to="/signup" 
                  className="font-roboto-condensed text-xs font-normal text-black opacity-70 hover:opacity-100 transition-opacity"
                >
                  Sign Up
                </Link>
                <Link 
                  to="/forgot-password" 
                  className="font-roboto-condensed text-xs font-normal text-black opacity-70 hover:opacity-100 transition-opacity"
                >
                  Forgot Password
                </Link>
              </div>

              {/* Sign In Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Button Background with Blur Effect */}
                  <svg
                    className="absolute inset-0 transform translate-x-2"
                    width="128"
                    height="62"
                    viewBox="0 0 128 62"
                    fill="none"
                  >
                    <g opacity="0.5" filter="url(#filter0_f_signin_btn)">
                      <path
                        d="M10 31C10 19.402 19.402 10 31 10H63.0636H97C108.598 10 118 19.402 118 31C118 42.598 108.598 52 97 52H31C19.402 52 10 42.598 10 31Z"
                        fill="white"
                      />
                    </g>
                    <defs>
                      <filter id="filter0_f_signin_btn" x="0" y="0" width="128" height="62" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                        <feGaussianBlur stdDeviation="5" result="effect1_foregroundBlur_signin_btn"/>
                      </filter>
                    </defs>
                  </svg>

                  {/* Button Text */}
                  <span className="relative z-10 flex items-center justify-center w-32 h-10 font-roboto-condensed text-[15px] font-normal text-black opacity-80 group-hover:opacity-100 transition-opacity">
                    {isLoading ? "Signing In..." : "Sign In"}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* API Test Link */}
          <div className="mt-8 text-center">
            <Link
              to="/api-test"
              className="text-white/70 hover:text-white text-sm underline"
            >
              🔧 Test Backend APIs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

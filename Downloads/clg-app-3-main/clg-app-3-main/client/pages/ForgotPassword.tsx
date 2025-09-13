import { Link } from "react-router-dom";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/3e2ae61c8720c2d62b0cdc29498449d6d9387331?width=2880"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-white/90" />
      
      {/* Content Container */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-transparent text-center">
          <h1 className="font-roboto-condensed text-4xl lg:text-[40px] font-bold text-black mb-6">
            Forgot Password
          </h1>
          <p className="font-roboto-condensed text-lg text-black opacity-70 mb-8">
            This page is under construction. Please continue prompting to build out this functionality.
          </p>
          <Link 
            to="/"
            className="inline-block font-roboto-condensed text-sm font-normal text-black opacity-70 hover:opacity-100 transition-opacity underline"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

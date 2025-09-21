import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import VerifyEmail from "./pages/VerifyEmail";
import TestEmailVerification from "./pages/TestEmailVerification";
import SignupDebug from "./pages/SignupDebug";
import SimpleSignupTest from "./pages/SimpleSignupTest";
import RequestDebug from "./pages/RequestDebug";
import CollegeVerificationTest from "./pages/CollegeVerificationTest";
import AdminPanel from "./pages/AdminPanel";
import QuickClear from "./pages/QuickClear";
import SignupDebugger from "./pages/SignupDebugger";
import QuickFix from "./pages/QuickFix";
import ErrorMessageTest from "./pages/ErrorMessageTest";
import DuplicateEmailTest from "./pages/DuplicateEmailTest";
import LoginTest from "./pages/LoginTest";
import DuplicateEmailDemo from "./pages/DuplicateEmailDemo";
import ResponseErrorTest from "./pages/ResponseErrorTest";
import ForgotPassword from "./pages/ForgotPassword";
import ApiTest from "./pages/ApiTest";
import Demo from "./pages/Demo";
import DatabaseDebug from "./pages/DatabaseDebug";
import Fix401 from "./pages/Fix401";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/test-email" element={<TestEmailVerification />} />
          <Route path="/debug-signup" element={<SignupDebug />} />
          <Route path="/simple-test" element={<SimpleSignupTest />} />
          <Route path="/request-debug" element={<RequestDebug />} />
          <Route path="/college-test" element={<CollegeVerificationTest />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/clear-db" element={<QuickClear />} />
          <Route path="/signup-debug" element={<SignupDebugger />} />
          <Route path="/fix" element={<QuickFix />} />
          <Route path="/error-test" element={<ErrorMessageTest />} />
          <Route path="/duplicate-test" element={<DuplicateEmailTest />} />
          <Route path="/login-test" element={<LoginTest />} />
          <Route path="/duplicate-demo" element={<DuplicateEmailDemo />} />
          <Route path="/response-error-test" element={<ResponseErrorTest />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/db-debug" element={<DatabaseDebug />} />
          <Route path="/fix-401" element={<Fix401 />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

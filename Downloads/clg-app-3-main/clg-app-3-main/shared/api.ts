/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Authentication types
 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  universityEmail: string;
  password: string;
  confirmPassword: string;
}

export interface EmailVerificationRequest {
  universityEmail: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface CollegeDataResponse {
  success: boolean;
  message: string;
  collegeData?: {
    department: string;
    courses: string[];
    academicYear: string;
    semester: string;
    advisor?: string;
    gpa?: number;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    fullName: string;
    universityEmail: string;
    universityName?: string;
    program?: string;
    yearOfStudy?: string;
    isEmailVerified: boolean;
    collegeData?: {
      department: string;
      courses: string[];
      academicYear: string;
      semester: string;
      advisor?: string;
      gpa?: number;
    };
  };
  token?: string;
  requiresVerification?: boolean;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  emailSent?: boolean;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

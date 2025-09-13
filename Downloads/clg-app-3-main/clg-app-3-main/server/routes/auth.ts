import { RequestHandler } from "express";
import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  EmailVerificationRequest,
  VerifyEmailRequest,
  EmailVerificationResponse,
  CollegeDataResponse
} from "@shared/api";
import { getStorage, User } from "../storage";
import { getEmailService } from "../services/emailService";
import { getCollegeDataService } from "../services/collegeDataService";

// Helper function to generate simple user ID
const generateUserId = () => Math.random().toString(36).substr(2, 9);

// Helper function to generate simple JWT-like token
const generateToken = (userId: string) => `token_${userId}_${Date.now()}`;

// Helper function to generate verification token
const generateVerificationToken = () => Math.random().toString(36).substr(2, 32);

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { username, password }: LoginRequest = req.body;
    console.log('Login attempt:', { username, passwordLength: password?.length });

    // Validate input
    if (!username || !password) {
      console.log('Login failed: Missing username or password');
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      } satisfies AuthResponse);
    }

    const storage = getStorage();

    // Find user by username or email
    const user = await storage.findUser(username);
    console.log('User lookup result:', {
      username,
      userFound: !!user,
      userEmail: user?.universityEmail,
      passwordMatch: user ? user.password === password : false
    });

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({
        success: false,
        message: "Invalid credentials - User not found"
      } satisfies AuthResponse);
    }

    if (user.password !== password) {
      console.log('Login failed: Password mismatch');
      return res.status(401).json({
        success: false,
        message: "Invalid credentials - Password incorrect"
      } satisfies AuthResponse);
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        universityEmail: user.universityEmail,
        universityName: user.universityName,
        program: user.program,
        yearOfStudy: user.yearOfStudy
      },
      token
    } satisfies AuthResponse);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    } satisfies AuthResponse);
  }
};

export const handleSignup: RequestHandler = async (req, res) => {
  try {
    console.log("Signup request received:", {
      body: req.body,
      headers: req.headers['content-type'],
      bodyType: typeof req.body
    });

    // Validate request body exists
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: "Request body is required and must be JSON"
      });
    }

    const {
      fullName,
      universityEmail,
      password,
      confirmPassword
    }: SignupRequest = req.body;

    // Validate required fields
    const errors: string[] = [];

    if (!fullName) errors.push("Please enter your full name");
    if (!universityEmail) errors.push("Please enter your university email address");
    if (!password) errors.push("Please create a password");
    if (!confirmPassword) errors.push("Please confirm your password");

    if (password !== confirmPassword) {
      errors.push("The passwords you entered do not match");
    }

    if (password && password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    const storage = getStorage();

    // Check if email already exists
    if (await storage.emailExists(universityEmail)) {
      errors.push("This email address is already registered. Please use a different email or try logging in.");
    }

    if (errors.length > 0) {
      console.log("Signup validation failed:", errors);
      console.log("Request data received:", {
        fullName: fullName?.length,
        universityEmail
      });
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user (unverified)
    const newUser: User = {
      id: generateUserId(),
      fullName,
      universityEmail,
      password, // In production, hash this password
      phoneNumber: undefined,
      universityName: undefined,
      universityId: undefined,
      program: undefined,
      yearOfStudy: undefined,
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpiry,
      createdAt: new Date()
    };

    await storage.addUser(newUser);

    // Send verification email
    let emailSent = false;
    try {
      const emailService = getEmailService();
      emailSent = await emailService.sendVerificationEmail(universityEmail, verificationToken);
    } catch (emailError) {
      console.warn('Email service error, but user was created:', emailError);
      emailSent = false;
    }

    if (!emailSent) {
      console.warn('Failed to send verification email, marking user as verified to allow access');
      // Update user to be verified since email is not working
      await storage.updateUser(newUser.id, {
        isEmailVerified: true,
        verificationToken: undefined,
        verificationTokenExpiry: undefined
      });
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? "Account created successfully. Please check your email to verify your account."
        : "Account created successfully. Email verification is temporarily unavailable, but you can proceed to your dashboard.",
      requiresVerification: emailSent,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        universityEmail: newUser.universityEmail,
        universityName: newUser.universityName,
        program: newUser.program,
        yearOfStudy: newUser.yearOfStudy,
        isEmailVerified: !emailSent // If email can't be sent, mark as verified to allow access
      },
      token: !emailSent ? generateToken(newUser.id) : undefined // Provide token if email failed
    } satisfies AuthResponse);

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    } satisfies AuthResponse);
  }
};

export const handleGetProfile: RequestHandler = async (req, res) => {
  try {
    // In a real app, you'd verify the JWT token here
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const storage = getStorage();

    // Extract user ID from token (simplified)
    const userId = token.split('_')[1];
    const user = await storage.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Profile retrieved successfully",
      user: {
        id: user.id,
        fullName: user.fullName,
        universityEmail: user.universityEmail,
        universityName: user.universityName,
        program: user.program,
        yearOfStudy: user.yearOfStudy
      }
    } satisfies AuthResponse);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Email verification endpoint
export const handleVerifyEmail: RequestHandler = async (req, res) => {
  try {
    const { token }: VerifyEmailRequest = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required"
      } satisfies EmailVerificationResponse);
    }

    const storage = getStorage();
    const user = await storage.findUserByVerificationToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token"
      } satisfies EmailVerificationResponse);
    }

    // Check if token is expired
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Verification token has expired"
      } satisfies EmailVerificationResponse);
    }

    // Update user as verified
    await storage.updateUser(user.id, {
      isEmailVerified: true,
      verificationToken: undefined,
      verificationTokenExpiry: undefined
    });

    // Fetch college data after verification
    const collegeDataService = getCollegeDataService();
    const collegeData = await collegeDataService.fetchCollegeData({
      email: user.universityEmail,
      universityName: user.universityName,
      universityId: user.universityId,
      program: user.program,
      yearOfStudy: user.yearOfStudy
    });

    // Update user with college data
    if (collegeData) {
      await storage.updateUser(user.id, { collegeData });

      // Send notification email about college data
      const emailService = getEmailService();
      await emailService.sendCollegeDataNotification(user.universityEmail, user.fullName, collegeData);
    }

    // Generate login token
    const authToken = generateToken(user.id);

    res.json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user.id,
        fullName: user.fullName,
        universityEmail: user.universityEmail,
        universityName: user.universityName,
        program: user.program,
        yearOfStudy: user.yearOfStudy,
        isEmailVerified: true,
        collegeData
      },
      token: authToken
    } satisfies AuthResponse);

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    } satisfies EmailVerificationResponse);
  }
};

// Resend verification email endpoint
export const handleResendVerification: RequestHandler = async (req, res) => {
  try {
    const { universityEmail }: EmailVerificationRequest = req.body;

    if (!universityEmail) {
      return res.status(400).json({
        success: false,
        message: "University email is required"
      } satisfies EmailVerificationResponse);
    }

    const storage = getStorage();
    const user = await storage.findUser(universityEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      } satisfies EmailVerificationResponse);
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified"
      } satisfies EmailVerificationResponse);
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await storage.updateUser(user.id, {
      verificationToken,
      verificationTokenExpiry
    });

    // Send verification email
    const emailService = getEmailService();
    const emailSent = await emailService.sendVerificationEmail(universityEmail, verificationToken);

    res.json({
      success: true,
      message: "Verification email sent successfully",
      emailSent
    } satisfies EmailVerificationResponse);

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    } satisfies EmailVerificationResponse);
  }
};

// Get college data endpoint
export const handleGetCollegeData: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      } satisfies CollegeDataResponse);
    }

    const storage = getStorage();
    const userId = token.split('_')[1];
    const user = await storage.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      } satisfies CollegeDataResponse);
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email verification required"
      } satisfies CollegeDataResponse);
    }

    res.json({
      success: true,
      message: "College data retrieved successfully",
      collegeData: user.collegeData
    } satisfies CollegeDataResponse);

  } catch (error) {
    console.error('Get college data error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    } satisfies CollegeDataResponse);
  }
};

// Development helper to see all users
export const handleGetUsers: RequestHandler = async (req, res) => {
  try {
    const storage = getStorage();
    const users = await storage.getAllUsers();

    console.log('Current database users:');
    users.forEach(u => {
      console.log(`- ${u.universityEmail} (${u.fullName}) - verified: ${u.isEmailVerified}`);
    });

    res.json({
      users: users.map(u => ({
        id: u.id,
        fullName: u.fullName,
        universityEmail: u.universityEmail,
        universityName: u.universityName,
        program: u.program,
        yearOfStudy: u.yearOfStudy,
        isEmailVerified: u.isEmailVerified,
        collegeData: u.collegeData,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

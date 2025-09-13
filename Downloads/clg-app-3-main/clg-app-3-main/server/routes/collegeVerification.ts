import { RequestHandler } from "express";
import { getCollegeEmailVerifier } from "../services/collegeEmailVerifier";
import { getEmailService } from "../services/emailService";

interface VerifyCollegeEmailRequest {
  email: string;
}

interface VerifyCollegeEmailResponse {
  success: boolean;
  message: string;
  isCollegeEmail: boolean;
  collegeInfo?: {
    name: string;
    domain: string;
    country: string;
    type: string;
    verified: boolean;
  };
  suggestions?: string[];
  verificationEmailSent?: boolean;
}

interface SendVerificationEmailRequest {
  email: string;
  fullName?: string;
}

interface SendVerificationEmailResponse {
  success: boolean;
  message: string;
  emailSent: boolean;
  verificationToken?: string;
}

export const handleVerifyCollegeEmail: RequestHandler = async (req, res) => {
  try {
    const { email }: VerifyCollegeEmailRequest = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        isCollegeEmail: false
      } satisfies VerifyCollegeEmailResponse);
    }

    console.log("Verifying college email:", email);

    const verifier = getCollegeEmailVerifier();
    const result = await verifier.verifyCollegeEmail(email);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: result.error || "Invalid email format",
        isCollegeEmail: false
      } satisfies VerifyCollegeEmailResponse);
    }

    if (!result.isCollegeEmail) {
      return res.status(400).json({
        success: false,
        message: "Email domain is not recognized as a college or university",
        isCollegeEmail: false,
        suggestions: result.suggestions
      } satisfies VerifyCollegeEmailResponse);
    }

    console.log("College email verified:", result.collegeInfo?.name);

    res.json({
      success: true,
      message: `Verified as ${result.collegeInfo?.name} email`,
      isCollegeEmail: true,
      collegeInfo: result.collegeInfo
    } satisfies VerifyCollegeEmailResponse);

  } catch (error) {
    console.error('College email verification error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error during verification",
      isCollegeEmail: false
    } satisfies VerifyCollegeEmailResponse);
  }
};

export const handleSendVerificationEmail: RequestHandler = async (req, res) => {
  try {
    const { email, fullName }: SendVerificationEmailRequest = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        emailSent: false
      } satisfies SendVerificationEmailResponse);
    }

    console.log("Sending verification email to:", email);

    // First verify it's a college email
    const verifier = getCollegeEmailVerifier();
    const emailResult = await verifier.verifyCollegeEmail(email);

    if (!emailResult.isCollegeEmail) {
      return res.status(400).json({
        success: false,
        message: "Only college/university emails can receive verification",
        emailSent: false
      } satisfies SendVerificationEmailResponse);
    }

    // Generate verification token
    const verificationToken = verifier.generateVerificationToken();

    // Send verification email
    let emailSent = false;
    try {
      const emailService = getEmailService();
      emailSent = await emailService.sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.warn('Email service error:', emailError);
      emailSent = false;
    }

    if (emailSent) {
      res.json({
        success: true,
        message: `Verification email sent to ${email}`,
        emailSent: true,
        verificationToken // In production, don't return this
      } satisfies SendVerificationEmailResponse);
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send verification email",
        emailSent: false
      } satisfies SendVerificationEmailResponse);
    }

  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      emailSent: false
    } satisfies SendVerificationEmailResponse);
  }
};

// Check verification status
export const handleCheckVerificationStatus: RequestHandler = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Email parameter is required"
      });
    }

    // Here you would check your database for verification status
    // For now, we'll just verify the email format and college status
    const verifier = getCollegeEmailVerifier();
    const result = await verifier.verifyCollegeEmail(email);

    res.json({
      success: true,
      email,
      isCollegeEmail: result.isCollegeEmail,
      collegeInfo: result.collegeInfo,
      isVerified: false // Would come from database
    });

  } catch (error) {
    console.error('Check verification status error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // For development, use Gmail SMTP or a service like Ethereal
    // In production, use your preferred email service (SendGrid, Mailgun, etc.)
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
      }
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendVerificationEmail(to: string, verificationToken: string): Promise<boolean> {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'University Portal <noreply@university.edu>',
        to,
        subject: 'Verify Your University Email',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 University Portal</h1>
                <h2>Email Verification Required</h2>
              </div>
              <div class="content">
                <p>Hello!</p>
                <p>Thank you for registering with our University Portal. To complete your registration and access all features, please verify your university email address.</p>
                <p style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
                <p><strong>This verification link will expire in 24 hours.</strong></p>
                <p>If you didn't create an account with us, please ignore this email.</p>
                <p>Best regards,<br>University Portal Team</p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendCollegeDataNotification(to: string, fullName: string, collegeData: any): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'University Portal <noreply@university.edu>',
        to,
        subject: 'College Data Successfully Retrieved',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>College Data Retrieved</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .data-box { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #4CAF50; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 University Portal</h1>
                <h2>College Data Retrieved</h2>
              </div>
              <div class="content">
                <p>Hello ${fullName}!</p>
                <p>Great news! We've successfully retrieved your college information and updated your profile.</p>
                <div class="data-box">
                  <h3>Your College Information:</h3>
                  <p><strong>Department:</strong> ${collegeData.department}</p>
                  <p><strong>Academic Year:</strong> ${collegeData.academicYear}</p>
                  <p><strong>Semester:</strong> ${collegeData.semester}</p>
                  <p><strong>Courses:</strong> ${collegeData.courses?.join(', ') || 'N/A'}</p>
                  ${collegeData.advisor ? `<p><strong>Advisor:</strong> ${collegeData.advisor}</p>` : ''}
                  ${collegeData.gpa ? `<p><strong>GPA:</strong> ${collegeData.gpa}</p>` : ''}
                </div>
                <p>You can now access your personalized dashboard with all your academic information.</p>
                <p>Best regards,<br>University Portal Team</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('College data notification sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending college data notification:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

export { EmailService };

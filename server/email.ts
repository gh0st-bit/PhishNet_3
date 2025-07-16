import { MailService } from '@sendgrid/mail';
import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';
import nodemailer from 'nodemailer';

// Interface for email service
interface EmailService {
  send(message: any): Promise<boolean>;
}

// SendGrid email service implementation
class SendGridEmailService implements EmailService {
  private mailService: MailService;
  
  constructor(apiKey: string) {
    this.mailService = new MailService();
    this.mailService.setApiKey(apiKey);
  }
  
  async send(message: any): Promise<boolean> {
    try {
      await this.mailService.send(message);
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }
}

// Fallback email service that logs messages but doesn't send
class LoggingEmailService implements EmailService {
  async send(message: any): Promise<boolean> {
    console.log('🔔 MAIL SERVICE FALLBACK: Would send email with the following details:');
    console.log(`To: ${message.to}`);
    console.log(`From: ${message.from.email} (${message.from.name})`);
    console.log(`Subject: ${message.subject}`);
    console.log(`Text Content: ${message.text.substring(0, 100)}...`);
    console.log('Email not actually sent as SendGrid API key is not configured');
    return true;
  }
}

// Create appropriate email service based on environment
let emailService: EmailService;

if (process.env.SENDGRID_API_KEY) {
  console.log('Using SendGrid email service');
  emailService = new SendGridEmailService(process.env.SENDGRID_API_KEY);
} else {
  console.log('⚠️ SendGrid API key not found. Using logging email service (emails will not be sent)');
  emailService = new LoggingEmailService();
}

// Email configuration
const EMAIL_FROM = 'noreply@phishnet.io';
const EMAIL_NAME = 'PhishNet Security';

// JWT secret for password reset tokens
const JWT_SECRET = process.env.JWT_SECRET || 'phishnet-password-reset-secret';
// Token expiration time (1 hour)
const TOKEN_EXPIRY = '1h';

/**
 * Generates a JWT token for password reset
 */
export function generatePasswordResetToken(user: User) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      purpose: 'password-reset',
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Verifies the reset token
 */
export function verifyPasswordResetToken(token: string): { userId: number; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      purpose: string;
    };
    
    // Check if the token was generated for password reset
    if (decoded.purpose !== 'password-reset') {
      return null;
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Sends a password reset email
 */
export async function sendPasswordResetEmail(user: User, resetUrl: string) {
  try {
    const msg = {
      to: user.email,
      from: {
        email: EMAIL_FROM,
        name: EMAIL_NAME
      },
      subject: 'Reset Your PhishNet Password',
      text: `
        Hello ${user.firstName} ${user.lastName},
        
        You've requested to reset your password for your PhishNet account.
        
        Please click the link below to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour for security reasons.
        
        If you didn't request this password reset, please ignore this email or contact support if you have concerns.
        
        Thank you,
        PhishNet Security Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #FF8000;">PhishNet Password Reset</h2>
          </div>
          
          <p>Hello ${user.firstName} ${user.lastName},</p>
          
          <p>You've requested to reset your password for your PhishNet account.</p>
          
          <p>Please click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #FF8000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
          
          <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>Thank you,<br>PhishNet Security Team</p>
          </div>
        </div>
      `,
    };

    // Use our email service (which handles fallback if needed)
    const result = await emailService.send(msg);
    
    if (result) {
      console.log('Password reset email sent to:', user.email);
    } else {
      console.warn('Failed to send password reset email to:', user.email);
    }
    
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}
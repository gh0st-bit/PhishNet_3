/**
 * Validation schemas for MongoDB models
 */
import { z } from "zod";

// User validation schema
export const userValidationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  profilePicture: z.string().optional(),
  position: z.string().optional(),
  bio: z.string().optional(),
  isAdmin: z.boolean().optional().default(false),
  organizationName: z.string().optional()
});

// Password reset schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string(),
  token: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Group schema
export const insertGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional()
});

// Target schema
export const insertTargetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  position: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  additionalFields: z.record(z.string()).optional()
});

// SMTP Profile schema
export const insertSmtpProfileSchema = z.object({
  name: z.string().min(1, "Profile name is required"),
  host: z.string().min(1, "Host is required"),
  port: z.number().int().positive("Port must be a positive integer"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  fromName: z.string().min(1, "From name is required"),
  fromEmail: z.string().email("Please enter a valid email address")
});

// Email Template schema
export const insertEmailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  htmlContent: z.string().min(1, "HTML content is required"),
  textContent: z.string().optional(),
  senderName: z.string().min(1, "Sender name is required"),
  senderEmail: z.string().email("Invalid email format").min(1, "Sender email is required"),
  type: z.string().optional(),
  complexity: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  // For backward compatibility with PostgreSQL field names
  html_content: z.string().optional(),
  text_content: z.string().optional(),
  sender_name: z.string().optional(),
  sender_email: z.string().optional()
});

// Landing Page schema
export const insertLandingPageSchema = z.object({
  name: z.string().min(1, "Page name is required"),
  description: z.string().optional(),
  htmlContent: z.string().min(1, "HTML content is required"),
  redirectUrl: z.string().url("Please enter a valid URL").optional().nullable(),
  pageType: z.string().min(1, "Page type is required"),
  thumbnail: z.string().optional().nullable()
});

// Campaign schema
export const insertCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  targetGroupId: z.string().min(1, "Target group is required"),
  smtpProfileId: z.string().min(1, "SMTP profile is required"),
  emailTemplateId: z.string().min(1, "Email template is required"),
  landingPageId: z.string().min(1, "Landing page is required"),
  scheduledAt: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  trackingParameters: z.record(z.string()).optional()
});

// Campaign Result schema
export const insertCampaignResultSchema = z.object({
  campaignId: z.string().min(1, "Campaign ID is required"),
  targetId: z.string().min(1, "Target ID is required"),
  emailSent: z.boolean().default(false),
  emailSentAt: z.date().optional().nullable(),
  emailOpened: z.boolean().default(false),
  emailOpenedAt: z.date().optional().nullable(),
  linkClicked: z.boolean().default(false),
  linkClickedAt: z.date().optional().nullable(),
  formSubmitted: z.boolean().default(false),
  formSubmittedAt: z.date().optional().nullable(),
  formData: z.record(z.any()).optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  geolocation: z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional()
  }).optional()
});
import mongoose from 'mongoose';
import { connectToDatabase } from '../mongodb';

// Connect to MongoDB when importing this file
connectToDatabase();

// Organization Schema
const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profilePicture: { type: String },
  position: { type: String },
  bio: { type: String },
  failedLoginAttempts: { type: Number, default: 0 },
  lastFailedLogin: { type: Date },
  accountLocked: { type: Boolean, default: false },
  accountLockedUntil: { type: Date },
  isAdmin: { type: Boolean, default: false },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  organizationName: { type: String, default: 'None' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Password Reset Token Schema
const passwordResetTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Group Schema
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Target Schema
const targetSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  position: { type: String },
  department: { type: String },
  phone: { type: String },
  additionalFields: { type: Map, of: String }, // For flexible additional data
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// SMTP Profile Schema
const smtpProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  host: { type: String, required: true },
  port: { type: Number, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  fromName: { type: String, required: true },
  fromEmail: { type: String, required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Email Template Schema
const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  htmlContent: { type: String, required: true },
  textContent: { type: String },
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  type: { type: String },
  complexity: { type: String },
  description: { type: String },
  category: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Landing Page Schema
const landingPageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  htmlContent: { type: String, required: true },
  redirectUrl: { type: String },
  pageType: { type: String, required: true }, // login, form, educational
  thumbnail: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Campaign Schema
const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, required: true, enum: ['Draft', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'] },
  targetGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  smtpProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'SmtpProfile', required: true },
  emailTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate', required: true },
  landingPage: { type: mongoose.Schema.Types.ObjectId, ref: 'LandingPage', required: true },
  scheduledAt: { type: Date },
  sentAt: { type: Date },
  completedAt: { type: Date },
  endDate: { type: Date },
  trackingParameters: { type: Map, of: String }, // For UTM params, etc.
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Campaign Result Schema
const campaignResultSchema = new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  target: { type: mongoose.Schema.Types.ObjectId, ref: 'Target', required: true },
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date },
  emailOpened: { type: Boolean, default: false },
  emailOpenedAt: { type: Date },
  linkClicked: { type: Boolean, default: false },
  linkClickedAt: { type: Date },
  formSubmitted: { type: Boolean, default: false },
  formSubmittedAt: { type: Date },
  formData: { type: Object }, // Flexible form data storage
  userAgent: { type: String },
  ipAddress: { type: String },
  geolocation: { 
    country: { type: String },
    region: { type: String },
    city: { type: String }
  },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create models from schemas
export const Organization = mongoose.model('Organization', organizationSchema);
export const User = mongoose.model('User', userSchema);
export const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
export const Group = mongoose.model('Group', groupSchema);
export const Target = mongoose.model('Target', targetSchema);
export const SmtpProfile = mongoose.model('SmtpProfile', smtpProfileSchema);
export const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);
export const LandingPage = mongoose.model('LandingPage', landingPageSchema);
export const Campaign = mongoose.model('Campaign', campaignSchema);
export const CampaignResult = mongoose.model('CampaignResult', campaignResultSchema);

// Export default models object
export default {
  Organization,
  User,
  PasswordResetToken,
  Group,
  Target,
  SmtpProfile,
  EmailTemplate,
  LandingPage,
  Campaign,
  CampaignResult
};
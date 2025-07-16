import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Organizations table (for multi-tenancy)
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrganizationSchema = createInsertSchema(organizations).pick({
  name: true,
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profilePicture: text("profile_picture"),
  position: text("position"),
  bio: text("bio"),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lastFailedLogin: timestamp("last_failed_login"),
  accountLocked: boolean("account_locked").default(false).notNull(),
  accountLockedUntil: timestamp("account_locked_until"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  role: text("role").default("User").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  organizationName: text("organization_name").notNull().default("None"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  position: true,
  bio: true,
  profilePicture: true,
  isAdmin: true,
  role: true,
  organizationName: true,
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create a custom schema with strong password validation
export const userValidationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password cannot exceed 16 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  position: z.string().optional(),
  bio: z.string().optional(),
  profilePicture: z.string().optional(),
  isAdmin: z.boolean().optional(),
  role: z.string().optional(),
  organizationName: z.string().optional(),
});

// Groups table (for targets/recipients)
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
});

// Targets table (email recipients)
export const targets = pgTable("targets", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  position: text("position"),
  groupId: integer("group_id").references(() => groups.id, { onDelete: 'cascade' }).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTargetSchema = createInsertSchema(targets).pick({
  firstName: true,
  lastName: true,
  email: true,
  position: true,
});

// SMTP Profiles table
export const smtpProfiles = pgTable("smtp_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  host: text("host").notNull(),
  port: integer("port").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  fromName: text("from_name").notNull(),
  fromEmail: text("from_email").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSmtpProfileSchema = createInsertSchema(smtpProfiles).pick({
  name: true,
  host: true,
  port: true,
  username: true,
  password: true,
  fromName: true,
  fromEmail: true,
});

// Email Templates table
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  html_content: text("html_content").notNull(),
  text_content: text("text_content"),
  sender_name: text("sender_name").notNull(),
  sender_email: text("sender_email").notNull(),
  type: text("type"),
  complexity: text("complexity"),
  description: text("description"),
  category: text("category"),
  organization_id: integer("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by_id: integer("created_by_id").references(() => users.id),
});

// Schema for our application's internal model
export const insertEmailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  html_content: z.string().min(1, "HTML content is required"),
  text_content: z.string().optional(),
  sender_name: z.string().min(1, "Sender name is required"),
  sender_email: z.string().email("Invalid email format").min(1, "Sender email is required"),
  type: z.string().optional(),
  complexity: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
});

// Landing Pages table
export const landingPages = pgTable("landing_pages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  htmlContent: text("html_content").notNull(),
  cssContent: text("css_content"),
  jsContent: text("js_content"),
  redirectUrl: text("redirect_url"),
  pageType: text("page_type").notNull(), // login, form, educational, cloned
  thumbnail: text("thumbnail"),
  sourceUrl: text("source_url"), // Original URL if cloned
  isTemplate: boolean("is_template").default(false).notNull(),
  captureCredentials: boolean("capture_credentials").default(true).notNull(),
  captureSubmissions: boolean("capture_submissions").default(true).notNull(),
  trackClicks: boolean("track_clicks").default(true).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdById: integer("created_by_id").references(() => users.id),
});

export const insertLandingPageSchema = createInsertSchema(landingPages).pick({
  name: true,
  description: true,
  htmlContent: true,
  cssContent: true,
  jsContent: true,
  redirectUrl: true,
  pageType: true,
  thumbnail: true,
  sourceUrl: true,
  isTemplate: true,
  captureCredentials: true,
  captureSubmissions: true,
  trackClicks: true,
});

// Landing page validation with extended fields
export const landingPageValidationSchema = z.object({
  name: z.string().min(1, "Page name is required"),
  description: z.string().optional(),
  htmlContent: z.string().min(1, "HTML content is required"),
  cssContent: z.string().optional(),
  jsContent: z.string().optional(),
  redirectUrl: z.string().url("Invalid URL format").optional(),
  pageType: z.enum(["login", "form", "educational", "cloned"]),
  sourceUrl: z.string().url("Invalid URL format").optional(),
  isTemplate: z.boolean().optional(),
  captureCredentials: z.boolean().optional(),
  captureSubmissions: z.boolean().optional(),
  trackClicks: z.boolean().optional(),
});

// Clone webpage schema
export const cloneWebpageSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  name: z.string().min(1, "Page name is required"),
  description: z.string().optional(),
  captureCredentials: z.boolean().default(true),
  captureSubmissions: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("Draft"), // Draft, Scheduled, Active, Completed
  targetGroupId: integer("target_group_id").references(() => groups.id, { onDelete: 'restrict' }).notNull(),
  smtpProfileId: integer("smtp_profile_id").references(() => smtpProfiles.id, { onDelete: 'restrict' }).notNull(),
  emailTemplateId: integer("email_template_id").references(() => emailTemplates.id, { onDelete: 'restrict' }).notNull(),
  landingPageId: integer("landing_page_id").references(() => landingPages.id, { onDelete: 'restrict' }).notNull(),
  scheduledAt: timestamp("scheduled_at"),
  endDate: timestamp("end_date"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  name: true,
  targetGroupId: true,
  smtpProfileId: true,
  emailTemplateId: true,
  landingPageId: true,
  scheduledAt: true,
  endDate: true,
});

// Campaign Results table
export const campaignResults = pgTable("campaign_results", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  targetId: integer("target_id").references(() => targets.id, { onDelete: 'cascade' }).notNull(),
  sent: boolean("sent").default(false).notNull(),
  sentAt: timestamp("sent_at"),
  opened: boolean("opened").default(false).notNull(),
  openedAt: timestamp("opened_at"),
  clicked: boolean("clicked").default(false).notNull(),
  clickedAt: timestamp("clicked_at"),
  submitted: boolean("submitted").default(false).notNull(),
  submittedAt: timestamp("submitted_at"),
  submittedData: jsonb("submitted_data"),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCampaignResultSchema = createInsertSchema(campaignResults).pick({
  campaignId: true,
  targetId: true,
  sent: true,
  sentAt: true,
  opened: true,
  openedAt: true,
  clicked: true,
  clickedAt: true,
  submitted: true,
  submittedAt: true,
  submittedData: true,
});

// Export types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type Target = typeof targets.$inferSelect;
export type InsertTarget = z.infer<typeof insertTargetSchema>;

export type SmtpProfile = typeof smtpProfiles.$inferSelect;
export type InsertSmtpProfile = z.infer<typeof insertSmtpProfileSchema>;

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

export type LandingPage = typeof landingPages.$inferSelect;
export type InsertLandingPage = z.infer<typeof insertLandingPageSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type CampaignResult = typeof campaignResults.$inferSelect;
export type InsertCampaignResult = z.infer<typeof insertCampaignResultSchema>;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Password reset schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password cannot exceed 16 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  token: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Education System Tables
export const educationContent = pgTable("education_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  contentType: text("content_type").notNull(), // text, video, interactive, pdf
  content: text("content").notNull(), // HTML content or file path
  duration: integer("duration"), // in minutes
  difficulty: text("difficulty").notNull().default("beginner"), // beginner, intermediate, advanced
  tags: text("tags").array(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const educationModules = pgTable("education_modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  isRequired: boolean("is_required").default(false).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const educationModuleContent = pgTable("education_module_content", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => educationModules.id, { onDelete: 'cascade' }).notNull(),
  contentId: integer("content_id").references(() => educationContent.id, { onDelete: 'cascade' }).notNull(),
  orderIndex: integer("order_index").notNull(),
  isRequired: boolean("is_required").default(false).notNull(),
});

export const educationQuestions = pgTable("education_questions", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").references(() => educationContent.id, { onDelete: 'cascade' }),
  question: text("question").notNull(),
  questionType: text("question_type").notNull(), // multiple_choice, true_false, text
  options: jsonb("options"), // Array of options for MCQ
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  points: integer("points").default(1).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Training System Tables
export const trainingCourses = pgTable("training_courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  courseType: text("course_type").notNull(), // awareness, technical, compliance
  estimatedDuration: integer("estimated_duration"), // in hours
  passingScore: integer("passing_score").default(70).notNull(),
  certificateTemplate: text("certificate_template"),
  isActive: boolean("is_active").default(true).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const trainingExams = pgTable("training_exams", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => trainingCourses.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  timeLimit: integer("time_limit"), // in minutes
  passingScore: integer("passing_score").default(70).notNull(),
  randomizeQuestions: boolean("randomize_questions").default(true).notNull(),
  allowRetakes: boolean("allow_retakes").default(true).notNull(),
  maxAttempts: integer("max_attempts").default(3),
  isActive: boolean("is_active").default(true).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const trainingQuestions = pgTable("training_questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").references(() => trainingExams.id, { onDelete: 'cascade' }),
  courseId: integer("course_id").references(() => trainingCourses.id, { onDelete: 'cascade' }),
  question: text("question").notNull(),
  questionType: text("question_type").notNull(), // multiple_choice, true_false, text
  options: jsonb("options"), // Array of options for MCQ
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  points: integer("points").default(1).notNull(),
  difficulty: text("difficulty").notNull().default("medium"), // easy, medium, hard
  category: text("category"), // phishing, malware, social_engineering, etc.
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Progress and Certificates
export const userCourseProgress = pgTable("user_course_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer("course_id").references(() => trainingCourses.id, { onDelete: 'cascade' }).notNull(),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed, failed
  progress: integer("progress").default(0).notNull(), // percentage
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userExamAttempts = pgTable("user_exam_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  examId: integer("exam_id").references(() => trainingExams.id, { onDelete: 'cascade' }).notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  score: integer("score"), // percentage
  passed: boolean("passed").default(false).notNull(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent"), // in minutes
  answers: jsonb("answers"), // user's answers
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userCertificates = pgTable("user_certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer("course_id").references(() => trainingCourses.id, { onDelete: 'cascade' }).notNull(),
  certificateNumber: text("certificate_number").notNull().unique(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isValid: boolean("is_valid").default(true).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Compliance and Governance
export const complianceFrameworks = pgTable("compliance_frameworks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  version: text("version"),
  requirements: jsonb("requirements"), // Framework requirements
  isActive: boolean("is_active").default(true).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const complianceAssessments = pgTable("compliance_assessments", {
  id: serial("id").primaryKey(),
  frameworkId: integer("framework_id").references(() => complianceFrameworks.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("draft"), // draft, in_progress, completed
  score: integer("score"), // percentage
  assessmentData: jsonb("assessment_data"),
  assessedById: integer("assessed_by_id").references(() => users.id).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enhanced Reporting Tables
export const reportTemplates = pgTable("report_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  templateType: text("template_type").notNull(), // monthly, quarterly, annual, custom
  reportFormat: text("report_format").notNull(), // pdf, xlsx, html
  parameters: jsonb("parameters"), // Report configuration
  isActive: boolean("is_active").default(true).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reportSchedules = pgTable("report_schedules", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => reportTemplates.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  schedule: text("schedule").notNull(), // cron expression
  recipients: text("recipients").array(), // email addresses
  isActive: boolean("is_active").default(true).notNull(),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const generatedReports = pgTable("generated_reports", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => reportTemplates.id),
  scheduleId: integer("schedule_id").references(() => reportSchedules.id),
  name: text("name").notNull(),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  status: text("status").notNull().default("generating"), // generating, completed, failed
  parameters: jsonb("parameters"),
  generatedById: integer("generated_by_id").references(() => users.id),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notification System Enhancement
export const notificationTemplates = pgTable("notification_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  template: text("template").notNull(), // HTML template with placeholders
  triggerType: text("trigger_type").notNull(), // campaign_start, campaign_end, training_due, etc.
  isActive: boolean("is_active").default(true).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const alertRules = pgTable("alert_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  condition: jsonb("condition").notNull(), // Alert condition configuration
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  isActive: boolean("is_active").default(true).notNull(),
  recipients: text("recipients").array(), // email addresses
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for new tables
export const insertEducationContentSchema = createInsertSchema(educationContent).pick({
  title: true,
  description: true,
  contentType: true,
  content: true,
  duration: true,
  difficulty: true,
  tags: true,
});

export const insertEducationModuleSchema = createInsertSchema(educationModules).pick({
  name: true,
  description: true,
  orderIndex: true,
  isRequired: true,
});

export const insertTrainingCourseSchema = createInsertSchema(trainingCourses).pick({
  name: true,
  description: true,
  courseType: true,
  estimatedDuration: true,
  passingScore: true,
  certificateTemplate: true,
  isActive: true,
});

export const insertTrainingExamSchema = createInsertSchema(trainingExams).pick({
  courseId: true,
  name: true,
  description: true,
  timeLimit: true,
  passingScore: true,
  randomizeQuestions: true,
  allowRetakes: true,
  maxAttempts: true,
  isActive: true,
});

export const insertTrainingQuestionSchema = createInsertSchema(trainingQuestions).pick({
  examId: true,
  courseId: true,
  question: true,
  questionType: true,
  options: true,
  correctAnswer: true,
  explanation: true,
  points: true,
  difficulty: true,
  category: true,
});

export const insertComplianceFrameworkSchema = createInsertSchema(complianceFrameworks).pick({
  name: true,
  description: true,
  version: true,
  requirements: true,
  isActive: true,
});

export const insertReportTemplateSchema = createInsertSchema(reportTemplates).pick({
  name: true,
  description: true,
  templateType: true,
  reportFormat: true,
  parameters: true,
  isActive: true,
});

// Export additional types
export type EducationContent = typeof educationContent.$inferSelect;
export type InsertEducationContent = z.infer<typeof insertEducationContentSchema>;

export type EducationModule = typeof educationModules.$inferSelect;
export type InsertEducationModule = z.infer<typeof insertEducationModuleSchema>;

export type TrainingCourse = typeof trainingCourses.$inferSelect;
export type InsertTrainingCourse = z.infer<typeof insertTrainingCourseSchema>;

export type TrainingExam = typeof trainingExams.$inferSelect;
export type InsertTrainingExam = z.infer<typeof insertTrainingExamSchema>;

export type TrainingQuestion = typeof trainingQuestions.$inferSelect;
export type InsertTrainingQuestion = z.infer<typeof insertTrainingQuestionSchema>;

export type UserCourseProgress = typeof userCourseProgress.$inferSelect;
export type UserExamAttempt = typeof userExamAttempts.$inferSelect;
export type UserCertificate = typeof userCertificates.$inferSelect;

export type ComplianceFramework = typeof complianceFrameworks.$inferSelect;
export type InsertComplianceFramework = z.infer<typeof insertComplianceFrameworkSchema>;

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;

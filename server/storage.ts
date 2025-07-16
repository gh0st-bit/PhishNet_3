import { users, organizations, groups, targets, smtpProfiles, emailTemplates, landingPages, campaigns, campaignResults, passwordResetTokens } from "@shared/schema";
import { getDb, getPool, getDbConnection } from "./db";
import { eq, and, count } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";

import type { 
  User,
  InsertUser, 
  Organization, 
  InsertOrganization,
  Group,
  InsertGroup,
  Target,
  InsertTarget,
  SmtpProfile,
  InsertSmtpProfile,
  EmailTemplate,
  InsertEmailTemplate,
  LandingPage,
  InsertLandingPage,
  Campaign,
  InsertCampaign,
  CampaignResult,
  InsertCampaignResult,
  PasswordResetToken
} from "@shared/schema";

const PostgresSessionStore = connectPg(session);
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User methods
  getUser(id: string | number): Promise<any | undefined>;
  getUserByEmail(email: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  updateUser(id: string | number, data: any): Promise<any | undefined>;
  deleteUser(id: string | number): Promise<boolean>;
  listUsers(organizationId: string | number): Promise<any[]>;
  
  // Password reset methods
  createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(id: number): Promise<boolean>;
  
  // Organization methods
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationByName(name: string): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  
  // Group methods
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(organizationId: number, group: InsertGroup): Promise<Group>;
  updateGroup(id: number, data: Partial<Group>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  listGroups(organizationId: number): Promise<(Group & { targetCount: number })[]>;
  
  // Target methods
  getTarget(id: number): Promise<Target | undefined>;
  createTarget(organizationId: number, groupId: number, target: InsertTarget): Promise<Target>;
  updateTarget(id: number, data: Partial<Target>): Promise<Target | undefined>;
  deleteTarget(id: number): Promise<boolean>;
  listTargets(groupId: number): Promise<Target[]>;
  
  // SMTP Profile methods
  getSmtpProfile(id: number): Promise<SmtpProfile | undefined>;
  createSmtpProfile(organizationId: number, profile: InsertSmtpProfile): Promise<SmtpProfile>;
  updateSmtpProfile(id: number, data: Partial<SmtpProfile>): Promise<SmtpProfile | undefined>;
  deleteSmtpProfile(id: number): Promise<boolean>;
  listSmtpProfiles(organizationId: number): Promise<SmtpProfile[]>;
  
  // Email Template methods
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  createEmailTemplate(organizationId: number, userId: number, template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, data: Partial<EmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: number): Promise<boolean>;
  listEmailTemplates(organizationId: number): Promise<EmailTemplate[]>;
  
  // Landing Page methods
  getLandingPage(id: number): Promise<LandingPage | undefined>;
  createLandingPage(organizationId: number, userId: number, page: InsertLandingPage): Promise<LandingPage>;
  updateLandingPage(id: number, data: Partial<LandingPage>): Promise<LandingPage | undefined>;
  deleteLandingPage(id: number): Promise<boolean>;
  listLandingPages(organizationId: number): Promise<LandingPage[]>;
  
  // Campaign methods
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(organizationId: number, userId: number, campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  listCampaigns(organizationId: number): Promise<Campaign[]>;
  
  // Campaign Result methods
  getCampaignResult(id: number): Promise<CampaignResult | undefined>;
  createCampaignResult(organizationId: number, result: InsertCampaignResult): Promise<CampaignResult>;
  updateCampaignResult(id: number, data: Partial<CampaignResult>): Promise<CampaignResult | undefined>;
  listCampaignResults(campaignId: number): Promise<CampaignResult[]>;
  
  // Dashboard methods
  getDashboardStats(organizationId: number): Promise<any>;
  
  // Education methods
  listEducationContent(organizationId: number): Promise<any[]>;
  createEducationContent(organizationId: number, userId: number, content: any): Promise<any>;
  listEducationModules(organizationId: number): Promise<any[]>;
  createEducationModule(organizationId: number, module: any): Promise<any>;
  
  // Training methods
  listTrainingCourses(organizationId: number): Promise<any[]>;
  createTrainingCourse(organizationId: number, userId: number, course: any): Promise<any>;
  listTrainingExams(organizationId: number): Promise<any[]>;
  createTrainingExam(organizationId: number, exam: any): Promise<any>;
  getUserTrainingProgress(userId: number): Promise<any[]>;
  
  // Compliance methods
  listComplianceFrameworks(organizationId: number): Promise<any[]>;
  createComplianceFramework(organizationId: number, framework: any): Promise<any>;
  listComplianceAssessments(organizationId: number): Promise<any[]>;
  createComplianceAssessment(organizationId: number, userId: number, assessment: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  private db: any; // We'll initialize this in setup
  private pool: any;
  
  constructor() {
    // Use MemoryStore initially, we'll update it in setup if PostgreSQL is available
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize the db and pool asynchronously
    this.setup();
  }
  
  private async setup() {
    try {
      // Get database connection
      const connection = await getDbConnection();
      this.db = connection.db;
      this.pool = connection.pool;
      
      // Update session store if we have a database connection
      this.sessionStore = new PostgresSessionStore({ 
        pool: this.pool, 
        tableName: 'session',
        createTableIfMissing: true 
      });
      
      console.log('Database storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database storage:', error);
      // Keep using memory store if database setup fails
    }
  }
  
  // Helper method to ensure db is available
  private async getDb() {
    if (!this.db) {
      const connection = await getDbConnection();
      this.db = connection.db;
      this.pool = connection.pool;
    }
    return this.db;
  }
  
  // Helper method to ensure pool is available
  private async getPool() {
    if (!this.pool) {
      const connection = await getDbConnection();
      this.pool = connection.pool;
      this.db = connection.db;
    }
    return this.pool;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const db = await this.getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await this.getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(user: InsertUser & { organizationId: number }): Promise<User> {
    const db = await this.getDb();
    const [newUser] = await db.insert(users).values({
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      organizationId: user.organizationId,
      organizationName: user.organizationName,
    }).returning();
    return newUser;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const db = await this.getDb();
    const [updatedUser] = await db.update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }
  
  async listUsers(organizationId: number): Promise<User[]> {
    const db = await this.getDb();
    return await db.select().from(users).where(eq(users.organizationId, organizationId));
  }
  
  // Password reset methods
  async createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const db = await this.getDb();
    const [newToken] = await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt,
      used: false,
    }).returning();
    return newToken;
  }
  
  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const db = await this.getDb();
    const [resetToken] = await db.select().from(passwordResetTokens).where(
      and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false)
      )
    );
    return resetToken;
  }
  
  async markPasswordResetTokenUsed(id: number): Promise<boolean> {
    const db = await this.getDb();
    const [updated] = await db.update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, id))
      .returning();
    return !!updated;
  }
  
  // Organization methods
  async getOrganization(id: number): Promise<Organization | undefined> {
    const db = await this.getDb();
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
    return organization;
  }
  
  async getOrganizationByName(name: string): Promise<Organization | undefined> {
    const db = await this.getDb();
    const [organization] = await db.select().from(organizations).where(eq(organizations.name, name));
    return organization;
  }
  
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const db = await this.getDb();
    const [newOrganization] = await db.insert(organizations).values({
      name: organization.name,
    }).returning();
    return newOrganization;
  }
  
  // Group methods
  async getGroup(id: number): Promise<Group | undefined> {
    const db = await this.getDb();
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }
  
  async createGroup(organizationId: number, group: InsertGroup): Promise<Group> {
    const db = await this.getDb();
    const [newGroup] = await db.insert(groups).values({
      name: group.name,
      description: group.description,
      organizationId,
    }).returning();
    return newGroup;
  }
  
  async updateGroup(id: number, data: Partial<Group>): Promise<Group | undefined> {
    const db = await this.getDb();
    const [updatedGroup] = await db.update(groups)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(groups.id, id))
      .returning();
    return updatedGroup;
  }
  
  async deleteGroup(id: number): Promise<boolean> {
    const db = await this.getDb();
    await db.delete(groups).where(eq(groups.id, id));
    return true;
  }
  
  async listGroups(organizationId: number): Promise<(Group & { targetCount: number })[]> {
    const db = await this.getDb();
    // First get all groups
    const groupsList = await db.select().from(groups).where(eq(groups.organizationId, organizationId));
    
    // Then get target counts for each group
    const result = [];
    for (const group of groupsList) {
      const [countResult] = await db
        .select({ count: count() })
        .from(targets)
        .where(eq(targets.groupId, group.id));
      
      result.push({
        ...group,
        targetCount: Number(countResult.count) || 0
      });
    }
    
    return result;
  }
  
  // Target methods
  async getTarget(id: number): Promise<Target | undefined> {
    const db = await this.getDb();
    const [target] = await db.select().from(targets).where(eq(targets.id, id));
    return target;
  }
  
  async createTarget(organizationId: number, groupId: number, target: InsertTarget): Promise<Target> {
    const db = await this.getDb();
    const [newTarget] = await db.insert(targets).values({
      firstName: target.firstName,
      lastName: target.lastName,
      email: target.email,
      position: target.position,
      groupId,
      organizationId,
    }).returning();
    return newTarget;
  }
  
  async updateTarget(id: number, data: Partial<Target>): Promise<Target | undefined> {
    const db = await this.getDb();
    const [updatedTarget] = await db.update(targets)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(targets.id, id))
      .returning();
    return updatedTarget;
  }
  
  async deleteTarget(id: number): Promise<boolean> {
    const db = await this.getDb();
    await db.delete(targets).where(eq(targets.id, id));
    return true;
  }
  
  async listTargets(groupId: number): Promise<Target[]> {
    const db = await this.getDb();
    return await db.select().from(targets).where(eq(targets.groupId, groupId));
  }
  
  // SMTP Profile methods
  async getSmtpProfile(id: number): Promise<SmtpProfile | undefined> {
    const db = await this.getDb();
    const [profile] = await db.select().from(smtpProfiles).where(eq(smtpProfiles.id, id));
    return profile;
  }
  
  async createSmtpProfile(organizationId: number, profile: InsertSmtpProfile): Promise<SmtpProfile> {
    const db = await this.getDb();
    const [newProfile] = await db.insert(smtpProfiles).values({
      name: profile.name,
      host: profile.host,
      port: profile.port,
      username: profile.username,
      password: profile.password,
      fromName: profile.fromName,
      fromEmail: profile.fromEmail,
      organizationId,
    }).returning();
    return newProfile;
  }
  
  async updateSmtpProfile(id: number, data: Partial<SmtpProfile>): Promise<SmtpProfile | undefined> {
    const db = await this.getDb();
    const [updatedProfile] = await db.update(smtpProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(smtpProfiles.id, id))
      .returning();
    return updatedProfile;
  }
  
  async deleteSmtpProfile(id: number): Promise<boolean> {
    const db = await this.getDb();
    await db.delete(smtpProfiles).where(eq(smtpProfiles.id, id));
    return true;
  }
  
  async listSmtpProfiles(organizationId: number): Promise<SmtpProfile[]> {
    const db = await this.getDb();
    return await db.select().from(smtpProfiles).where(eq(smtpProfiles.organizationId, organizationId));
  }
  
  // Email Template methods
  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    try {
      const db = await this.getDb();
      const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
      return template;
    } catch (error) {
      console.error("Error getting template:", error);
      return undefined;
    }
  }
  
  async createEmailTemplate(organizationId: number, userId: number, template: InsertEmailTemplate): Promise<EmailTemplate> {
    try {
      console.log("Creating email template with HTML:", template.html_content?.substring(0, 50) + "...");
      
      const db = await this.getDb();
      const [newTemplate] = await db.insert(emailTemplates).values({
        name: template.name,
        subject: template.subject,
        html_content: template.html_content,
        text_content: template.text_content || null,
        sender_name: template.sender_name,
        sender_email: template.sender_email,
        type: template.type || null,
        complexity: template.complexity || null,
        description: template.description || null,
        category: template.category || null,
        organization_id: organizationId,
        created_by_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      }).returning();
      
      if (!newTemplate) {
        throw new Error("Failed to create template");
      }
      
      return newTemplate;
    } catch (error) {
      console.error("Error creating template:", error);
      throw error;
    }
  }
  
  async updateEmailTemplate(id: number, data: Partial<EmailTemplate>): Promise<EmailTemplate | undefined> {
    try {
      const db = await this.getDb();
      const [updatedTemplate] = await db.update(emailTemplates)
        .set({
          name: data.name,
          subject: data.subject,
          html_content: data.html_content,
          text_content: data.text_content,
          sender_name: data.sender_name,
          sender_email: data.sender_email,
          type: data.type || null,
          complexity: data.complexity || null,
          description: data.description || null,
          category: data.category || null,
          updated_at: new Date()
        })
        .where(eq(emailTemplates.id, id))
        .returning();
      
      return updatedTemplate;
    } catch (error) {
      console.error("Error updating template:", error);
      return undefined;
    }
  }
  
  async deleteEmailTemplate(id: number): Promise<boolean> {
    const db = await this.getDb();
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return true;
  }
  
  async listEmailTemplates(organizationId: number): Promise<EmailTemplate[]> {
    const db = await this.getDb();
    const templates = await db.select().from(emailTemplates).where(eq(emailTemplates.organization_id, organizationId));
    
    // Return the templates directly
    return templates;
  }
  
  // Landing Page methods
  async getLandingPage(id: number): Promise<LandingPage | undefined> {
    const db = await this.getDb();
    const [page] = await db.select().from(landingPages).where(eq(landingPages.id, id));
    return page;
  }
  
  async createLandingPage(organizationId: number, userId: number, page: InsertLandingPage): Promise<LandingPage> {
    const db = await this.getDb();
    const [newPage] = await db.insert(landingPages).values({
      name: page.name,
      description: page.description,
      htmlContent: page.htmlContent,
      redirectUrl: page.redirectUrl,
      pageType: page.pageType,
      thumbnail: page.thumbnail,
      organizationId,
      createdById: userId,
    }).returning();
    return newPage;
  }
  
  async updateLandingPage(id: number, data: Partial<LandingPage>): Promise<LandingPage | undefined> {
    const db = await this.getDb();
    const [updatedPage] = await db.update(landingPages)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(landingPages.id, id))
      .returning();
    return updatedPage;
  }
  
  async deleteLandingPage(id: number): Promise<boolean> {
    const db = await this.getDb();
    await db.delete(landingPages).where(eq(landingPages.id, id));
    return true;
  }
  
  async listLandingPages(organizationId: number): Promise<LandingPage[]> {
    const db = await this.getDb();
    return await db.select().from(landingPages).where(eq(landingPages.organizationId, organizationId));
  }
  
  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const db = await this.getDb();
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }
  
  async createCampaign(organizationId: number, userId: number, campaign: InsertCampaign): Promise<Campaign> {
    const db = await this.getDb();
    const [newCampaign] = await db.insert(campaigns).values({
      name: campaign.name,
      status: 'Draft',
      targetGroupId: campaign.targetGroupId,
      smtpProfileId: campaign.smtpProfileId,
      emailTemplateId: campaign.emailTemplateId,
      landingPageId: campaign.landingPageId,
      scheduledAt: campaign.scheduledAt,
      endDate: campaign.endDate,
      organizationId,
      createdById: userId,
    }).returning();
    return newCampaign;
  }
  
  async updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign | undefined> {
    const db = await this.getDb();
    const [updatedCampaign] = await db.update(campaigns)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();
    return updatedCampaign;
  }
  
  async deleteCampaign(id: number): Promise<boolean> {
    const db = await this.getDb();
    await db.delete(campaigns).where(eq(campaigns.id, id));
    return true;
  }
  
  async listCampaigns(organizationId: number): Promise<Campaign[]> {
    const db = await this.getDb();
    return await db.select().from(campaigns).where(eq(campaigns.organizationId, organizationId));
  }
  
  // Campaign Result methods
  async getCampaignResult(id: number): Promise<CampaignResult | undefined> {
    const db = await this.getDb();
    const [result] = await db.select().from(campaignResults).where(eq(campaignResults.id, id));
    return result;
  }
  
  async createCampaignResult(organizationId: number, result: InsertCampaignResult): Promise<CampaignResult> {
    const db = await this.getDb();
    const [newResult] = await db.insert(campaignResults).values({
      campaignId: result.campaignId,
      targetId: result.targetId,
      sent: result.sent,
      sentAt: result.sentAt,
      opened: result.opened,
      openedAt: result.openedAt,
      clicked: result.clicked,
      clickedAt: result.clickedAt,
      submitted: result.submitted,
      submittedAt: result.submittedAt,
      submittedData: result.submittedData,
      organizationId,
    }).returning();
    return newResult;
  }
  
  async updateCampaignResult(id: number, data: Partial<CampaignResult>): Promise<CampaignResult | undefined> {
    const db = await this.getDb();
    const [updatedResult] = await db.update(campaignResults)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(campaignResults.id, id))
      .returning();
    return updatedResult;
  }
  
  async listCampaignResults(campaignId: number): Promise<CampaignResult[]> {
    const db = await this.getDb();
    return await db.select().from(campaignResults).where(eq(campaignResults.campaignId, campaignId));
  }
  
  // Dashboard methods
  async getDashboardStats(organizationId: number): Promise<any> {
    const db = await this.getDb();
    
    // Get active campaigns count
    const activeCampaigns = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.organizationId, organizationId),
          eq(campaigns.status, 'Active')
        )
      );
    
    // Get user count
    const userCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.organizationId, organizationId));
    
    // In a real implementation, you would calculate more detailed metrics
    // For now, we'll return a simple mock data
    
    return {
      activeCampaigns: activeCampaigns.length,
      campaignChange: 12, // Mock data
      successRate: 32.8, // Mock data
      successRateChange: 5.2, // Mock data
      totalUsers: Number(userCount[0].count) || 0,
      newUsers: 3, // Mock data
      trainingCompletion: 78, // Mock data
      trainingCompletionChange: 8, // Mock data
    };
  }

  // Education methods
  async listEducationContent(organizationId: number): Promise<any[]> {
    const pool = await this.getPool();
    try {
      const result = await pool.query(
        'SELECT * FROM education_content WHERE organization_id = $1 ORDER BY created_at DESC',
        [organizationId]
      );
      return result.rows;
    } catch (error) {
      console.log('Education content table may not exist yet, returning empty array');
      return [];
    }
  }

  async createEducationContent(organizationId: number, userId: number, content: any): Promise<any> {
    const pool = await this.getPool();
    try {
      const result = await pool.query(
        `INSERT INTO education_content 
         (title, description, content_type, content, duration, difficulty, tags, organization_id, created_by_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [content.title, content.description, content.contentType, content.content, 
         content.duration, content.difficulty, JSON.stringify(content.tags || []), organizationId, userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating education content:', error);
      throw new Error('Education feature not yet available - tables need to be created');
    }
  }

  async listEducationModules(organizationId: number): Promise<any[]> {
    const pool = await this.getPool();
    try {
      const result = await pool.query(
        'SELECT * FROM education_modules WHERE organization_id = $1 ORDER BY order_index',
        [organizationId]
      );
      return result.rows;
    } catch (error) {
      console.log('Education modules table may not exist yet, returning empty array');
      return [];
    }
  }

  async createEducationModule(organizationId: number, module: any): Promise<any> {
    const pool = await this.getPool();
    try {
      const result = await pool.query(
        `INSERT INTO education_modules 
         (name, description, order_index, is_required, organization_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [module.name, module.description, module.orderIndex, module.isRequired, organizationId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating education module:', error);
      throw new Error('Education feature not yet available - tables need to be created');
    }
  }

  // Training methods
  async listTrainingCourses(organizationId: number): Promise<any[]> {
    const pool = await this.getPool();
    try {
      const result = await pool.query(
        'SELECT * FROM training_courses WHERE organization_id = $1 ORDER BY created_at DESC',
        [organizationId]
      );
      return result.rows;
    } catch (error) {
      console.log('Training courses table may not exist yet, returning empty array');
      return [];
    }
  }

  async createTrainingCourse(organizationId: number, userId: number, course: any): Promise<any> {
    const pool = await this.getPool();
    try {
      const result = await pool.query(
        `INSERT INTO training_courses 
         (name, description, course_type, estimated_duration, passing_score, certificate_template, is_active, organization_id, created_by_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [course.name, course.description, course.courseType, course.estimatedDuration, 
         course.passingScore, course.certificateTemplate, course.isActive !== false, organizationId, userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating training course:', error);
      throw new Error('Training feature not yet available - tables need to be created');
    }
  }

  async listTrainingExams(organizationId: number): Promise<any[]> {
    const pool = await this.getPool();
    const result = await pool.query(
      'SELECT * FROM training_exams WHERE organization_id = $1 ORDER BY created_at DESC',
      [organizationId]
    );
    return result.rows;
  }

  async createTrainingExam(organizationId: number, exam: any): Promise<any> {
    const pool = await this.getPool();
    const result = await pool.query(
      `INSERT INTO training_exams 
       (course_id, name, description, time_limit, passing_score, randomize_questions, allow_retakes, max_attempts, is_active, organization_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [exam.courseId, exam.name, exam.description, exam.timeLimit, exam.passingScore, 
       exam.randomizeQuestions, exam.allowRetakes, exam.maxAttempts, exam.isActive, organizationId]
    );
    return result.rows[0];
  }

  async getUserTrainingProgress(userId: number): Promise<any[]> {
    const pool = await this.getPool();
    const result = await pool.query(
      `SELECT ucp.*, tc.name as course_name 
       FROM user_course_progress ucp
       JOIN training_courses tc ON ucp.course_id = tc.id
       WHERE ucp.user_id = $1 ORDER BY ucp.last_accessed_at DESC`,
      [userId]
    );
    return result.rows.map(row => ({
      id: row.id,
      courseId: row.course_id,
      courseName: row.course_name,
      status: row.status,
      progress: row.progress,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      lastAccessedAt: row.last_accessed_at
    }));
  }

  // Compliance methods
  async listComplianceFrameworks(organizationId: number): Promise<any[]> {
    const pool = await this.getPool();
    try {
      const result = await pool.query(
        'SELECT * FROM compliance_frameworks WHERE organization_id = $1 ORDER BY created_at DESC',
        [organizationId]
      );
      return result.rows;
    } catch (error) {
      console.log('Compliance frameworks table may not exist yet, returning empty array');
      return [];
    }
  }

  async createComplianceFramework(organizationId: number, framework: any): Promise<any> {
    const pool = await this.getPool();
    try {
      const result = await pool.query(
        `INSERT INTO compliance_frameworks 
         (name, description, version, requirements, is_active, organization_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [framework.name, framework.description, framework.version, 
         JSON.stringify(framework.requirements || {}), framework.isActive !== false, organizationId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating compliance framework:', error);
      throw new Error('Compliance feature not yet available - tables need to be created');
    }
  }

  async listComplianceAssessments(organizationId: number): Promise<any[]> {
    const pool = await this.getPool();
    const result = await pool.query(
      `SELECT ca.*, cf.name as framework_name 
       FROM compliance_assessments ca
       JOIN compliance_frameworks cf ON ca.framework_id = cf.id
       WHERE ca.organization_id = $1 ORDER BY ca.created_at DESC`,
      [organizationId]
    );
    return result.rows.map(row => ({
      id: row.id,
      frameworkId: row.framework_id,
      frameworkName: row.framework_name,
      name: row.name,
      status: row.status,
      score: row.score,
      assessmentData: row.assessment_data,
      assessedById: row.assessed_by_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async createComplianceAssessment(organizationId: number, userId: number, assessment: any): Promise<any> {
    const pool = await this.getPool();
    const result = await pool.query(
      `INSERT INTO compliance_assessments 
       (framework_id, name, status, assessment_data, assessed_by_id, organization_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [assessment.frameworkId, assessment.name, 'draft', 
       JSON.stringify(assessment.assessmentData || {}), userId, organizationId]
    );
    return result.rows[0];
  }
}

// Create appropriate storage based on environment
// Always create DatabaseStorage since we now handle both cloud and local PostgreSQL
export const storage = new DatabaseStorage();
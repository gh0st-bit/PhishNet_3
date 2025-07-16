import session from 'express-session';
import mongoose from 'mongoose';
import { connectToDatabase, mongoUri, getConnectionStatus } from './mongodb';
import models from './models';
import { IStorage } from './storage';

// MongoStore for session storage
import MongoStore from 'connect-mongo';

/**
 * MongoDB implementation of the storage interface
 */
export class MongoStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Initialize an empty session store - will be set up properly in setup()
    this.sessionStore = null as unknown as session.Store;
    
    // Run setup asynchronously - don't block constructor
    this.setup().catch(err => console.error('Failed to initialize MongoDB storage:', err));
  }

  private async setup() {
    try {
      // Connect to MongoDB in-memory server first
      const mongoose = await connectToDatabase();
      
      // Initialize the session store using client option to reuse existing connection
      this.sessionStore = MongoStore.create({
        client: mongoose.connection.getClient(),
        collectionName: 'sessions',
        ttl: 24 * 60 * 60, // 1 day
        autoRemove: 'native'
      });
      
      console.log('MongoDB storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MongoDB storage:', error);
      throw error;
    }
  }

  // User methods
  async getUser(id: string | number): Promise<any | undefined> {
    try {
      const user = await models.User.findById(id);
      return user ? user.toObject() : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<any | undefined> {
    try {
      const user = await models.User.findOne({ email });
      return user ? user.toObject() : undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(user: any): Promise<any> {
    try {
      // First check if organization exists
      let organization;
      if (user.organizationId) {
        organization = await models.Organization.findById(user.organizationId);
      }
      
      // Create a new organization if needed or not found
      if (!organization) {
        organization = await models.Organization.create({
          name: user.organizationName || 'Default Organization',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Create the user with organization reference
      const newUser = await models.User.create({
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        position: user.position,
        bio: user.bio,
        profilePicture: user.profilePicture,
        isAdmin: user.isAdmin,
        organization: organization._id,
        organizationName: organization.name,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return newUser.toObject();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string | number, data: any): Promise<any | undefined> {
    try {
      // Update user fields
      const updatedUser = await models.User.findByIdAndUpdate(
        id,
        {
          ...data,
          updatedAt: new Date()
        },
        { new: true } // Return the updated document
      );

      return updatedUser ? updatedUser.toObject() : undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await models.User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async listUsers(organizationId: number): Promise<any[]> {
    try {
      const users = await models.User.find({ organization: organizationId });
      return users.map(user => user.toObject());
    } catch (error) {
      console.error('Error listing users:', error);
      return [];
    }
  }

  // Password reset methods
  async createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<any> {
    try {
      const resetToken = await models.PasswordResetToken.create({
        userId,
        token,
        expiresAt,
        used: false,
        createdAt: new Date()
      });

      return resetToken.toObject();
    } catch (error) {
      console.error('Error creating password reset token:', error);
      throw error;
    }
  }

  async getPasswordResetToken(token: string): Promise<any | undefined> {
    try {
      const resetToken = await models.PasswordResetToken.findOne({ token });
      return resetToken ? resetToken.toObject() : undefined;
    } catch (error) {
      console.error('Error getting password reset token:', error);
      return undefined;
    }
  }

  async markPasswordResetTokenUsed(id: number): Promise<boolean> {
    try {
      const result = await models.PasswordResetToken.findByIdAndUpdate(
        id,
        { used: true }
      );
      return !!result;
    } catch (error) {
      console.error('Error marking password reset token as used:', error);
      return false;
    }
  }

  // Organization methods
  async getOrganization(id: string | number): Promise<any | undefined> {
    try {
      const organization = await models.Organization.findById(id);
      return organization ? organization.toObject() : undefined;
    } catch (error) {
      console.error('Error getting organization:', error);
      return undefined;
    }
  }

  async getOrganizationByName(name: string): Promise<any | undefined> {
    try {
      const organization = await models.Organization.findOne({ name });
      return organization ? organization.toObject() : undefined;
    } catch (error) {
      console.error('Error getting organization by name:', error);
      return undefined;
    }
  }

  async createOrganization(organization: any): Promise<any> {
    try {
      const newOrganization = await models.Organization.create({
        name: organization.name,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return newOrganization.toObject();
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }

  // Group methods
  async getGroup(id: number): Promise<any | undefined> {
    try {
      const group = await models.Group.findById(id);
      return group ? group.toObject() : undefined;
    } catch (error) {
      console.error('Error getting group:', error);
      return undefined;
    }
  }

  async createGroup(organizationId: number, group: any): Promise<any> {
    try {
      const newGroup = await models.Group.create({
        name: group.name,
        description: group.description,
        organization: organizationId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return newGroup.toObject();
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async updateGroup(id: number, data: any): Promise<any | undefined> {
    try {
      const updatedGroup = await models.Group.findByIdAndUpdate(
        id,
        {
          ...data,
          updatedAt: new Date()
        },
        { new: true }
      );

      return updatedGroup ? updatedGroup.toObject() : undefined;
    } catch (error) {
      console.error('Error updating group:', error);
      return undefined;
    }
  }

  async deleteGroup(id: number): Promise<boolean> {
    try {
      const result = await models.Group.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting group:', error);
      return false;
    }
  }

  async listGroups(organizationId: number): Promise<any[]> {
    try {
      // Get all groups for the organization
      const groups = await models.Group.find({ organization: organizationId });
      
      // Get target counts for each group
      const groupData = await Promise.all(
        groups.map(async (group) => {
          const targetCount = await models.Target.countDocuments({ group: group._id });
          return {
            ...group.toObject(),
            targetCount
          };
        })
      );
      
      return groupData;
    } catch (error) {
      console.error('Error listing groups:', error);
      return [];
    }
  }

  // Target methods
  async getTarget(id: number): Promise<any | undefined> {
    try {
      const target = await models.Target.findById(id);
      return target ? target.toObject() : undefined;
    } catch (error) {
      console.error('Error getting target:', error);
      return undefined;
    }
  }

  async createTarget(organizationId: number, groupId: number, target: any): Promise<any> {
    try {
      const newTarget = await models.Target.create({
        email: target.email,
        firstName: target.firstName,
        lastName: target.lastName,
        position: target.position,
        department: target.department,
        phone: target.phone,
        additionalFields: target.additionalFields,
        group: groupId,
        organization: organizationId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return newTarget.toObject();
    } catch (error) {
      console.error('Error creating target:', error);
      throw error;
    }
  }

  async updateTarget(id: number, data: any): Promise<any | undefined> {
    try {
      const updatedTarget = await models.Target.findByIdAndUpdate(
        id,
        {
          ...data,
          updatedAt: new Date()
        },
        { new: true }
      );

      return updatedTarget ? updatedTarget.toObject() : undefined;
    } catch (error) {
      console.error('Error updating target:', error);
      return undefined;
    }
  }

  async deleteTarget(id: number): Promise<boolean> {
    try {
      const result = await models.Target.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting target:', error);
      return false;
    }
  }

  async listTargets(groupId: number): Promise<any[]> {
    try {
      const targets = await models.Target.find({ group: groupId });
      return targets.map(target => target.toObject());
    } catch (error) {
      console.error('Error listing targets:', error);
      return [];
    }
  }

  // SMTP Profile methods
  async getSmtpProfile(id: number): Promise<any | undefined> {
    try {
      const profile = await models.SmtpProfile.findById(id);
      return profile ? profile.toObject() : undefined;
    } catch (error) {
      console.error('Error getting SMTP profile:', error);
      return undefined;
    }
  }

  async createSmtpProfile(organizationId: number, profile: any): Promise<any> {
    try {
      const newProfile = await models.SmtpProfile.create({
        name: profile.name,
        host: profile.host,
        port: profile.port,
        username: profile.username,
        password: profile.password,
        fromName: profile.fromName,
        fromEmail: profile.fromEmail,
        organization: organizationId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return newProfile.toObject();
    } catch (error) {
      console.error('Error creating SMTP profile:', error);
      throw error;
    }
  }

  async updateSmtpProfile(id: number, data: any): Promise<any | undefined> {
    try {
      const updatedProfile = await models.SmtpProfile.findByIdAndUpdate(
        id,
        {
          ...data,
          updatedAt: new Date()
        },
        { new: true }
      );

      return updatedProfile ? updatedProfile.toObject() : undefined;
    } catch (error) {
      console.error('Error updating SMTP profile:', error);
      return undefined;
    }
  }

  async deleteSmtpProfile(id: number): Promise<boolean> {
    try {
      const result = await models.SmtpProfile.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting SMTP profile:', error);
      return false;
    }
  }

  async listSmtpProfiles(organizationId: number): Promise<any[]> {
    try {
      const profiles = await models.SmtpProfile.find({ organization: organizationId });
      return profiles.map(profile => profile.toObject());
    } catch (error) {
      console.error('Error listing SMTP profiles:', error);
      return [];
    }
  }

  // Email Template methods
  async getEmailTemplate(id: number): Promise<any | undefined> {
    try {
      const template = await models.EmailTemplate.findById(id);
      return template ? template.toObject() : undefined;
    } catch (error) {
      console.error('Error getting email template:', error);
      return undefined;
    }
  }

  async createEmailTemplate(organizationId: number, userId: number, template: any): Promise<any> {
    try {
      const newTemplate = await models.EmailTemplate.create({
        name: template.name,
        subject: template.subject,
        htmlContent: template.html_content || template.htmlContent,
        textContent: template.text_content || template.textContent,
        senderName: template.sender_name || template.senderName,
        senderEmail: template.sender_email || template.senderEmail,
        type: template.type,
        complexity: template.complexity,
        description: template.description,
        category: template.category,
        organization: organizationId,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return newTemplate.toObject();
    } catch (error) {
      console.error('Error creating email template:', error);
      throw error;
    }
  }

  async updateEmailTemplate(id: number, data: any): Promise<any | undefined> {
    try {
      // Convert snake_case to camelCase if needed
      const templateData = {
        ...(data.name && { name: data.name }),
        ...(data.subject && { subject: data.subject }),
        ...(data.htmlContent || data.html_content) && { 
          htmlContent: data.htmlContent || data.html_content 
        },
        ...(data.textContent || data.text_content) && { 
          textContent: data.textContent || data.text_content 
        },
        ...(data.senderName || data.sender_name) && { 
          senderName: data.senderName || data.sender_name 
        },
        ...(data.senderEmail || data.sender_email) && { 
          senderEmail: data.senderEmail || data.sender_email 
        },
        ...(data.type && { type: data.type }),
        ...(data.complexity && { complexity: data.complexity }),
        ...(data.description && { description: data.description }),
        ...(data.category && { category: data.category }),
        updatedAt: new Date()
      };

      const updatedTemplate = await models.EmailTemplate.findByIdAndUpdate(
        id,
        templateData,
        { new: true }
      );

      return updatedTemplate ? updatedTemplate.toObject() : undefined;
    } catch (error) {
      console.error('Error updating email template:', error);
      return undefined;
    }
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    try {
      const result = await models.EmailTemplate.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting email template:', error);
      return false;
    }
  }

  async listEmailTemplates(organizationId: number): Promise<any[]> {
    try {
      const templates = await models.EmailTemplate.find({ organization: organizationId });
      return templates.map(template => {
        const templateObj = template.toObject();
        
        // Convert from MongoDB schema names to the names expected by the API
        return {
          id: templateObj._id,
          name: templateObj.name,
          subject: templateObj.subject,
          html_content: templateObj.htmlContent,
          text_content: templateObj.textContent,
          sender_name: templateObj.senderName,
          sender_email: templateObj.senderEmail,
          type: templateObj.type,
          complexity: templateObj.complexity,
          description: templateObj.description,
          category: templateObj.category,
          organization_id: templateObj.organization,
          created_by_id: templateObj.createdBy,
          created_at: templateObj.createdAt,
          updated_at: templateObj.updatedAt
        };
      });
    } catch (error) {
      console.error('Error listing email templates:', error);
      return [];
    }
  }

  // Landing Page methods
  async getLandingPage(id: number): Promise<any | undefined> {
    try {
      const page = await models.LandingPage.findById(id);
      return page ? page.toObject() : undefined;
    } catch (error) {
      console.error('Error getting landing page:', error);
      return undefined;
    }
  }

  async createLandingPage(organizationId: number, userId: number, page: any): Promise<any> {
    try {
      const newPage = await models.LandingPage.create({
        name: page.name,
        description: page.description,
        htmlContent: page.htmlContent,
        redirectUrl: page.redirectUrl,
        pageType: page.pageType,
        thumbnail: page.thumbnail,
        organization: organizationId,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return newPage.toObject();
    } catch (error) {
      console.error('Error creating landing page:', error);
      throw error;
    }
  }

  async updateLandingPage(id: number, data: any): Promise<any | undefined> {
    try {
      const updatedPage = await models.LandingPage.findByIdAndUpdate(
        id,
        {
          ...data,
          updatedAt: new Date()
        },
        { new: true }
      );

      return updatedPage ? updatedPage.toObject() : undefined;
    } catch (error) {
      console.error('Error updating landing page:', error);
      return undefined;
    }
  }

  async deleteLandingPage(id: number): Promise<boolean> {
    try {
      const result = await models.LandingPage.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting landing page:', error);
      return false;
    }
  }

  async listLandingPages(organizationId: number): Promise<any[]> {
    try {
      const pages = await models.LandingPage.find({ organization: organizationId });
      return pages.map(page => {
        const pageObj = page.toObject();
        
        // Convert from MongoDB schema names to the names expected by the API
        return {
          id: pageObj._id,
          name: pageObj.name,
          description: pageObj.description,
          htmlContent: pageObj.htmlContent,
          redirectUrl: pageObj.redirectUrl,
          pageType: pageObj.pageType,
          thumbnail: pageObj.thumbnail,
          organizationId: pageObj.organization,
          createdById: pageObj.createdBy,
          createdAt: pageObj.createdAt,
          updatedAt: pageObj.updatedAt
        };
      });
    } catch (error) {
      console.error('Error listing landing pages:', error);
      return [];
    }
  }

  // Campaign methods
  async getCampaign(id: number): Promise<any | undefined> {
    try {
      const campaign = await models.Campaign.findById(id);
      return campaign ? campaign.toObject() : undefined;
    } catch (error) {
      console.error('Error getting campaign:', error);
      return undefined;
    }
  }

  async createCampaign(organizationId: number, userId: number, campaign: any): Promise<any> {
    try {
      const newCampaign = await models.Campaign.create({
        name: campaign.name,
        description: campaign.description,
        status: campaign.status || 'Draft',
        targetGroup: campaign.targetGroupId,
        smtpProfile: campaign.smtpProfileId,
        emailTemplate: campaign.emailTemplateId,
        landingPage: campaign.landingPageId,
        scheduledAt: campaign.scheduledAt,
        endDate: campaign.endDate,
        trackingParameters: campaign.trackingParameters,
        organization: organizationId,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return newCampaign.toObject();
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  async updateCampaign(id: number, data: any): Promise<any | undefined> {
    try {
      const updatedCampaign = await models.Campaign.findByIdAndUpdate(
        id,
        {
          ...data,
          updatedAt: new Date()
        },
        { new: true }
      );

      return updatedCampaign ? updatedCampaign.toObject() : undefined;
    } catch (error) {
      console.error('Error updating campaign:', error);
      return undefined;
    }
  }

  async deleteCampaign(id: number): Promise<boolean> {
    try {
      const result = await models.Campaign.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return false;
    }
  }

  async listCampaigns(organizationId: number): Promise<any[]> {
    try {
      const campaigns = await models.Campaign.find({ organization: organizationId });
      return campaigns.map(campaign => campaign.toObject());
    } catch (error) {
      console.error('Error listing campaigns:', error);
      return [];
    }
  }

  // Campaign Result methods
  async getCampaignResult(id: number): Promise<any | undefined> {
    try {
      const result = await models.CampaignResult.findById(id);
      return result ? result.toObject() : undefined;
    } catch (error) {
      console.error('Error getting campaign result:', error);
      return undefined;
    }
  }

  async createCampaignResult(organizationId: number, result: any): Promise<any> {
    try {
      const newResult = await models.CampaignResult.create({
        campaign: result.campaignId,
        target: result.targetId,
        emailSent: result.emailSent,
        emailSentAt: result.emailSentAt,
        emailOpened: result.emailOpened,
        emailOpenedAt: result.emailOpenedAt,
        linkClicked: result.linkClicked,
        linkClickedAt: result.linkClickedAt,
        formSubmitted: result.formSubmitted,
        formSubmittedAt: result.formSubmittedAt,
        formData: result.formData,
        userAgent: result.userAgent,
        ipAddress: result.ipAddress,
        geolocation: result.geolocation,
        organization: organizationId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return newResult.toObject();
    } catch (error) {
      console.error('Error creating campaign result:', error);
      throw error;
    }
  }

  async updateCampaignResult(id: number, data: any): Promise<any | undefined> {
    try {
      const updatedResult = await models.CampaignResult.findByIdAndUpdate(
        id,
        {
          ...data,
          updatedAt: new Date()
        },
        { new: true }
      );

      return updatedResult ? updatedResult.toObject() : undefined;
    } catch (error) {
      console.error('Error updating campaign result:', error);
      return undefined;
    }
  }

  async listCampaignResults(campaignId: number): Promise<any[]> {
    try {
      const results = await models.CampaignResult.find({ campaign: campaignId });
      return results.map(result => result.toObject());
    } catch (error) {
      console.error('Error listing campaign results:', error);
      return [];
    }
  }

  // Dashboard methods
  async getDashboardStats(organizationId: number): Promise<any> {
    try {
      // Total campaigns
      const campaignCount = await models.Campaign.countDocuments({ organization: organizationId });
      
      // Total targets
      const targets = await models.Target.find({ organization: organizationId });
      const targetCount = targets.length;
      
      // Campaigns by status
      const draftCampaigns = await models.Campaign.countDocuments({ 
        organization: organizationId,
        status: 'Draft'
      });
      
      const scheduledCampaigns = await models.Campaign.countDocuments({ 
        organization: organizationId,
        status: 'Scheduled'
      });
      
      const inProgressCampaigns = await models.Campaign.countDocuments({ 
        organization: organizationId,
        status: 'In Progress'
      });
      
      const completedCampaigns = await models.Campaign.countDocuments({ 
        organization: organizationId,
        status: 'Completed'
      });
      
      // Recent campaign activity
      const recentResults = await models.CampaignResult.find({ organization: organizationId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('campaign')
        .populate('target');
      
      // Success metrics
      const totalEmails = await models.CampaignResult.countDocuments({ 
        organization: organizationId,
        emailSent: true
      });
      
      const totalOpened = await models.CampaignResult.countDocuments({ 
        organization: organizationId,
        emailOpened: true
      });
      
      const totalClicked = await models.CampaignResult.countDocuments({ 
        organization: organizationId,
        linkClicked: true
      });
      
      const totalSubmitted = await models.CampaignResult.countDocuments({ 
        organization: organizationId,
        formSubmitted: true
      });
      
      return {
        campaignCount,
        targetCount,
        campaignsByStatus: {
          draft: draftCampaigns,
          scheduled: scheduledCampaigns,
          inProgress: inProgressCampaigns,
          completed: completedCampaigns
        },
        successMetrics: {
          totalEmails,
          totalOpened,
          totalClicked,
          totalSubmitted,
          openRate: totalEmails > 0 ? (totalOpened / totalEmails) * 100 : 0,
          clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
          submissionRate: totalClicked > 0 ? (totalSubmitted / totalClicked) * 100 : 0
        },
        recentActivity: recentResults.map(result => ({
          id: result._id,
          campaignName: result.campaign?.name || 'Unknown Campaign',
          targetName: `${result.target?.firstName || 'Unknown'} ${result.target?.lastName || 'Target'}`,
          action: result.formSubmitted ? 'Submitted Form' : 
                 result.linkClicked ? 'Clicked Link' :
                 result.emailOpened ? 'Opened Email' : 'Email Sent',
          timestamp: result.formSubmittedAt || result.linkClickedAt || result.emailOpenedAt || result.emailSentAt || result.createdAt
        }))
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        campaignCount: 0,
        targetCount: 0,
        campaignsByStatus: { draft: 0, scheduled: 0, inProgress: 0, completed: 0 },
        successMetrics: { totalEmails: 0, totalOpened: 0, totalClicked: 0, totalSubmitted: 0, openRate: 0, clickRate: 0, submissionRate: 0 },
        recentActivity: []
      };
    }
  }
}

// Create and export an instance of the MongoStorage
export const mongoStorage = new MongoStorage();
import type { Express } from "express";
import { createServer, type Server } from "http";
import { DatabaseStorage } from "./storage";

// Initialize storage
const storage = new DatabaseStorage();
import { setupAuth, isAuthenticated, isAdmin, hasOrganization, hashPassword, comparePasswords, refreshSession } from "./auth";
import multer from "multer";
import Papa from "papaparse";
// Import validation schemas from shared schema
import { 
  insertGroupSchema, 
  insertTargetSchema, 
  insertSmtpProfileSchema,
  insertEmailTemplateSchema,
  insertLandingPageSchema,
  landingPageValidationSchema,
  cloneWebpageSchema,
  insertCampaignSchema,
  insertCampaignResultSchema,
  insertEducationContentSchema,
  insertEducationModuleSchema,
  insertTrainingCourseSchema,
  insertTrainingExamSchema,
  insertComplianceFrameworkSchema
} from "@shared/schema";
import { z } from "zod";

// Set up file upload middleware
const upload = multer({ storage: multer.memoryStorage() });

// Import our simulation utilities
import { simulateCloudDatabaseFailure, restoreCloudDatabaseConnection } from './simulate-failure';

// Webpage cloning utility
async function cloneWebpage(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch webpage: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Basic parsing to extract CSS and JS (simplified version)
    const cssMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    const jsMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    
    const css = cssMatches.map(match => 
      match.replace(/<\/?style[^>]*>/gi, '')
    ).join('\n');
    
    const js = jsMatches.map(match => 
      match.replace(/<\/?script[^>]*>/gi, '')
    ).filter(script => !script.includes('src=')).join('\n');
    
    // Clean HTML by removing external scripts and styles to make it safe
    const cleanHtml = html
      .replace(/<script[^>]*src[^>]*><\/script>/gi, '')
      .replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    return {
      html: cleanHtml,
      css: css,
      js: js
    };
  } catch (error) {
    console.error('Error cloning webpage:', error);
    throw new Error(`Failed to clone webpage: ${error}`);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // API Health Check
  app.get("/api/status", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });
  
  // Testing routes for database fallback mechanism (admin only)
  app.post("/api/admin/simulate-database-failure", isAdmin, async (_req, res) => {
    try {
      const success = await simulateCloudDatabaseFailure();
      if (success) {
        res.json({ 
          status: "success", 
          message: "Cloud database failure simulated successfully. The application will switch to local database on next connection attempt."
        });
      } else {
        res.status(500).json({ 
          status: "error", 
          message: "Failed to simulate cloud database failure" 
        });
      }
    } catch (error) {
      res.status(500).json({ status: "error", message: String(error) });
    }
  });
  
  app.post("/api/admin/restore-database-connection", isAdmin, async (_req, res) => {
    try {
      const success = await restoreCloudDatabaseConnection();
      if (success) {
        res.json({ 
          status: "success", 
          message: "Cloud database connection restored successfully. The application will switch back to cloud database on next connection attempt."
        });
      } else {
        res.status(500).json({ 
          status: "error", 
          message: "Failed to restore cloud database connection" 
        });
      }
    } catch (error) {
      res.status(500).json({ status: "error", message: String(error) });
    }
  });
  
  // Database status endpoint
  app.get("/api/database/status", isAdmin, async (_req, res) => {
    try {
      // Re-import to get the latest connection information
      const { getDbConnection } = await import('./db');
      const connection = await getDbConnection();
      
      res.json({
        status: "ok",
        connectionType: connection.type,
        isCloud: connection.type === 'cloud',
        cloudDatabaseUrl: process.env.DATABASE_URL ? "configured" : "not configured",
        localDatabaseConfig: {
          host: process.env.PGHOST || "not configured",
          database: process.env.PGDATABASE || "not configured",
          user: process.env.PGUSER ? "configured" : "not configured",
          port: process.env.PGPORT || "not configured"
        }
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: String(error) });
    }
  });
  
  // Session ping endpoint for refreshing user sessions
  app.post("/api/session-ping", refreshSession, (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Dashboard Stats
  app.get("/api/dashboard/stats", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user.organizationId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  // Dashboard Metrics (Mock data for chart)
  app.get("/api/dashboard/metrics", isAuthenticated, (req, res) => {
    // Provide mock data for the phishing success rate chart
    const data = [
      { date: "Jan", rate: 42 },
      { date: "Feb", rate: 38 },
      { date: "Mar", rate: 45 },
      { date: "Apr", rate: 39 },
      { date: "May", rate: 33 },
      { date: "Jun", rate: 28 },
      { date: "Jul", rate: 32 },
    ];
    res.json(data);
  });

  // Dashboard Threat Data
  app.get("/api/dashboard/threats", isAuthenticated, (req, res) => {
    // Provide mock threat data
    const threats = [
      {
        id: 1,
        name: "Credential Phishing",
        description: "Recent campaigns target Microsoft 365 users with fake login pages.",
        level: "high"
      },
      {
        id: 2,
        name: "Invoice Fraud",
        description: "Finance departments targeted with fake invoice attachments containing malware.",
        level: "medium"
      },
      {
        id: 3,
        name: "CEO Fraud",
        description: "Impersonation attacks requesting urgent wire transfers or gift card purchases.",
        level: "medium"
      }
    ];
    res.json(threats);
  });

  // Dashboard Risk Users
  app.get("/api/dashboard/risk-users", isAuthenticated, (req, res) => {
    // Provide mock risk user data
    const users = [
      {
        id: 1,
        name: "Mike Miller",
        department: "Finance Department",
        riskLevel: "High Risk"
      },
      {
        id: 2,
        name: "Sarah Johnson",
        department: "Marketing Team",
        riskLevel: "Medium Risk"
      },
      {
        id: 3,
        name: "Tom Parker",
        department: "Executive Team",
        riskLevel: "Medium Risk"
      }
    ];
    res.json(users);
  });

  // Dashboard Training Data
  app.get("/api/dashboard/training", isAuthenticated, (req, res) => {
    // Provide mock training data
    const trainings = [
      {
        id: 1,
        name: "Phishing Awareness",
        progress: 65,
        icon: "shield"
      },
      {
        id: 2,
        name: "Password Security",
        progress: 82,
        icon: "lock"
      },
      {
        id: 3,
        name: "Mobile Device Security",
        progress: 43,
        icon: "smartphone"
      }
    ];
    res.json(trainings);
  });

  // Recent Campaigns
  app.get("/api/campaigns/recent", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const campaigns = await storage.listCampaigns(req.user.organizationId);
      // Sort by created date and take the most recent 5
      const recentCampaigns = campaigns
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          openRate: Math.floor(Math.random() * 100), // Mock data
          clickRate: Math.floor(Math.random() * 70), // Mock data
          createdAt: campaign.createdAt
        }));
      res.json(recentCampaigns);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent campaigns" });
    }
  });

  // Groups Endpoints
  app.get("/api/groups", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const groups = await storage.listGroups(req.user.organizationId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Error fetching groups" });
    }
  });

  app.post("/api/groups", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const validatedData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(req.user.organizationId, validatedData);
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating group" });
    }
  });

  app.put("/api/groups/:id", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // Ensure user has access to this group
      if (group.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertGroupSchema.parse(req.body);
      const updatedGroup = await storage.updateGroup(groupId, validatedData);
      res.json(updatedGroup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating group" });
    }
  });

  app.delete("/api/groups/:id", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // Ensure user has access to this group
      if (group.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteGroup(groupId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting group" });
    }
  });

  // Targets Endpoints
  app.get("/api/groups/:id/targets", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // Ensure user has access to this group
      if (group.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const targets = await storage.listTargets(groupId);
      res.json(targets);
    } catch (error) {
      res.status(500).json({ message: "Error fetching targets" });
    }
  });

  app.post("/api/groups/:id/targets", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // Ensure user has access to this group
      if (group.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertTargetSchema.parse(req.body);
      const target = await storage.createTarget(req.user.organizationId, groupId, validatedData);
      res.status(201).json(target);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating target" });
    }
  });

  app.post("/api/groups/:id/import", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // Ensure user has access to this group
      if (group.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const csvString = req.file.buffer.toString();
      const results = Papa.parse(csvString, { header: true, skipEmptyLines: true });
      
      if (results.errors.length > 0) {
        return res.status(400).json({ message: "CSV parsing error", errors: results.errors });
      }
      
      const importedTargets = [];
      const errors = [];
      
      for (const [index, row] of results.data.entries()) {
        try {
          // Normalize field names
          const normalizedRow: any = {};
          for (const [key, value] of Object.entries(row)) {
            const lowercaseKey = key.toLowerCase();
            if (lowercaseKey === 'firstname' || lowercaseKey === 'first_name') {
              normalizedRow.firstName = value;
            } else if (lowercaseKey === 'lastname' || lowercaseKey === 'last_name') {
              normalizedRow.lastName = value;
            } else if (lowercaseKey === 'email') {
              normalizedRow.email = value;
            } else if (lowercaseKey === 'position' || lowercaseKey === 'title') {
              normalizedRow.position = value;
            }
          }
          
          // Validate the data
          const validatedData = insertTargetSchema.parse(normalizedRow);
          
          // Create the target
          const target = await storage.createTarget(req.user.organizationId, groupId, validatedData);
          importedTargets.push(target);
        } catch (error) {
          errors.push({
            row: index + 2, // +2 to account for 0-based index and header row
            error: error instanceof z.ZodError ? error.errors : "Unknown error"
          });
        }
      }
      
      res.status(200).json({
        imported: importedTargets.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      res.status(500).json({ message: "Error importing targets" });
    }
  });

  // SMTP Profiles Endpoints
  app.get("/api/smtp-profiles", isAuthenticated, async (req, res) => {
    try {
      const profiles = await storage.listSmtpProfiles(req.user.organizationId);
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching SMTP profiles" });
    }
  });

  app.post("/api/smtp-profiles", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSmtpProfileSchema.parse(req.body);
      const profile = await storage.createSmtpProfile(req.user.organizationId, validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating SMTP profile" });
    }
  });

  // Email Templates Endpoints
  app.get("/api/email-templates", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      // Get templates directly from storage 
      const templates = await storage.listEmailTemplates(req.user.organizationId);
      
      // Return templates directly with snake_case field names as expected by frontend
      const mappedTemplates = templates.map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        html_content: template.html_content || "",
        text_content: template.text_content || null,
        sender_name: template.sender_name || "PhishNet Team",
        sender_email: template.sender_email || "phishing@example.com",
        type: template.type || "phishing-business",
        complexity: template.complexity || "medium",
        description: template.description || null,
        category: template.category || null,
        organization_id: template.organization_id,
        created_at: template.created_at,
        updated_at: template.updated_at,
        created_by_id: template.created_by_id
      }));
      
      res.json(mappedTemplates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Error fetching email templates" });
    }
  });

  app.post("/api/email-templates", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const validatedData = insertEmailTemplateSchema.parse(req.body);
      
      // Create a template using existing storage method
      const template = await storage.createEmailTemplate(
        req.user.organizationId, 
        req.user.id, 
        {
          name: validatedData.name,
          subject: validatedData.subject,
          html_content: validatedData.html_content,
          text_content: validatedData.text_content,
          sender_name: validatedData.sender_name,
          sender_email: validatedData.sender_email,
          type: validatedData.type,
          complexity: validatedData.complexity,
          description: validatedData.description,
          category: validatedData.category
        }
      );
      
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating email template" });
    }
  });

  app.put("/api/email-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getEmailTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      // Ensure user has access to this template
      if (template.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertEmailTemplateSchema.parse(req.body);
      const updatedTemplate = await storage.updateEmailTemplate(templateId, validatedData);
      res.json(updatedTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating email template" });
    }
  });
  
  app.delete("/api/email-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getEmailTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      // Ensure user has access to this template
      if (template.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const success = await storage.deleteEmailTemplate(templateId);
      if (success) {
        return res.status(200).json({ message: "Email template deleted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to delete email template" });
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Error deleting email template" });
    }
  });

  // Landing Pages Endpoints
  app.get("/api/landing-pages", isAuthenticated, async (req, res) => {
    try {
      console.log("Fetching landing pages for organization:", req.user!.organizationId);
      const pages = await storage.listLandingPages(req.user!.organizationId);
      console.log("Found landing pages:", pages.length);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching landing pages:", error);
      res.status(500).json({ message: "Error fetching landing pages", error: error.message });
    }
  });

  app.post("/api/landing-pages", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertLandingPageSchema.parse(req.body);
      const page = await storage.createLandingPage(req.user!.organizationId, req.user!.id, validatedData);
      res.status(201).json(page);
    } catch (error) {
      console.error("Error creating landing page:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating landing page" });
    }
  });

  app.get("/api/landing-pages/:id", isAuthenticated, async (req, res) => {
    try {
      const page = await storage.getLandingPage(Number(req.params.id));
      if (!page) {
        return res.status(404).json({ message: "Landing page not found" });
      }
      
      // Check user has access to this page
      if (page.organizationId !== req.user!.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(page);
    } catch (error) {
      res.status(500).json({ message: "Error fetching landing page" });
    }
  });

  app.put("/api/landing-pages/:id", isAuthenticated, async (req, res) => {
    try {
      const pageId = Number(req.params.id);
      const validatedData = insertLandingPageSchema.partial().parse(req.body);
      
      // Check if page exists and user has access
      const existingPage = await storage.getLandingPage(pageId);
      if (!existingPage) {
        return res.status(404).json({ message: "Landing page not found" });
      }
      
      if (existingPage.organizationId !== req.user!.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedPage = await storage.updateLandingPage(pageId, validatedData);
      res.json(updatedPage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating landing page" });
    }
  });

  app.delete("/api/landing-pages/:id", isAuthenticated, async (req, res) => {
    try {
      const pageId = Number(req.params.id);
      
      // Check if page exists and user has access
      const existingPage = await storage.getLandingPage(pageId);
      if (!existingPage) {
        return res.status(404).json({ message: "Landing page not found" });
      }
      
      if (existingPage.organizationId !== req.user!.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteLandingPage(pageId);
      res.json({ message: "Landing page deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting landing page" });
    }
  });

  app.post("/api/landing-pages/:id/clone", isAuthenticated, async (req, res) => {
    try {
      const pageId = Number(req.params.id);
      const { name, description } = req.body;
      
      // Get the original page
      const originalPage = await storage.getLandingPage(pageId);
      if (!originalPage) {
        return res.status(404).json({ message: "Landing page not found" });
      }
      
      if (originalPage.organization_id !== req.user!.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Create a copy with new name
      const clonedPage = await storage.createLandingPage(req.user!.organizationId, req.user!.id, {
        name: name || `Copy of ${originalPage.name}`,
        description: description || originalPage.description,
        htmlContent: originalPage.htmlContent,
        cssContent: originalPage.cssContent,
        jsContent: originalPage.jsContent,
        redirectUrl: originalPage.redirectUrl,
        pageType: originalPage.pageType,
        sourceUrl: originalPage.sourceUrl,
        captureCredentials: originalPage.captureCredentials,
        captureSubmissions: originalPage.captureSubmissions,
        trackClicks: originalPage.trackClicks,
        isTemplate: false,
      });
      
      res.status(201).json(clonedPage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error cloning landing page" });
    }
  });

  app.post("/api/landing-pages/clone-website", isAuthenticated, async (req, res) => {
    try {
      console.log("Clone website request received:", req.body);
      const validatedData = cloneWebpageSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      
      // Clone the webpage using a web scraping service or fetch
      console.log("Starting webpage cloning for:", validatedData.url);
      const clonedContent = await cloneWebpage(validatedData.url);
      console.log("Webpage cloned successfully, content length:", clonedContent.html.length);
      
      // Create the landing page with cloned content
      const page = await storage.createLandingPage(req.user!.organizationId, req.user!.id, {
        name: validatedData.name,
        description: validatedData.description,
        htmlContent: clonedContent.html,
        cssContent: clonedContent.css,
        jsContent: clonedContent.js,
        pageType: "cloned",
        sourceUrl: validatedData.url,
        captureCredentials: validatedData.captureCredentials,
        captureSubmissions: validatedData.captureSubmissions,
        trackClicks: validatedData.trackClicks,
        isTemplate: false,
      });
      
      console.log("Landing page created successfully:", page.id);
      res.status(201).json(page);
    } catch (error) {
      console.error("Error in clone-website endpoint:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error cloning webpage", error: error.message });
    }
  });

  // Campaigns Endpoints
  app.get("/api/campaigns", isAuthenticated, async (req, res) => {
    try {
      const campaignList = await storage.listCampaigns(req.user.organizationId);
      
      // Include group names and other related data
      const campaigns = [];
      for (const campaign of campaignList) {
        const group = await storage.getGroup(campaign.targetGroupId);
        const targets = await storage.listTargets(campaign.targetGroupId);
        
        campaigns.push({
          ...campaign,
          targetGroup: group?.name || "Unknown",
          totalTargets: targets.length,
          sentCount: 0, // In a real app, calculate this from results
          openRate: Math.floor(Math.random() * 100), // Mock data
          clickRate: Math.floor(Math.random() * 70), // Mock data
        });
      }
      
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Error fetching campaigns" });
    }
  });

  app.post("/api/campaigns", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      
      // Ensure user has access to the referenced resources
      const group = await storage.getGroup(Number(validatedData.targetGroupId));
      if (!group || group.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied: Invalid target group" });
      }
      
      const smtpProfile = await storage.getSmtpProfile(Number(validatedData.smtpProfileId));
      if (!smtpProfile || smtpProfile.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied: Invalid SMTP profile" });
      }
      
      const emailTemplate = await storage.getEmailTemplate(Number(validatedData.emailTemplateId));
      if (!emailTemplate || emailTemplate.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied: Invalid email template" });
      }
      
      const landingPage = await storage.getLandingPage(Number(validatedData.landingPageId));
      if (!landingPage || landingPage.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied: Invalid landing page" });
      }
      
      const campaign = await storage.createCampaign(req.user.organizationId, req.user.id, validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating campaign" });
    }
  });

  // Users Endpoints
  // User profile endpoints
  app.put("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const allowedFields = ['firstName', 'lastName', 'position', 'bio'];
      const updateData: Partial<User> = {};
      
      // Only allow specific fields to be updated
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field as keyof User] = req.body[field];
        }
      }
      
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  
  app.post("/api/user/change-password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      // Get the user with password (for verification)
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Use imported password functions from auth.ts
      // They are already available since we imported them at the top
      
      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
          message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character" 
        });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update the user's password
      const updatedUser = await storage.updateUser(req.user.id, { 
        password: hashedPassword,
        failedLoginAttempts: 0,
        accountLocked: false,
        accountLockedUntil: null
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
  
  app.post("/api/user/profile-picture", isAuthenticated, upload.single('profilePicture'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Convert image to base64 for storage
      // In a production app, you might want to store the file elsewhere and just save the URL
      const profilePicture = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      const updatedUser = await storage.updateUser(req.user.id, { profilePicture });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ message: "Failed to update profile picture" });
    }
  });
  
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.listUsers(req.user.organizationId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  
  // Create test user for MongoDB testing (only in development)
  app.post("/api/create-test-user", async (_req, res) => {
    try {
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ 
          status: "error", 
          message: "This endpoint is only available in development mode" 
        });
      }
      
      // First check if there's already an admin user
      const existingAdmin = await models.User.findOne({ email: "admin@example.com" });
      
      if (existingAdmin) {
        return res.json({ 
          status: "success", 
          message: "Test user already exists", 
          userId: existingAdmin._id.toString(),
          credentials: {
            email: "admin@example.com",
            password: "Password123!" // Only shown for testing
          }
        });
      }
      
      // Create a test organization
      const organization = await models.Organization.create({
        name: "Test Organization",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Create admin user with hashed password
      const hashedPassword = await hashPassword("Password123!");
      
      const adminUser = await models.User.create({
        email: "admin@example.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
        organization: organization._id,
        organizationName: organization.name,
        failedLoginAttempts: 0,
        accountLocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Created test user:', adminUser._id.toString());
      
      res.json({ 
        status: "success", 
        message: "Test user created successfully",
        userId: adminUser._id.toString(),
        organizationId: organization._id.toString(),
        credentials: {
          email: "admin@example.com",
          password: "Password123!" // Only shown for testing
        }
      });
    } catch (error) {
      console.error("Error creating test user:", error);
      res.status(500).json({ status: "error", message: String(error) });
    }
  });

  // Education System Endpoints
  app.get("/api/education/content", isAuthenticated, async (req, res) => {
    try {
      const content = await storage.listEducationContent(req.user.organizationId);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Error fetching education content" });
    }
  });

  app.post("/api/education/content", isAuthenticated, async (req, res) => {
    try {
      const content = await storage.createEducationContent(req.user.organizationId, req.user.id, req.body);
      res.status(201).json(content);
    } catch (error) {
      res.status(500).json({ message: "Error creating education content" });
    }
  });

  app.get("/api/education/modules", isAuthenticated, async (req, res) => {
    try {
      const modules = await storage.listEducationModules(req.user.organizationId);
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: "Error fetching education modules" });
    }
  });

  app.post("/api/education/modules", isAuthenticated, async (req, res) => {
    try {
      const module = await storage.createEducationModule(req.user.organizationId, req.body);
      res.status(201).json(module);
    } catch (error) {
      res.status(500).json({ message: "Error creating education module" });
    }
  });

  // Training System Endpoints
  app.get("/api/training/courses", isAuthenticated, async (req, res) => {
    try {
      const courses = await storage.listTrainingCourses(req.user.organizationId);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching training courses" });
    }
  });

  app.post("/api/training/courses", isAuthenticated, async (req, res) => {
    try {
      const course = await storage.createTrainingCourse(req.user.organizationId, req.user.id, req.body);
      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ message: "Error creating training course" });
    }
  });

  app.get("/api/training/exams", isAuthenticated, async (req, res) => {
    try {
      const exams = await storage.listTrainingExams(req.user.organizationId);
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Error fetching training exams" });
    }
  });

  app.post("/api/training/exams", isAuthenticated, async (req, res) => {
    try {
      const exam = await storage.createTrainingExam(req.user.organizationId, req.body);
      res.status(201).json(exam);
    } catch (error) {
      res.status(500).json({ message: "Error creating training exam" });
    }
  });

  app.get("/api/training/user-progress", isAuthenticated, async (req, res) => {
    try {
      const progress = await storage.getUserTrainingProgress(req.user.id);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user progress" });
    }
  });

  // Compliance System Endpoints
  app.get("/api/compliance/frameworks", isAuthenticated, async (req, res) => {
    try {
      const frameworks = await storage.listComplianceFrameworks(req.user.organizationId);
      res.json(frameworks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching compliance frameworks" });
    }
  });

  app.post("/api/compliance/frameworks", isAuthenticated, async (req, res) => {
    try {
      const framework = await storage.createComplianceFramework(req.user.organizationId, req.body);
      res.status(201).json(framework);
    } catch (error) {
      res.status(500).json({ message: "Error creating compliance framework" });
    }
  });

  app.get("/api/compliance/assessments", isAuthenticated, async (req, res) => {
    try {
      const assessments = await storage.listComplianceAssessments(req.user.organizationId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching compliance assessments" });
    }
  });

  app.post("/api/compliance/assessments", isAuthenticated, async (req, res) => {
    try {
      const assessment = await storage.createComplianceAssessment(req.user.organizationId, req.user.id, req.body);
      res.status(201).json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Error creating compliance assessment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import express from "express"; // Added missing express import
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { DatabaseStorage } from "./storage";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { generatePasswordResetToken, verifyPasswordResetToken, sendPasswordResetEmail } from "./email";

// Initialize storage - will be shared across all auth functions
const storage = new DatabaseStorage();

// Maximum login attempts before account lockout
const MAX_LOGIN_ATTEMPTS = 10;
// Lockout time in milliseconds (30 minutes)
const LOCKOUT_TIME = 30 * 60 * 1000;
// Time window to reset failed attempts (24 hours)
const RESET_WINDOW = 24 * 60 * 60 * 1000;

// Import validation schemas from shared schema
import { userValidationSchema } from '@shared/schema';

// Define additional validation schemas
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password cannot exceed 16 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
});

declare global {
  namespace Express {
    // Define User interface for PostgreSQL model
    interface User {
      id: number;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
      position?: string;
      bio?: string;
      failedLoginAttempts: number;
      lastFailedLogin?: Date;
      accountLocked: boolean;
      accountLockedUntil?: Date;
      isAdmin: boolean;
      organizationId: number;
      organizationName: string;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

// Configure multer storage for profile pictures
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + extension);
  }
});

// Create multer upload instance with file type validation
const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max size
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error("Only image files are allowed!"));
  }
});

/**
 * Enhanced password hashing with stronger security
 */
export async function hashPassword(password: string) {
  // Use a longer salt for better security
  const salt = randomBytes(32).toString("hex");
  // Increase cost factor with larger buffer
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Secure password comparison with timing-safe implementation
 */
export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Check if an account is locked or has too many failed attempts
 */
async function checkAccountLockStatus(user: any) {
  // Check if account is locked and if lockout period has expired
  if (user.accountLocked && user.accountLockedUntil) {
    const now = new Date();
    const lockUntil = new Date(user.accountLockedUntil);
    
    if (now < lockUntil) {
      // Account is still locked
      return {
        locked: true,
        message: `Account is locked. Try again after ${lockUntil.toLocaleString()}`
      };
    } else {
      // Lockout period expired, reset the lock and counter
      // Use id for PostgreSQL
      const userId = user.id;
      await storage.updateUser(userId, { 
        accountLocked: false,
        accountLockedUntil: null,
        failedLoginAttempts: 0
      });
      return { locked: false };
    }
  }
  
  // Check if failed attempts should be reset (have been a long time ago)
  if (user.lastFailedLogin && user.failedLoginAttempts > 0) {
    const lastAttempt = new Date(user.lastFailedLogin);
    const now = new Date();
    
    if (now.getTime() - lastAttempt.getTime() > RESET_WINDOW) {
      // Reset counter after window expires
      await storage.updateUser(user.id, {
        failedLoginAttempts: 0
      });
    }
  }
  
  return { locked: false };
}

/**
 * Increment failed login attempts and potentially lock account
 */
async function recordFailedLoginAttempt(user: any) {
  const newAttemptCount = (user.failedLoginAttempts || 0) + 1;
  
  // Update user with new attempt count and timestamp
  const updates: any = {
    failedLoginAttempts: newAttemptCount,
    lastFailedLogin: new Date()
  };
  
  // Lock account if max attempts reached
  if (newAttemptCount >= MAX_LOGIN_ATTEMPTS) {
    const lockUntil = new Date(Date.now() + LOCKOUT_TIME);
    updates.accountLocked = true;
    updates.accountLockedUntil = lockUntil;
  }
  
  // Use id for PostgreSQL
  const userId = user.id;
  await storage.updateUser(userId, updates);
  
  return newAttemptCount >= MAX_LOGIN_ATTEMPTS;
}

/**
 * Reset failed login attempts after successful login
 */
async function resetFailedLoginAttempts(userId: number) {
  try {
    console.log('Resetting failed login attempts for user ID:', userId);
    
    await storage.updateUser(userId, {
      failedLoginAttempts: 0,
      lastFailedLogin: null,
      accountLocked: false,
      accountLockedUntil: null
    });
  } catch (error) {
    console.error('Error resetting failed login attempts:', error);
  }
}

/**
 * Sanitize input to prevent SQL injection
 */
function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove any SQL command or dangerous characters
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, "") // Remove semicolons
    .replace(/--/g, "") // Remove SQL comments
    .replace(/\/\*/g, "") // Remove block comment start
    .replace(/\*\//g, "") // Remove block comment end
    .trim();
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'phishnet-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000, // 10 minutes for security (auto-logout after inactivity)
      httpOnly: true, // Prevent XSS attacks
      sameSite: 'lax' // CSRF protection
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure static routes for uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          // Sanitize input 
          const sanitizedEmail = sanitizeInput(email);
          
          // Get user by email 
          const user = await storage.getUserByEmail(sanitizedEmail);
          
          // If no user found, return false without details (security best practice)
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          
          // Check if account is locked
          const lockStatus = await checkAccountLockStatus(user);
          if (lockStatus.locked) {
            return done(null, false, { message: lockStatus.message });
          }
          
          // Verify password  
          if (await comparePasswords(password, user.password)) {
            // Reset failed login attempts on successful login
            // Use _id for MongoDB, fallback to id for compatibility
            const userId = user._id || user.id;
            await resetFailedLoginAttempts(userId);
            
            // Make sure user has the _id property which is needed for session serialization
            if (!user._id && user.id) {
              user._id = user.id;
            }
            
            return done(null, user);
          } else {
            // Record failed attempt and potentially lock account
            const accountLocked = await recordFailedLoginAttempt(user);
            
            if (accountLocked) {
              return done(null, false, { 
                message: "Too many failed login attempts. Account locked for 30 minutes."
              });
            } else {
              const remainingAttempts = MAX_LOGIN_ATTEMPTS - (user.failedLoginAttempts + 1);
              return done(null, false, { 
                message: `Invalid email or password. ${remainingAttempts} attempts remaining.`
              });
            }
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    // For MongoDB, use _id instead of id
    // Ensure we always have a string ID
    const userId = user._id ? 
      (typeof user._id === 'object' ? user._id.toString() : user._id) : 
      user.id;
    
    console.log('Serializing user with ID:', userId);
    done(null, userId);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log('Deserializing user with ID:', id);
      const user = await storage.getUser(id);
      if (!user) {
        console.error('User not found during deserialization:', id);
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error('Error during deserialization:', error);
      done(error);
    }
  });

  // Registration endpoint with strong password validation
  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate user data with strong password rules
      try {
        userValidationSchema.parse(req.body);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return res.status(400).json({
            message: "Validation failed",
            errors: validationError.errors
          });
        }
      }

      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(req.body.email);
      let sanitizedOrgName = "";
      let orgId = 0; // Default to 0 (no organization)
      
      // Only process organization if provided
      if (req.body.organizationName && req.body.organizationName.trim() !== '') {
        sanitizedOrgName = sanitizeInput(req.body.organizationName);
      } else {
        // Set default organization name if not provided or empty string
        sanitizedOrgName = "None";
      }

      // First check if email already exists
      const existingUser = await storage.getUserByEmail(sanitizedEmail);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Get or create the "None" organization for users without a specific organization
      if (sanitizedOrgName === "None") {
        let noneOrg = await storage.getOrganizationByName("None");
        
        if (!noneOrg) {
          // Create the None organization if it doesn't exist
          noneOrg = await storage.createOrganization({ name: "None" });
        }
        
        orgId = noneOrg.id;
      } 
      // Handle regular organization cases
      else if (sanitizedOrgName) {
        const organization = await storage.getOrganizationByName(sanitizedOrgName);
        
        if (!organization) {
          // Create new organization
          const newOrg = await storage.createOrganization({ name: sanitizedOrgName });
          orgId = newOrg.id;
        } else {
          orgId = organization.id;
        }
      }

      // Only check existing users if organization provided
      let isFirstUser = false;
      if (orgId > 0) {
        const existingUsers = await storage.listUsers(orgId);
        isFirstUser = existingUsers.length === 0;
      }
      
      // User is admin if they're the first in their organization and they provided a real org name (not "None")
      const isAdmin = isFirstUser && sanitizedOrgName !== "None" && sanitizedOrgName.length > 0;
      
      // Create the user associated with the organization if provided
      const user = await storage.createUser({
        ...req.body,
        email: sanitizedEmail,
        organizationName: sanitizedOrgName || "None", // Default to "None" if not provided
        password: await hashPassword(req.body.password),
        organizationId: orgId,
        isAdmin: isAdmin
      });

      // Remove the password from the response for security
      const { password, ...userWithoutPassword } = user;

      // Don't automatically log in, just return success message
      res.status(201).json({ 
        ...userWithoutPassword,
        message: "User registered successfully. Please log in."
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });

  // Login with custom error handling
  app.post("/api/login", (req, res, next) => {
    console.log('Login attempt for user:', req.body.email);
    
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error('Authentication error:', err);
        return next(err);
      }
      
      if (!user) {
        console.log('Authentication failed:', info?.message);
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      console.log('User authenticated successfully, calling req.login');
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return next(loginErr);
        }
        
        console.log('Login successful, user ID:', user._id || user.id);
        
        // Don't send password in response
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Don't send password in response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Upload profile picture endpoint
  app.post("/api/user/profile-picture", isAuthenticated, upload.single('profilePicture'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filePath = `/uploads/${req.file.filename}`;
      
      // Update user profile with the new picture path
      await storage.updateUser(req.user.id, {
        profilePicture: filePath
      });

      res.status(200).json({ 
        message: "Profile picture updated",
        profilePicture: filePath
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });
  
  // Update user profile endpoint
  app.put("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const allowedFields = ['firstName', 'lastName', 'position', 'bio'];
      const updates: Partial<SelectUser> = {};
      
      // Only include allowed fields to prevent mass assignment vulnerabilities
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = sanitizeInput(req.body[field]);
        }
      }
      
      // Update the user profile
      const updatedUser = await storage.updateUser(req.user.id, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return sanitized user data
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  
  // Forgot password endpoint - initiates password reset flow
  app.post("/api/forgot-password", async (req, res) => {
    try {
      // Validate request data
      try {
        forgotPasswordSchema.parse(req.body);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return res.status(400).json({
            message: "Validation failed",
            errors: validationError.errors
          });
        }
      }
      
      // Sanitize email input
      const sanitizedEmail = sanitizeInput(req.body.email);
      
      // Find user by email
      const user = await storage.getUserByEmail(sanitizedEmail);
      
      // Always return success even if user not found (security best practice)
      if (!user) {
        return res.status(200).json({ 
          message: "If an account exists with this email, a password reset link has been sent." 
        });
      }
      
      // Generate JWT token
      const token = generatePasswordResetToken(user);
      
      // Store token in database with expiry
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await storage.createPasswordResetToken(user.id, token, expiresAt);
      
      // Generate reset URL for the email
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
      
      // Send password reset email
      const emailSent = await sendPasswordResetEmail(user, resetUrl);
      
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send password reset email" });
      }
      
      res.status(200).json({ 
        message: "Password reset link has been sent to your email." 
      });
    } catch (error) {
      console.error("Error in forgot password flow:", error);
      res.status(500).json({ message: "An error occurred processing your request" });
    }
  });
  
  // Reset password endpoint - completes password reset with new password
  app.post("/api/reset-password", async (req, res) => {
    try {
      // Validate request data
      try {
        resetPasswordSchema.parse(req.body);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return res.status(400).json({
            message: "Validation failed",
            errors: validationError.errors
          });
        }
      }
      
      const { token, password } = req.body;
      
      // Verify the token from JWT
      const decodedToken = verifyPasswordResetToken(token);
      if (!decodedToken) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      
      // Get token from database to ensure it's not already used
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      
      // Check if token is expired
      if (new Date() > new Date(resetToken.expiresAt)) {
        return res.status(400).json({ message: "Token has expired" });
      }
      
      // Get the user
      const user = await storage.getUser(decodedToken.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user password
      const hashedPassword = await hashPassword(password);
      await storage.updateUser(user.id, { password: hashedPassword });
      
      // Mark token as used
      await storage.markPasswordResetTokenUsed(resetToken.id);
      
      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Error in reset password flow:", error);
      res.status(500).json({ message: "An error occurred processing your request" });
    }
  });
  
  // Change password endpoint - for authenticated users to update their password
  app.post("/api/change-password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Validate new password
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }
      
      // Get current user
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Update with new password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { 
        password: hashedPassword,
        updatedAt: new Date()
      });
      
      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
}

// Middleware to ensure user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to ensure user is admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
}

// Middleware to ensure user has organization access
export function hasOrganization(req: Request, res: Response, next: NextFunction) {
  // User must be authenticated, have an organization ID, and not belong to the "None" organization
  if (req.isAuthenticated() && 
      req.user.organizationId && 
      req.user.organizationId > 0 && 
      req.user.organizationName !== "None") {
    return next();
  }
  res.status(403).json({ message: "Organization access required" });
}

// Middleware to refresh session to avoid timeouts
export function refreshSession(req: Request, res: Response, next: NextFunction) {
  if (req.session) {
    req.session.touch();
  }
  next();
}

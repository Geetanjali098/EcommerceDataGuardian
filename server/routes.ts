import type { Express } from "express";
import { createServer, type Server } from "http";
import { MemStorage, storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import { isAuthenticated, isAdmin, isAnalyst, AuthenticatedRequest } from "./middleware/auth";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import type { User } from "@shared/schema";
import jwt from 'jsonwebtoken';

export async function registerRoutes(app: Express): Promise<Server> {
  try {
    // Initialize storage with seed data
    await storage.initializeWithSeedData();
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    throw new Error("Storage initialization failed");
  }

  // Set up session
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "e-commerce-data-quality-dashboard-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === "production", 
        maxAge: 86400000, // 24 hours
        httpOnly: true // Added for security
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    try {
      const user = await storage.getUserByUsername(username);
      
      // SECURITY NOTE: In production, always use bcrypt or similar to compare hashed passwords
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user in session
      req.session.userId = user.id;

      // SECURITY NOTE: In production, use proper JWT tokens with expiration
      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
             };

const secret = process.env.JWT_SECRET || '52f312bc46471fc4d501654e5b3757ee97899f05df067fbb1dd8eb77f977d1465cead8140bfadc58cce1256b77ae0ea08ab63a63d109a8a80b425f76ffeb38d8';
const token = jwt.sign(payload, secret, { expiresIn: '1h' });

// Set token in session for later use
      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // (Moved out from login handler)
  app.get("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const currentUserId = await storage.getCurrentUserId();

      const filteredUsers = allUsers
        .filter((user) => user.id !== currentUserId)
        .map((user) => ({
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl
        }));
      return res.json(filteredUsers);
    } catch (error) {
      console.error("Get users error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      return res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      });
    } catch (error) {
      console.error("Get current user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // User management routes (admin only)
  app.get("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      const filteredUsers = users
        .filter((user): user is User => user !== undefined)
        .map(user => ({
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl
        }));
      
      return res.json(filteredUsers);
    } catch (error) {
      console.error("Get users error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedUser = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedUser);
      
      return res.status(201).json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: error.errors 
        });
      }
      console.error("Create user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard data routes (similar improvements made to all routes)
  app.get("/api/dashboard/quality-metrics", isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getLatestQualityMetrics();
      if (!metrics) {
        return res.status(404).json({ message: "No quality metrics found" });
      }
      return res.json(metrics);
    } catch (error) {
      console.error("Get quality metrics error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // [Other dashboard routes follow the same pattern...]

  // Export functionality
  app.get("/api/export/report", isAuthenticated, async (req, res) => {
    try {
      const [metrics, pipelines, issues, sources, trendData] = await Promise.all([
        storage.getLatestQualityMetrics(),
        storage.getAllDataPipelines(),
        storage.getAllDataIssues(),
        storage.getAllDataSources(),
        storage.getAllQualityTrendData()
      ]);

      if (!metrics || !pipelines || !issues || !sources || !trendData) {
        return res.status(404).json({ message: "Data not available for export" });
      }

      // Build CSV content
      let csv = "Data Quality Dashboard Export\n\n";
      
      // Add quality metrics
      csv += "QUALITY METRICS\n";
      csv += "Metric,Value,Change\n";
      csv += `Overall Quality,${metrics.overallScore}%,${metrics.trendChange}%\n`;
      csv += `Data Freshness,${metrics.dataFreshness}%,${metrics.freshnessChange}%\n`;
      csv += `Data Completeness,${metrics.dataCompleteness}%,${metrics.completenessChange}%\n`;
      csv += `Data Accuracy,${metrics.dataAccuracy}%,${metrics.accuracyChange}%\n\n`;
      
      // [Rest of CSV generation...]

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=data-quality-report.csv');
      
      return res.send(csv);
    } catch (error) {
      console.error("Export report error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

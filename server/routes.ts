import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, isAdmin, isAnalyst, AuthenticatedRequest } from "./middleware/auth";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import type { User } from "@shared/schema";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import admin from "firebase-admin";
import { useAuth } from '@/hooks/use-auth';
import { login, signup } from "../server/controller/auth.controller";
import QualityScore from '../server/models/QualityScore'; // Assuming qualityScores is a collection or module for quality scores
import {DataIssue} from '../server/models/DataIssue'; // Assuming DataIssue is a model for data issues
import { TrendPoint } from '../server/models/TrendPoint'; // Assuming TrendPoint is a model for trend points
import { Anomaly } from '../server/models/Anomaly'; // Assuming Anomaly is a model for anomalies
import { QualityMetric } from '../server/models/QualityMetric'; // Assuming QualityMetric is a model for quality metrics
import { Pipeline } from '../server/models/Pipeline'; // Assuming Pipeline is a model for data pipelines
import { Insight } from '../server/models/Insight'; // Assuming Insights is a model for insights
import { Report } from "../server/models/Report";


const router = express.Router();


export async function registerRoutes(app: Express): Promise<Server> {
    // Validate JWT_SECRET is available
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not set!");
    throw new Error("JWT_SECRET environment variable is required");
  }
  try {
    await storage.initializeWithSeedData();
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    throw new Error("Storage initialization failed");
  }

   // Use the auth controller routes
  app.post('/api/auth/signup', signup);
  app.post('/api/auth/login', login);
 
  
  // 🔐 JWT Login Route
  app.post("/api/auth/login-backup", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    try {
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      const refreshToken = crypto.randomBytes(40).toString('hex');
      await storage.saveRefreshToken(user.id, refreshToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        token: accessToken,
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

 // 🔐 Google Sign-In Route
  app.post("/api/auth/google", async (req, res) => {
    const { token, role } = req.body;

    if (!token || !role) {
      return res.status(400).json({ message: "Token and role are required" });
    }

    try {
      const decoded = await admin.auth().verifyIdToken(token);
      console.log("Decoded Firebase token:", decoded);
    
            // Generate a numeric ID from the Firebase UID string
      const numericId = Math.abs(decoded.uid.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0));

        console.log("Generated user ID:", numericId);
      console.log("Firebase UID:", decoded.uid);

      // Check if user already exists
      let existingUser = await storage.getUser(numericId);
      
      if (!existingUser) {
        // Create new user
        const newUser = {
          id: numericId,
          username: decoded.email || `user_${numericId}`,
          name: decoded.name || "Google User",
          email: decoded.email || "",
          role: role,
          avatarUrl: decoded.picture || "",
          password: "google-oauth",
        };

             existingUser = await storage.createUser(newUser);
      } else {
        // Update existing user's role if different
        if (existingUser.role !== role) {
          existingUser.role = role;
         await storage.createUser(existingUser);
        }
      }

      const jwtToken = jwt.sign(
        { id: existingUser.id, username: existingUser.username, role: existingUser.role },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      return res.json({
        token: jwtToken,
        user: {
          id: existingUser.id,
          username: existingUser.username,
          role: existingUser.role,
          name: existingUser.name,
          email: existingUser.email,
          avatarUrl: existingUser.avatarUrl,
        },
      });
    } catch (error) {
      console.error("Google Sign-In error:", error);
      return res.status(401).json({ 
               message: error instanceof Error ? error.message: "Invalid Google token" });
    }
  });

  // 🔐 JWT Logout Route
  app.post("/api/auth/logout", (req, res) => {
    return res.json({ message: "Logged out successfully (client-side)" });
  });

  // 🔐 Authenticated User Info
  app.get("/api/auth/me", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      console.log("Looking for user with ID:", req.user.id);
      const user = await storage.getUser(req.user.id);
      console.log("User found:", !!user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      console.error("Get current user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // 👥 Admin: View Users
  app.get("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();

      const filteredUsers = users
        .filter((user): user is User => user !== undefined)
        .map((user) => ({
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        }));

      return res.json(filteredUsers);
    } catch (error) {
      console.error("Get users error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // 👥 Admin: Create User
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
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid user data",
          errors: error.errors,
        });
      }
      console.error("Create user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // 📊 Dashboard API Route
     app.get("/api/dashboard/quality-scores", isAuthenticated, async  (req, res) => {
       try {
        const score =  await QualityScore.findOne(); // from qualityScores collection
           res.json(score); 
             } catch (err) {
    console.error("Error fetching quality score:", err);
    res.status(500).json({ message: "Failed to fetch score" });
  } 
  });

  app.get("/api/dashboard/data-issues", isAuthenticated,  async(req, res) => {
     try {
       const issues =  await DataIssue.find({});
    res.json(issues);
     } catch (err) {
    console.error("Error fetching data issues:", err);
    res.status(500).json({ message: "Failed to fetch issues" });
  }
  });

  app.get("/api/dashboard/quality-trends", isAuthenticated,  async (req, res) => {
     try {
    const trends =  await TrendPoint.find({});
    res.json(trends);
      } catch (err) {
    console.error("Error fetching trend data:", err);
    res.status(500).json({ message: "Failed to fetch trend data" });
  }
  });

  app.get("/api/dashboard/recent-anomalies", isAuthenticated,  async (req, res) => {
     try {
   const anomalies =   await  Anomaly.find({});
    res.json(anomalies);
      } catch (err) {
    console.error("Error fetching anomalies:", err);
    res.status(500).json({ message: "Failed to fetch anomalies" });
  }
  });

  app.get("/api/dashboard/pipeline-status", isAuthenticated, async (req, res) => {
     try {
     const pipelines =   await Pipeline.find({});
    res.json(pipelines);
    } catch (err) {
    console.error("Error fetching pipelines:", err);
    res.status(500).json({ message: "Failed to fetch pipelines" });
  }
  });

  app.get("/api/dashboard/data-quality-by-source", isAuthenticated, async  (req, res) => {
     try {
    const sources =   await storage.getAllDataSources();
    res.json(Array.isArray(sources) ? sources : []);
      } catch (err) {
    console.error("Error fetching sources:", err);
    res.status(500).json({ message: "Failed to fetch sources" });
  }
  });

  app.get("/api/dashboard/quality-metrics", isAuthenticated, async (req, res) => {
     try {
    const metrics = await QualityMetric.find({});
    res.json(metrics);
      } catch (err) {
    console.error("Error fetching quality metrics:", err);
    res.status(500).json({ message: "Failed to fetch quality metrics" });
  }
  });

  app.get("/api/dashboard/insights", isAuthenticated, async (req, res) => {
     try {
    const insights =   await Insight.find({});
    res.json(insights);
     } catch (err) {
    console.error("Error fetching insights:", err);
    res.status(500).json({ message: "Failed to fetch insights" });
  }
  });

  app.get("/api/dashboard/reports", isAuthenticated, async (req, res) => {
      try {
    const reports = await Report.find({});
    res.json(reports);
      } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
  });

  // 📊 Quality Metrics

  // 📦 Export CSV
  app.get("/api/export/report", isAuthenticated, async (req, res) => {
    try {
      const [metrics, pipelines, issues, sources, trendData] = await Promise.all([
        storage.getLatestQualityMetrics(),
        storage.getAllDataPipelines(),
        storage.getAllDataIssues(),
        storage.getAllDataSources(),
        storage.getAllQualityTrendData(),
      ]);

      if (!metrics || !pipelines || !issues || !sources || !trendData) {
        return res.status(404).json({ message: "Data not available for export" });
      }

      let csv = "Data Quality Dashboard Export\n\n";
      csv += "QUALITY METRICS\n";
      csv += "Metric,Value,Change\n";
      csv += `Overall Quality,${metrics.overallScore}%,${metrics.trendChange}%\n`;
      csv += `Data Freshness,${metrics.dataFreshness}%,${metrics.freshnessChange}%\n`;
      csv += `Data Completeness,${metrics.dataCompleteness}%,${metrics.completenessChange}%\n`;
      csv += `Data Accuracy,${metrics.dataAccuracy}%,${metrics.accuracyChange}%\n\n`;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=data-quality-report.csv");

      return res.send(csv);
    } catch (error) {
      console.error("Export report error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

export default router;

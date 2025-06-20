import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, isAdmin, isAnalyst, AuthenticatedRequest } from "./middleware/auth";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import type { User } from "@shared/schema";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import admin from "firebase-admin";


export async function registerRoutes(app: Express): Promise<Server> {
  try {
    await storage.initializeWithSeedData();
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    throw new Error("Storage initialization failed");
  }

 
  
  // 🔐 JWT Login Route
  app.post("/api/auth/login", async (req, res) => {
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

      const userInfo = {
        id: Number(decoded.uid),
        name: decoded.name || "",
        email: decoded.email || "",
        avatarUrl: decoded.picture || "",
        role,
      };

      await storage.setCurrentUser({
        id: Number(decoded.uid),
        username: userInfo.email,
        name: userInfo.name,
        email: userInfo.email,
        role: userInfo.role,
        avatarUrl: userInfo.avatarUrl,
        password: "google-oauth",
      });

      const jwtToken = jwt.sign(
        { id: userInfo.id, username: userInfo.email, role: userInfo.role },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      return res.json({
        token: jwtToken,
        user: userInfo,
      });
    } catch (error) {
      console.error("Google Sign-In error:", error);
      return res.status(401).json({ message: "Invalid Google token" });
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

  // 📊 Dashboard Route Example
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


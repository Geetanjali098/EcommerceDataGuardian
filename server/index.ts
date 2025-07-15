import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { errorHandler } from "./middleware/errorHandler";
import admin from "firebase-admin";
import dotenv from "dotenv";
import mongoose from 'mongoose';
import { DataSource } from "./models/DataSource";
import { DataIssue } from "./models/DataIssue";
import { Pipeline } from "./models/Pipeline";
import { TrendPoint } from "./models/TrendPoint";
import { Anomaly } from "./models/Anomaly";
import { QualityMetric } from "./models/QualityMetric";
import { Insight } from "./models/Insight";
import { Report } from "./models/Report";

// Middleware
import { isAuthenticated } from "./middleware/auth";

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB

mongoose
  .connect(process.env.MONGO_URI!, {
    dbName: "data_quality"
  })

  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection failed", err));

// ✅ Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

    if (
      !serviceAccount.project_id ||
      !serviceAccount.client_email ||
      !serviceAccount.private_key
    ) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT is missing required fields.");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("🔥 Firebase initialization error:", error);
    process.exit(1);
  }
}

const app = express();

  //  CORS CONFIGURATION
    app.use(
      cors({
        origin: ['http://localhost:5000', 'http://0.0.0.0:5000'], // Support both localhost and 0.0.0.0
        credentials: true, // Required for cookies/session
        allowedHeaders: ['Authorization', 'Content-Type'],
      })
    );

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(errorHandler);


app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });
//Add routes for the dashboard API

  // Data Sources
app.get("/api/dashboard/data-quality-by-source", isAuthenticated, async (req, res) => {
  try {
    const sources = await DataSource.find({});
    res.json(sources);
  } catch (err) {
    console.error("Error fetching data sources:", err);
    res.status(500).json({ message: "Failed to fetch sources" });
  }
});

//  Data Issues
app.get("/api/dashboard/data-issues", isAuthenticated, async (req, res) => {
  try {
    const issues = await DataIssue.find({});
    res.json(issues);
  } catch (err) {
    console.error("Error fetching data issues:", err);
    res.status(500).json({ message: "Failed to fetch issues" });
  }
});

// Pipeline Status
app.get("/api/dashboard/pipeline-status", isAuthenticated, async (req, res) => {
  try {
    const pipelines = await Pipeline.find({});
    res.json(pipelines);
  } catch (err) {
    console.error("Error fetching pipelines:", err);
    res.status(500).json({ message: "Failed to fetch pipelines" });
  }
});

//  Quality Trends
app.get("/api/dashboard/quality-trends", isAuthenticated, async (req, res) => {
  try {
    const trends = await TrendPoint.find({});
    res.json(trends);
  } catch (err) {
    console.error("Error fetching trend points:", err);
    res.status(500).json({ message: "Failed to fetch trend data" });
  }
});

//  Recent Anomalies
app.get("/api/dashboard/recent-anomalies", isAuthenticated, async (req, res) => {
  try {
    const anomalies = await Anomaly.find({});
    res.json(anomalies);
  } catch (err) {
    console.error("Error fetching anomalies:", err);
    res.status(500).json({ message: "Failed to fetch anomalies" });
  }
});

//  Quality Metrics (Accuracy, Completeness, etc.)
app.get("/api/dashboard/quality-metrics", isAuthenticated, async (req, res) => {
  try {
    const metrics = await QualityMetric.find({});
    res.json(metrics);
  } catch (err) {
    console.error("Error fetching quality metrics:", err);
    res.status(500).json({ message: "Failed to fetch metrics" });
  }
});

// Insights
app.get("/api/dashboard/insights", isAuthenticated, async (req, res) => {
  try {
    const insights = await Insight.find({});
    res.json(insights);
  } catch (err) {
    console.error("Error fetching insights:", err);
    res.status(500).json({ message: "Failed to fetch insights" });
  }
});
// Reports
app.get("/api/dashboard/reports", isAuthenticated, async (req, res) => {
  try {
    const reports = await Report.find({});
    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});
  // Setup Vite for development
  // This is done after all routes are registered

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();

  
   

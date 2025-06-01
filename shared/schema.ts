import { z } from "zod";

// Type definitions
// User types
export interface User {
  id: number;
  username: string;
  password: string;
  role: "admin" | "analyst";
  name: string;
  email: string;
  avatarUrl?: string;
}

export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  role: z.enum(["admin", "analyst"]).default("analyst"),
  name: z.string().min(1),
  email: z.string().email(),
  avatarUrl: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

// Quality Metrics types
export interface QualityMetric {
  id: number;
  date: Date;
  overallScore: number;
  dataFreshness: number;
  dataCompleteness: number;
  dataAccuracy: number;
  trendChange: number;
  freshnessChange: number;
  completenessChange: number;
  accuracyChange: number;
}

export const insertQualityMetricsSchema = z.object({
  date: z.date().default(() => new Date()),
  overallScore: z.number(),
  dataFreshness: z.number(),
  dataCompleteness: z.number(),
  dataAccuracy: z.number(),
  trendChange: z.number(),
  freshnessChange: z.number(),
  completenessChange: z.number(),
  accuracyChange: z.number(),
});

export type InsertQualityMetric = z.infer<typeof insertQualityMetricsSchema>;

// Data Pipeline types
export interface DataPipeline {
  id: number;
  name: string;
  lastRun: Date;
  status: "running" | "completed" | "failed" | "warning";
  recordCount: number;
  healthScore: number;
}

export const insertDataPipelineSchema = z.object({
  name: z.string(),
  lastRun: z.date(),
  status: z.enum(["running", "completed", "failed", "warning"]),
  recordCount: z.number().int(),
  healthScore: z.number(),
});

export type InsertDataPipeline = z.infer<typeof insertDataPipelineSchema>;

// Data Issue types
export interface DataIssue {
  id: number;
  type: "missing_values" | "duplicates" | "format_issues" | "inconsistencies" | "other";
  count: number;
  color: string;
}

export const insertDataIssueSchema = z.object({
  type: z.enum(["missing_values", "duplicates", "format_issues", "inconsistencies", "other"]),
  count: z.number().int(),
  color: z.string(),
});

export type InsertDataIssue = z.infer<typeof insertDataIssueSchema>;

// Data Source types
export interface DataSource {
  id: number;
  name: string;
  qualityScore: number;
}

export const insertDataSourceSchema = z.object({
  name: z.string(),
  qualityScore: z.number(),
});

export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;

// Anomaly types
export interface Anomaly {
  id: number;
  title: string;
  description: string;
  timestamp: Date;
  severity: "critical" | "warning" | "info";
  isNew: boolean;
}

export const insertAnomalySchema = z.object({
  title: z.string(),
  description: z.string(),
  timestamp: z.date().default(() => new Date()),
  severity: z.enum(["critical", "warning", "info"]),
  isNew: z.boolean().default(true),
});

export type InsertAnomaly = z.infer<typeof insertAnomalySchema>;

// Quality Trend Data types
export interface QualityTrendDataPoint {
  id: number;
  month: string;
  overallQuality: number;
  completeness: number;
  accuracy: number;
}

export const insertQualityTrendDataSchema = z.object({
  month: z.string(),
  overallQuality: z.number(),
  completeness: z.number(),
  accuracy: z.number(),
});

export type InsertQualityTrendDataPoint = z.infer<typeof insertQualityTrendDataSchema>;

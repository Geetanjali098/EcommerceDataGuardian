// User types
export interface User {
  id: number;
  username: string;
  role: "admin" | "analyst";
  name: string;
  email: string;
  avatarUrl?: string;
}

// Quality Metrics types
export interface QualityMetric {
  id: number;
  date: string;
  overallScore: number;
  dataFreshness: number;
  dataCompleteness: number;
  dataAccuracy: number;
  trendChange: number;
  freshnessChange: number;
  completenessChange: number;
  accuracyChange: number;
}

// Data Pipeline types
export interface DataPipeline {
  id: number;
  name: string;
  lastRun: string;
  status: "running" | "completed" | "failed" | "warning";
  recordCount: number;
  healthScore: number;
}

// Data Issue types
export interface DataIssue {
  id: number;
  type: "missing_values" | "duplicates" | "format_issues" | "inconsistencies" | "other";
  count: number;
  color: string;
}

// Data Source types
export interface DataSource {
  id: number;
  name: string;
  qualityScore: number;
}

// Anomaly types
export interface Anomaly {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  severity: "critical" | "warning" | "info";
  isNew: boolean;
}

// Quality Trend Data types
export interface QualityTrendDataPoint {
  id: number;
  month: string;
  overallQuality: number;
  completeness: number;
  accuracy: number;
}

// Theme type
export type Theme = "light" | "dark";

// Sidebar navigation item
export interface SidebarItem {
  name: string;
  href: string;
  icon: string;
}

// Sidebar navigation section
export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

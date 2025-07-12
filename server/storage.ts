import { 
  User, InsertUser,
  QualityMetric, InsertQualityMetric,
  DataPipeline, InsertDataPipeline,
  DataIssue, InsertDataIssue,
  DataSource, InsertDataSource,
  Anomaly, InsertAnomaly,
  QualityTrendDataPoint, InsertQualityTrendDataPoint
} from "@shared/schema";


export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quality Metrics methods
  getLatestQualityMetrics(): Promise<QualityMetric | undefined>;
  createQualityMetrics(metrics: InsertQualityMetric): Promise<QualityMetric>;
  
  // Data Pipelines methods
  getAllDataPipelines(): Promise<DataPipeline[]>;
  createDataPipeline(pipeline: InsertDataPipeline): Promise<DataPipeline>;
  
  // Data Issues methods
  getAllDataIssues(): Promise<DataIssue[]>;
  createDataIssue(issue: InsertDataIssue): Promise<DataIssue>;
  
  // Data Sources methods
  getAllDataSources(): Promise<DataSource[]>;
  createDataSource(source: InsertDataSource): Promise<DataSource>;
  
  // Anomalies methods
  getAllAnomalies(): Promise<Anomaly[]>;
  getRecentAnomalies(limit: number): Promise<Anomaly[]>;
  createAnomaly(anomaly: InsertAnomaly): Promise<Anomaly>;
  
  // Quality Trend Data methods
  getAllQualityTrendData(): Promise<QualityTrendDataPoint[]>;
  createQualityTrendDataPoint(dataPoint: InsertQualityTrendDataPoint): Promise<QualityTrendDataPoint>;
  
  // Initialize with seed data
  initializeWithSeedData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private qualityMetrics: Map<number, QualityMetric>;
  private dataPipelines: Map<number, DataPipeline>;
  private dataIssues: Map<number, DataIssue>;
  private dataSources: Map<number, DataSource>;
  private anomalies: Map<number, Anomaly>;
  private qualityTrendData: Map<number, QualityTrendDataPoint>;
  private refreshTokens: Map<number, string> = new Map(); // userId -> refreshToken

  
  private currentUserId: number;
  private currentQualityMetricsId: number;
  private currentDataPipelineId: number;
  private currentDataIssueId: number;
  private currentDataSourceId: number;
  private currentAnomalyId: number;
  private currentQualityTrendDataId: number;

  // Add currentUser property to track authenticated user
  private currentUser: User | null = null;
   private initialized: boolean = false;

  constructor() {
    this.users = new Map();
    this.qualityMetrics = new Map();
    this.dataPipelines = new Map();
    this.dataIssues = new Map();
    this.dataSources = new Map();
    this.anomalies = new Map();
    this.qualityTrendData = new Map();
    
    this.currentUserId = 1;
    this.currentQualityMetricsId = 1;
    this.currentDataPipelineId = 1;
    this.currentDataIssueId = 1;
    this.currentDataSourceId = 1;
    this.currentAnomalyId = 1;
    this.currentQualityTrendDataId = 1;

  
  }

  // Save refresh token for a user
public async saveRefreshToken(userId: number, token: string): Promise<void> {
  this.refreshTokens.set(userId, token);
}

// Get user by refresh token
public async getUserByRefreshToken(token: string): Promise<User | undefined> {
  for (const [userId, storedToken] of Array.from(this.refreshTokens.entries())) {
    if (storedToken === token) {
      return this.getUser(userId);
    }
  }
  return undefined;
}


   // Add public method to get all users
  public async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Make currentUser accessible via method
  public async getCurrentUserId(): Promise<number | null> {
    return this.currentUser?.id ?? null;
  }
  public async getCurrentUserRole(): Promise<string | null> {
    return this.currentUser?.role ?? null;
  }

  // Add methods to manage current user
  async setCurrentUser(user: User | null): Promise<void> {
    this.currentUser= user;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  // Modify login-related methods to use currentUser
  async login(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password) { // Note: In production, use bcrypt to compare hashed passwords
      await this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  async logout(): Promise<void> {
    await this.setCurrentUser(null);
  }



  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Quality Metrics methods
  async getLatestQualityMetrics(): Promise<QualityMetric | undefined> {
    const metrics = Array.from(this.qualityMetrics.values());
    if (metrics.length === 0) return undefined;
    
    // Sort by date descending and return the most recent
    return metrics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }
  
  async createQualityMetrics(insertMetrics: InsertQualityMetric): Promise<QualityMetric> {
    const id = this.currentQualityMetricsId++;
    const metrics: QualityMetric = { ...insertMetrics, id };
    this.qualityMetrics.set(id, metrics);
    return metrics;
  }
  
  // Data Pipelines methods
  async getAllDataPipelines(): Promise<DataPipeline[]> {
    return Array.from(this.dataPipelines.values());
  }
  
  async createDataPipeline(insertPipeline: InsertDataPipeline): Promise<DataPipeline> {
    const id = this.currentDataPipelineId++;
    const pipeline: DataPipeline = { ...insertPipeline, id };
    this.dataPipelines.set(id, pipeline);
    return pipeline;
  }
  
  // Data Issues methods
  async getAllDataIssues(): Promise<DataIssue[]> {
    return Array.from(this.dataIssues.values());
  }
  
  async createDataIssue(insertIssue: InsertDataIssue): Promise<DataIssue> {
    const id = this.currentDataIssueId++;
    const issue: DataIssue = { ...insertIssue, id };
    this.dataIssues.set(id, issue);
    return issue;
  }
  
  // Data Sources methods
  async getAllDataSources(): Promise<DataSource[]> {
    return Array.from(this.dataSources.values());
  }
  
  async createDataSource(insertSource: InsertDataSource): Promise<DataSource> {
    const id = this.currentDataSourceId++;
    const source: DataSource = { ...insertSource, id };
    this.dataSources.set(id, source);
    return source;
  }
  
  // Anomalies methods
  async getAllAnomalies(): Promise<Anomaly[]> {
    return Array.from(this.anomalies.values());
  }
  
  async getRecentAnomalies(limit: number): Promise<Anomaly[]> {
    const allAnomalies = Array.from(this.anomalies.values());
    // Sort by timestamp descending
    return allAnomalies
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  async createAnomaly(insertAnomaly: InsertAnomaly): Promise<Anomaly> {
    const id = this.currentAnomalyId++;
    const anomaly: Anomaly = { ...insertAnomaly, id };
    this.anomalies.set(id, anomaly);
    return anomaly;
  }
  
  // Quality Trend Data methods
  async getAllQualityTrendData(): Promise<QualityTrendDataPoint[]> {
    const allData = Array.from(this.qualityTrendData.values());
    // Map months to numbers for proper sorting
    const monthMap: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    // Sort by month
    return allData.sort((a, b) => monthMap[a.month] - monthMap[b.month]);
  }
  
  async createQualityTrendDataPoint(insertDataPoint: InsertQualityTrendDataPoint): Promise<QualityTrendDataPoint> {
    const id = this.currentQualityTrendDataId++;
    const dataPoint: QualityTrendDataPoint = { ...insertDataPoint, id };
    this.qualityTrendData.set(id, dataPoint);
    return dataPoint;
  }
  
  // Initialize with seed data
  async initializeWithSeedData() {
    if (this.initialized) return;

     console.log("Initializing storage with seed data...");

    // Add users
   const seedUser =[
    {
      username: "geetanjali",
      password: "Admin@123", // In a real app, this would be hashed
      role: "admin",
      name: "Geetanjali Nishad",
      email: "nishadgeetanjali84@gmail.com",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
 {
      username: "gitu",
      password: "Gitu@Data123", // In a real app, this would be hashed
      role: "analyst",
      name: "Gitu Nishad",
      email: "gitunishad38@gmail.com",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
  ] as const;
 
  // Use the correct variable name here:
for (const user of seedUser) {
  const existingUser = await this.getUserByUsername(user.username);
  if (!existingUser) {
    console.log(`Creating seed user: ${user.username}`);
    await this.createUser(user);
  } else {
    console.log(`Seed user already exists: ${user.username}`);
  }
}

    console.log("✅ Storage initialization complete");
    this.initialized = true;
  }
}
export const saveRefreshToken = (userId: number, token: string) => storage.saveRefreshToken(userId, token);
export const getUserByRefreshToken = (token: string) => storage.getUserByRefreshToken(token);
export const storage = new MemStorage();

   
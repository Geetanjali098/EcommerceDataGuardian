import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import jwt from 'jsonwebtoken';

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export interface AuthenticatedRequest extends Request {
  user?:{
    id: number;
    username: string;
    role: string;
  };
}

// Middleware to check if user is authenticated
export const isAuthenticated = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "id" in decoded &&
      "username" in decoded &&
      "role" in decoded
    ) {
      req.user = {
        id: (decoded as any).id,
        username: (decoded as any).username,
        role: (decoded as any).role,
      };
      next();
    } else {
      return res.status(401).json({ message: "Invalid token payload" });
    }
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }

    

  // Check if userId is stored in session
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "User not found" });
    }

    // Add user to the request object
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware to check if user has admin role
export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  next();
};

// Middleware to check if user has at least analyst role
export const isAnalyst = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "admin" && req.user.role !== "analyst") {
    return res.status(403).json({ message: "Forbidden: Analyst access required" });
  }

  next();
};

export function isJwtAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];
  try {
     const secret = process.env.JWT_SECRET || '52f312bc46471fc4d501654e5b3757ee97899f05df067fbb1dd8eb77f977d1465cead8140bfadc58cce1256b77ae0ea08ab63a63d109a8a80b425f76ffeb38d8';
     const decoded = jwt.verify(token, secret);
    (req as AuthenticatedRequest).user = decoded as AuthenticatedRequest["user"]; // Attach user to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

// ✅ JWT authentication middleware
export const isAuthenticated = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const secret =
      process.env.JWT_SECRET ||
      "52f312bc46471fc4d501654e5b3757ee97899f05df067fbb1dd8eb77f977d1465cead8140bfadc58cce1256b77ae0ea08ab63a63d109a8a80b425f76ffeb38d8";

    const decoded = jwt.verify(token, secret) as AuthenticatedRequest["user"];

    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ✅ Admin-only route protection
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

// ✅ Analyst or Admin role access
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

// ✅ Optional: Minimal JWT check (lighter than full user fetch)
export const isJwtAuthenticated = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const secret =
      process.env.JWT_SECRET ||
      "52f312bc46471fc4d501654e5b3757ee97899f05df067fbb1dd8eb77f977d1465cead8140bfadc58cce1256b77ae0ea08ab63a63d109a8a80b425f76ffeb38d8";

    const decoded = jwt.verify(token, secret) as AuthenticatedRequest["user"];
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};



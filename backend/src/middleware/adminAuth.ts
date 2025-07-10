import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const adminAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      throw new Error();
    }
    next();
  } catch (error) {
    res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
  }
};

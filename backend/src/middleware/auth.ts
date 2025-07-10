import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Auth Headers:", req.headers);
    const authHeader = req.header("Authorization");
    console.log("Auth Header:", authHeader);

    if (!authHeader) {
      console.log("No Authorization header found");
      throw new Error("No Authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Extracted Token:", token);

    if (!token) {
      console.log("No token found in Authorization header");
      throw new Error("No token found");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { _id: string };
    console.log("Decoded token:", decoded);

    const user = await User.findOne({ _id: decoded._id });
    console.log("Found user:", user ? "Yes" : "No");

    if (!user) {
      console.log("No user found for decoded token");
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Lütfen giriş yapın" });
  }
};

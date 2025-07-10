import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: {
    role: string;
  };
}

const checkRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
      return;
    }
    next();
  };
};

export default checkRole;

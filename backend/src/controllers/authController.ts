import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

// Generate JWT
const generateToken = (_id: string): string => {
  return jwt.sign({ _id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const user = (await User.create({ name, email, password, role })) as IUser;
    const token = generateToken(user._id.toString());
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = (await User.findOne({ email })) as IUser | null;
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: "Geçersiz email veya şifre" });
      return;
    }
    const token = generateToken(user._id.toString());
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};

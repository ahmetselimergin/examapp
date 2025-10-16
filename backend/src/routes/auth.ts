import express from "express";
import { register, login, getProfile } from "../controllers/authController";
import { auth } from "../middleware/auth";
import checkRole from "../middleware/roleAuth";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", auth, getProfile);

// Change password endpoint
router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user?._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current password and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters long" 
      });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password and update
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to change password",
    });
  }
});

// Admin only routes
router.get("/admin/users", auth, checkRole("admin"), async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
});

// Create new user (admin only)
router.post("/admin/users", auth, checkRole("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Bu e-posta adresi zaten kullanımda" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    // Return user without password
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
});

// Kullanıcı silme (sadece admin)
router.delete(
  "/admin/users/:id",
  auth,
  checkRole("admin"),
  async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "Kullanıcı silindi" });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  }
);

// Kullanıcı düzenleme (sadece admin)
router.put("/admin/users/:id", auth, checkRole("admin"), async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const updateData: any = { name, email, role };

    // Only update password if it's provided
    if (password) {
      updateData.password = password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    res.json(user);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
});

// Get statistics
router.get("/stats", auth, async (req, res) => {
  try {
    const [students, teachers, exams] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "admin" }),
    ]);

    res.json({
      totalStudents: students,
      totalTeachers: teachers,
      totalAdmins: exams,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

export default router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const roleAuth_1 = __importDefault(require("../middleware/roleAuth"));
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = express_1.default.Router();
router.post("/register", authController_1.register);
router.post("/login", authController_1.login);
router.get("/profile", auth_1.auth, authController_1.getProfile);
// Change password endpoint
router.post("/change-password", auth_1.auth, async (req, res) => {
    var _a;
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
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
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Verify current password
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        // Hash new password and update
        const saltRounds = 10;
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
        await User_1.User.findByIdAndUpdate(userId, { password: hashedNewPassword });
        res.json({ message: "Password changed successfully" });
    }
    catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            message: error instanceof Error ? error.message : "Failed to change password",
        });
    }
});
// Admin only routes
router.get("/admin/users", auth_1.auth, (0, roleAuth_1.default)("admin"), async (req, res) => {
    try {
        const users = await User_1.User.find({}).select("-password");
        res.json(users);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
// Create new user (admin only)
router.post("/admin/users", auth_1.auth, (0, roleAuth_1.default)("admin"), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Check if user already exists
        const userExists = await User_1.User.findOne({ email });
        if (userExists) {
            return res
                .status(400)
                .json({ message: "Bu e-posta adresi zaten kullanımda" });
        }
        // Create user
        const user = await User_1.User.create({
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
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
// Kullanıcı silme (sadece admin)
router.delete("/admin/users/:id", auth_1.auth, (0, roleAuth_1.default)("admin"), async (req, res) => {
    try {
        await User_1.User.findByIdAndDelete(req.params.id);
        res.json({ message: "Kullanıcı silindi" });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
// Kullanıcı düzenleme (sadece admin)
router.put("/admin/users/:id", auth_1.auth, (0, roleAuth_1.default)("admin"), async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        const updateData = { name, email, role };
        // Only update password if it's provided
        if (password) {
            updateData.password = password;
        }
        const user = await User_1.User.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
        }).select("-password");
        res.json(user);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
// Get statistics
router.get("/stats", auth_1.auth, async (req, res) => {
    try {
        const [students, teachers, exams] = await Promise.all([
            User_1.User.countDocuments({ role: "student" }),
            User_1.User.countDocuments({ role: "teacher" }),
            User_1.User.countDocuments({ role: "admin" }),
        ]);
        res.json({
            totalStudents: students,
            totalTeachers: teachers,
            totalAdmins: exams,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Sunucu hatası" });
    }
});
exports.default = router;

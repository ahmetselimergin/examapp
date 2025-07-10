"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
// Generate JWT
const generateToken = (_id) => {
    return jsonwebtoken_1.default.sign({ _id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = (await User_1.User.create({ name, email, password, role }));
        const token = generateToken(user._id.toString());
        res.status(201).json({ user, token });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
};
exports.register = register;
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = (await User_1.User.findOne({ email }));
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ message: "Geçersiz email veya şifre" });
            return;
        }
        const token = generateToken(user._id.toString());
        res.json({ user, token });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
};
exports.login = login;
// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
    var _a;
    try {
        const user = await User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select("-password");
        res.json(user);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
};
exports.getProfile = getProfile;
module.exports = {
    register: exports.register,
    login: exports.login,
    getProfile: exports.getProfile,
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            throw new Error("No Authorization header");
        }
        const token = authHeader.replace("Bearer ", "");
        if (!token) {
            throw new Error("No token found");
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
        const user = await User_1.User.findOne({ _id: decoded._id });
        if (!user) {
            throw new Error("User not found");
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ message: "Lütfen giriş yapın" });
    }
};
exports.auth = auth;

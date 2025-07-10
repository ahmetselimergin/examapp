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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
        console.log("Decoded token:", decoded);
        const user = await User_1.User.findOne({ _id: decoded._id });
        console.log("Found user:", user ? "Yes" : "No");
        if (!user) {
            console.log("No user found for decoded token");
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

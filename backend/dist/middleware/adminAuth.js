"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const adminAuth = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            throw new Error();
        }
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }
};
exports.adminAuth = adminAuth;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkRole = (...roles) => {
    return (req, res, next) => {
        var _a;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || !roles.includes(req.user.role)) {
            res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
            return;
        }
        next();
    };
};
exports.default = checkRole;

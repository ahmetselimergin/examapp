"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = void 0;
const User_1 = require("../models/User");
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.User.find();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Kullanıcılar getirilirken hata oluştu" });
    }
};
exports.getAllUsers = getAllUsers;

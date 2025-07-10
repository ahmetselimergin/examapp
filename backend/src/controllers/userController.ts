import { User } from "../models/User";
import { Request, Response } from "express";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Kullanıcılar getirilirken hata oluştu" });
  }
};

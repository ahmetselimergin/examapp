import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import examRoutes from "./routes/exam";
import authRoutes from "./routes/auth";
import questionRoutes from "./routes/question";
import userRoutes from "./routes/userRoutes";
import teacherRoutes from "./routes/teacherRoutes";
import backupRoutes from "./routes/backup";
import dashboardRoutes from "./routes/dashboard";
import connectDB from "./config/db";

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB().catch((error) => {
  console.error("Database connection error:", error);
  process.exit(1);
});

// Test route
app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

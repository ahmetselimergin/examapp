"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const exam_1 = __importDefault(require("./routes/exam"));
const auth_1 = __importDefault(require("./routes/auth"));
const question_1 = __importDefault(require("./routes/question"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const db_1 = __importDefault(require("./config/db"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connect to database
(0, db_1.default)().catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
});
// Test route
app.get("/", (req, res) => {
    res.json({ message: "API is working!" });
});
// API Routes
app.use("/api/auth", auth_1.default);
app.use("/api/exams", exam_1.default);
app.use("/api/questions", question_1.default);
app.use("/api/users", userRoutes_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;

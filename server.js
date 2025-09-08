import dotenv from "dotenv";
import express from "express";

import connectDB from "./src/config/database.js";
import configureExpress from "./src/config/express.js";

import authRoutes from "./src/routes/auth.js";
import careUnitRoutes from "./src/routes/careUnit.js";
import userRoutes from "./src/routes/user.js";
import roleRoutes from "./src/routes/role.js";

import { errorHandler } from "./src/middleware/errorHandler.js";
import { createDefaultAdmin } from "./src/utils/createDefaultAdmin.js";

dotenv.config();

const app = express();
configureExpress(app);

connectDB().then(() => {
  createDefaultAdmin();
});

app.use("/api/auth", authRoutes);
app.use("/api/care-units", careUnitRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

export default app;

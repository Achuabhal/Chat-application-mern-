import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import friendRoutes from "./routes/translate.route.js"; // Add this line
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

import reportRoutes from "./routes/report.route.js"; 
import userRoutes from "./routes/user.route.js"; 
import adminRoutes from "./routes/admin.route.js";
import groupMessageRoutes from "./routes/groupMessage.route.js";

import friendRequestRoutes from "./routes/friendRequest.route.js";
dotenv.config();

const PORT = process.env.PORT;
 
// Middleware
app.use(express.json({ limit: "50mb" })); // Increase JSON payload limit to handle large files
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Increase URL-encoded payload limit
app.use(cookieParser());

// Configure CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your frontend
    credentials: true, // Allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

// Preflight request handling
app.options("*", cors());

// Define API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api", friendRoutes); // Add this line

app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/group-messages", groupMessageRoutes);
app.use("/api/friends", friendRequestRoutes);
// Start the server
server.listen(PORT, () => {
  console.log("Server is running on PORT: " + PORT);
  connectDB();
});

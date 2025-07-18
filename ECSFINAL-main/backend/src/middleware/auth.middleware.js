import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Skip processing for preflight requests
    if (req.method === "OPTIONS") {
      return next();
    }

    // Retrieve token from cookies or authorization headers
    const token =
      req.cookies.jwt ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired. Please log in again." });
      }
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }



    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned." });
    }



    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware to check if a user is blocked
export const checkBlockedUser = async (req, res, next) => {
  try {
    // Support both body and params for receiverId
    const receiverId = req.body.receiverId || req.params.id;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required." });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if sender has blocked the receiver
    if (sender.blockedUsers.includes(receiverId)) {
      return res.status(403).json({ message: "You have blocked this user." });
    }

    // Check if receiver has blocked the sender
    if (receiver.blockedUsers.includes(senderId)) {
      return res.status(403).json({ message: "You are blocked by this user." });
    }

    next();
  } catch (error) {
    console.error("Error in checkBlockedUser middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};




export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
      next();
  } else {
      res.status(403).json({ message: "Access Denied: Admins only" });
  }
};

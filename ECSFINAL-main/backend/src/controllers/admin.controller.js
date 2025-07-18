// controllers/admin.controller.js
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import GroupMessage from "../models/groupMessage.model.js";
import DeletedUser from "../models/deletedUser.model.js";
// Controller to fetch all users (with optional search filtering)
export const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { course: { $regex: search, $options: "i" } },
          { semester: { $regex: search, $options: "i" } },
        ],
      };
    }
    const users = await User.find(filter).select("-password");
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Controller to ban a user irreversibly
export const banUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Irreversibly ban the user
    user.isBanned = true;
    await user.save();

    // If the user is online, get their socket ID and disconnect them.
    const socketId = getReceiverSocketId(userId);
    if (socketId) {
      // Inform the client about the ban
      io.to(socketId).emit("banned", { message: "You have been banned from the app." });
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
      }
    }

    return res.json({ message: "User banned successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const clearGroupMessages = async (req, res) => {
  try {
    await GroupMessage.deleteMany({});
    res.json({ message: "All group messages deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear group chat." });
  }
};

export const getDeletedUsers = async (req, res) => {
  try {
    const deletedUsers = await DeletedUser.find().sort({ deletedAt: -1 });
    res.json(deletedUsers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch deleted users" });
  }
};

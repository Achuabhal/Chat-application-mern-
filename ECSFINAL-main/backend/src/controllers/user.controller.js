import User from "../models/user.model.js";
import DeletedUser from "../models/deletedUser.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUser = await User.findById(req.user._id);

    if (!loggedInUser) return res.status(404).json({ message: "User not found" });

    if (!loggedInUser.blockedUsers.includes(userId)) {
      loggedInUser.blockedUsers.push(userId);
      await loggedInUser.save();
    }
    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUser = await User.findById(req.user._id);

    if (!loggedInUser) return res.status(404).json({ message: "User not found" });

    // [CHANGE] Update blockedUsers list after unblocking userId
    loggedInUser.blockedUsers = loggedInUser.blockedUsers.filter((id) => id.toString() !== userId);
    await loggedInUser.save();

    // After updating and saving the user's blockedUsers list:
const receiverSocketId = getReceiverSocketId(userId);
if (receiverSocketId) {
  // [CHANGE] Emit a userUnblocked event to notify the unblocked user
  io.to(receiverSocketId).emit("userUnblocked", { userId: loggedInUser._id });
}


    res.status(200).json({ 
      message: "User unblocked successfully", 
      blockedUsers: loggedInUser.blockedUsers 
    });
  } catch (error) {
    console.error("Error in unblockUser:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Store user details in DeletedUser collection
    await DeletedUser.create({
      fullName: user.fullName,
      email: user.email,
      collegeName: user.collegeName,
      course: user.course,
      semester: user.semester,
      createdAt: user.createdAt,
      deletionReason: reason,
    });

    // Remove user from User collection
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

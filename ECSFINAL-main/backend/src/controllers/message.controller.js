import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js"; // CHANGED: Using ES module import

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const loggedInUser = await User.findById(loggedInUserId);

    if (!loggedInUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
      course: loggedInUser.course,
      semester: loggedInUser.semester,
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Fetch both users and ensure `blockedUsers` is populated
    const loggedInUser = await User.findById(myId).populate("blockedUsers");
    const chatUser = await User.findById(userToChatId).populate("blockedUsers");

    if (!loggedInUser || !chatUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Check if either user has blocked the other
    if (loggedInUser.blockedUsers.includes(userToChatId) || chatUser.blockedUsers.includes(myId)) {
      return res.status(403).json({ error: "Cannot fetch messages. User is blocked." });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, file, fileName } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Prevent User A from sending messages if they blocked User B
    if (sender.blockedUsers.includes(receiverId)) {
      return res.status(403).json({ error: "You have blocked this user." });
    }

    // ✅ Prevent User B from receiving messages if they blocked User A
    if (receiver.blockedUsers.includes(senderId)) {
      return res.status(403).json({ error: "You are blocked by this user." });
    }

    let imageUrl, fileUrl;

    if (image) {
      const imageUploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = imageUploadResponse.secure_url;
    }

    if (file) {
      const fileUploadResponse = await cloudinary.uploader.upload(file, {
        resource_type: "raw",
        public_id: fileName.split(".").slice(0, -1).join("."), // Preserve original filename without extension
        format: fileName.split(".").pop(), // Ensure correct file format
      });
      fileUrl = fileUploadResponse.secure_url;
    }
    

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      file: fileUrl,
      fileName,
    });

   

    await newMessage.save();

    // ✅ Emit message only if the receiver has NOT blocked the sender
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId && !receiver.blockedUsers.includes(senderId)) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Delete one-to-one message (hard delete)
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });
    // Only the sender can delete the message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You can only delete your own message" });
    }
    await Message.findByIdAndDelete(id);

    // CHANGED: Removed require() and use already imported getReceiverSocketId and io
    const receiverId = message.receiverId;
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId: id });
    }
    res.status(200).json({ message: "Message deleted successfully", messageId: id });
  } catch (error) {
    console.error("Error in deleteMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

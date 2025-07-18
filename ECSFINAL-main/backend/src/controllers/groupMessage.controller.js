import GroupMessage from "../models/groupMessage.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";

// Get group messages filtered by the user's course and semester
export const getGroupMessages = async (req, res) => {
  try {
    const { course, semester } = req.user; // from protectRoute
    const messages = await GroupMessage.find({ course, semester })
      .populate("senderId", "fullName profilePic");
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching group messages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a new group message
export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image, file, fileName } = req.body;
    const { course, semester } = req.user; // filtering info comes from the authenticated user

    let imageUrl = "";
    let fileUrl = "";

    if (image) {
      const imageUploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = imageUploadResponse.secure_url;
    }
    if (file) {
      const fileUploadResponse = await cloudinary.uploader.upload(file, {
        resource_type: "raw",
        public_id: fileName, // Store with full original filename
        use_filename: true, // Ensure Cloudinary respects the filename
        unique_filename: false, // Prevent Cloudinary from renaming
      });
      fileUrl = fileUploadResponse.secure_url;
    }
    
    

    const newMessage = new GroupMessage({
      senderId: req.user._id,
      course,
      semester,
      text,
      image: imageUrl,
      file: fileUrl,
      fileName,
    });

    await newMessage.save();
    await newMessage.populate("senderId", "fullName profilePic");
    // Emit to the room corresponding to this course and semester


    const roomName = `${course}-${semester}`;
    
    // ✅ Log the emitted message (for debugging)
    console.log(`📢 Emitting message to room: ${roomName}`, newMessage);


    io.to(`${course}-${semester}`).emit("newGroupMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending group message:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const deleteGroupMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const message = await GroupMessage.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });
    // Only the sender can delete the message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You can only delete your own message" });
    }
    await GroupMessage.findByIdAndDelete(id);

    // Emit socket event to notify all room participants (using course and semester)
    const roomName = `${message.course}-${message.semester}`;
    io.to(roomName).emit("messageDeleted", { messageId: id });
    res.status(200).json({ message: "Group message deleted successfully", messageId: id });
  } catch (error) {
    console.error("Error in deleteGroupMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

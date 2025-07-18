// friendRequest.controller.js
import FriendRequest from "../models/friendRequest.model.js";
import User from "../models/user.model.js";

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "Cannot send friend request to yourself." });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    // Check if a request or friendship already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
      status: { $in: ["pending", "accepted"] },
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists or you are already friends." });
    }

    const friendRequest = new FriendRequest({ sender: senderId, receiver: receiverId });
    await friendRequest.save();
    res.status(201).json({ message: "Friend request sent.", friendRequest });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get incoming friend requests (for the logged-in user)
export const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await FriendRequest.find({ receiver: userId, status: "pending" })
      .populate("sender", "fullName email profilePic course semester");
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getIncomingRequests:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get sent friend requests (pending)
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await FriendRequest.find({ sender: userId, status: "pending" })
      .populate("receiver", "fullName email profilePic course semester");
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getSentRequests:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user._id;
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found." });
    }
    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to accept this request." });
    }
    friendRequest.status = "accepted";
    await friendRequest.save();
    res.status(200).json({ message: "Friend request accepted.", friendRequest });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Reject a friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user._id;
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found." });
    }
    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to reject this request." });
    }
    friendRequest.status = "rejected";
    await friendRequest.save();
    res.status(200).json({ message: "Friend request rejected.", friendRequest });
  } catch (error) {
    console.error("Error in rejectFriendRequest:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get accepted friends (contacts) for the logged-in user, filtered by course and semester
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const { course: currentCourse, semester: currentSemester } = req.user;

    const requests = await FriendRequest.find({
      status: "accepted",
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "fullName email profilePic course semester")
      .populate("receiver", "fullName email profilePic course semester");

    // Identify the friend (the other user) in each accepted relationship
    const friends = requests.map((friendReq) =>
      friendReq.sender._id.toString() === userId.toString() ? friendReq.receiver : friendReq.sender
    );

    // Filter friends to include only those with matching course and semester
    const filteredFriends = friends.filter(
      friend => friend.course === currentCourse && friend.semester === currentSemester
    );

    res.status(200).json(filteredFriends);
  } catch (error) {
    console.error("Error in getFriends:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

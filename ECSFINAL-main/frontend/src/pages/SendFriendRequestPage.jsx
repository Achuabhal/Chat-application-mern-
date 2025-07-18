// SendFriendRequestPage.jsx
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const SendFriendRequestPage = () => {
  const { authUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch users based on course and semester
        const res = await axiosInstance.get("/messages/users");
        setUsers(res.data);
      } catch (error) {
        toast.error("Failed to fetch users");
      }
    };

    const fetchPendingRequests = async () => {
      try {
        const sentRes = await axiosInstance.get("/friends/sent");
        const incomingRes = await axiosInstance.get("/friends/incoming");
        setPendingRequests([...sentRes.data, ...incomingRes.data]);
      } catch (error) {
        console.error("Error fetching friend requests", error);
      }
    };

    const fetchFriends = async () => {
      try {
        const res = await axiosInstance.get("/friends/friends");
        setFriends(res.data);
      } catch (error) {
        console.error("Error fetching friends", error);
      }
    };

    fetchUsers();
    fetchPendingRequests();
    fetchFriends();
  }, []);

  // Exclude logged-in user and those already in pending/friends lists.
  const filteredUsers = users.filter((user) => {
    if (user._id === authUser._id) return false;
    const isPending = pendingRequests.some(
      (req) =>
        (req.sender && req.sender._id === user._id) ||
        (req.receiver && req.receiver._id === user._id)
    );
    const isFriend = friends.some((friend) => friend._id === user._id);
    return !isPending && !isFriend;
  });

  const handleSendRequest = async (receiverId) => {
    try {
      await axiosInstance.post("/friends/request", { receiverId });
      toast.success("Friend request sent");
      setPendingRequests((prev) => [...prev, { receiver: { _id: receiverId } }]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Send Friend Request</h1>
      {filteredUsers.length === 0 ? (
        <p>No users available for friend request.</p>
      ) : (
        <ul className="space-y-2">
          {filteredUsers.map((user) => (
            <li key={user._id} className="flex items-center justify-between border p-2 rounded">
              <div className="flex items-center gap-2">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  
                </div>
              </div>
              <button onClick={() => handleSendRequest(user._id)} className="btn btn-primary btn-sm">
                Send Request
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SendFriendRequestPage;

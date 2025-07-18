// FriendRequestsPage.jsx
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const FriendRequestsPage = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);

  const fetchIncomingRequests = async () => {
    try {
      const res = await axiosInstance.get("/friends/incoming");
      setIncomingRequests(res.data);
    } catch (error) {
      toast.error("Failed to fetch friend requests");
    }
  };

  useEffect(() => {
    fetchIncomingRequests();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      await axiosInstance.put(`/friends/accept/${requestId}`);
      toast.success("Friend request accepted");
      setIncomingRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error) {
      toast.error("Failed to accept friend request");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axiosInstance.put(`/friends/reject/${requestId}`);
      toast.success("Friend request rejected");
      setIncomingRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error) {
      toast.error("Failed to reject friend request");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Incoming Friend Requests</h1>
      {incomingRequests.length === 0 ? (
        <p>No incoming friend requests.</p>
      ) : (
        <ul className="space-y-2">
          {incomingRequests.map((req) => (
            <li key={req._id} className="flex items-center justify-between border p-2 rounded">
              <div className="flex items-center gap-2">
                <img
                  src={req.sender.profilePic || "/avatar.png"}
                  alt={req.sender.fullName}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{req.sender.fullName}</p>
                  <p className="text-sm text-gray-500">{req.sender.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAccept(req._id)} className="btn btn-success btn-sm">
                  Accept
                </button>
                <button onClick={() => handleReject(req._id)} className="btn btn-error btn-sm">
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendRequestsPage;

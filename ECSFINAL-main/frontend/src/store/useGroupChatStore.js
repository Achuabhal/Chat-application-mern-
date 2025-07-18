import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";

export const useGroupChatStore = create((set, get) => ({
  groupMessages: [],
  isLoading: false,
  socket: null,

  // Fetch group messages for the current user's course and semester
  getGroupMessages: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/group-messages");
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load group messages."
      );
    } finally {
      set({ isLoading: false });
    }
  },

  // Send a new group message via the API
  sendGroupMessage: async (messageData) => {
    try {
      await axiosInstance.post("/group-messages/send", messageData);
      // ✅ We no longer manually update the state here. We rely on the socket event instead.
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send group message."
      );
    }
  },

  // ✅ Subscribe to group chat messages in real-time
  subscribeToGroupMessages: () => {
    const { authUser } = useAuthStore.getState();
    if (!authUser || !authUser.course || !authUser.semester) {
        console.warn("⚠️ Cannot subscribe to group messages: Missing user data", authUser);
        return;
    }
    if (get().socket) return;

    console.log("🔗 Subscribing to group messages for:", authUser.course, authUser.semester);

    const socket = io("http://localhost:5001", {
        query: { course: authUser.course, semester: authUser.semester },
    });

    set({ socket });

    socket.on("connect", () => {
        console.log("✅ Group chat socket connected:", socket.id);
    });

    socket.on("newGroupMessage", (newMessage) => {
        console.log("📩 New group message received:", newMessage);
        const currentMessages = get().groupMessages;
        const exists = currentMessages.some(
            (m) => m._id.toString() === newMessage._id.toString()
        );
        if (!exists) {
            set({ groupMessages: [...currentMessages, newMessage] });
        } else {
            console.log("⚠️ Duplicate message ignored:", newMessage._id);
        }
    });
     // ADDED: Listen for deletion events
     socket.on("messageDeleted", ({ messageId }) => {
      set({ groupMessages: get().groupMessages.filter(m => m._id !== messageId) });
    });
},


  // ✅ Disconnect socket when the user logs out or leaves the chat
  unsubscribeFromGroupMessages: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },


  // ADDED: Function to delete group message
  deleteGroupMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/group-messages/${messageId}`);
      set({ groupMessages: get().groupMessages.filter(m => m._id !== messageId) });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete group message");
    }
  },
}));

import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js"; 
import toast from "react-hot-toast";
import {io} from "socket.io-client";
import { useChatStore } from "./useChatStore.js";

import { useGroupChatStore } from "./useGroupChatStore";

const BASE_URL="http://localhost:5001"

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,   
    isLoggingIn: false,
    isUpdatingProfile: false,
    isUpdatingSemester:false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket:null,

    checkAuth: async () => {  
      try {
          const res = await axiosInstance.get("/auth/check", { withCredentials: true });
  
          if (res.data) {
              set({ authUser: res.data }); // ✅ Ensure isAdmin is stored correctly
              get().connectSocket();
          }
      } catch (error) {
          set({ authUser: null });
      } finally {
          set({ isCheckingAuth: false });
      }
  },


  

  


      blockUser: async (userId) => {
        try {
          await axiosInstance.put(`/users/block/${userId}`);
          set((state) => ({
            authUser: {
              ...state.authUser,
              blockedUsers: [...state.authUser.blockedUsers, userId],
            },
          }));
          toast.success("User blocked successfully.");
        } catch (error) {
          toast.error("Failed to block user.");
        }
      },
      unblockUser: async (userId) => {
        try {
          const res = await axiosInstance.put(`/users/unblock/${userId}`);
          console.log("✅ Unblock API response:", res.data);
      
          set((state) => ({
            authUser: {
              ...state.authUser,
              blockedUsers: res.data.blockedUsers || [],
            },
          }));
          // [CHANGE] Listen for the "userUnblocked" event from the server
socket.on("userUnblocked", (data) => {
  console.log("Received userUnblocked event:", data);
  // Force a reconnect so that any stale socket logic is refreshed.
  get().disconnectSocket();
  setTimeout(() => get().connectSocket(), 500);
});

      
          toast.success("User unblocked successfully.");
      
          // Re-check authentication state after unblocking
          await get().checkAuth();
        } catch (error) {
          console.error("Unblock API error:", error.response?.data?.message || error.message);
          toast.success("User unblocked successfully..");
         // toast.error(error.response?.data?.message || "Failed to unblock user.");
        }
      },
      
      
       
      
      




      signup: async (data)=> {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post("/auth/signup", data);
          set({ authUser: res.data });
          toast.success("Account created successfully");
          get().connectSocket();
          
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isSigningUp: false });
        }
      },
      login: async (data, navigate) => { 
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            
            if (!res.data || typeof res.data.isAdmin === "undefined") {
                throw new Error("Login response missing isAdmin field");
            }
    
            set({ authUser: res.data });
    
            toast.success("Logged in successfully");
    
            get().connectSocket();
    
            console.log("💡 Login response:", res.data); 
            console.log("💡 Navigating to:", res.data.isAdmin ? "/admin" : "/");
    
            // ✅ Force navigation after state update
            setTimeout(() => {
                navigate(res.data.isAdmin ? "/admin" : "/");
            }, 100);
            
        } catch (error) {
            console.error("Login error:", error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },
    
    
    
      

      updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/auth/update-profile", data);
          set({ authUser: res.data });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.log("error in update profile:", error);
          toast.error(error.response.data.message);
        } finally {
          set({ isUpdatingProfile: false });
        }
      },

      updateSemester: async (data) => {
        set({ isUpdatingSemester: true });
        try {
          const res = await axiosInstance.put("/auth/update-semester", data);
          set({ authUser: res.data });
          toast.success("Semester updated successfully");
        } catch (error) {
          console.log("error in update semester:", error);
          toast.error(error.response.data.message);
        } finally {
          set({ isUpdatingSemester: false });
        }
      },
      
      
      
      
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  connectSocket: () => {
    const { authUser } = get();
  
    if (!authUser || !authUser.course || !authUser.semester) {
      console.warn("⚠️ Skipping socket connection: Missing user data", authUser);
      return;
    }
    
    // Disconnect existing socket if present to avoid duplicate connections
    if (get().socket) {
      get().disconnectSocket();
    }
  
    console.log(
      "🔗 Connecting socket for user:",
      authUser._id,
      "Course:",
      authUser.course,
      "Semester:",
      authUser.semester
    );
  
    // Initialize socket with complete query data
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
        course: authUser.course,
        semester: authUser.semester,
      },
    });
  
    set({ socket });
  
    socket.on("connect", () => {
      console.log("✅ Socket connected with ID:", socket.id);
      // Subscribe to group messages as soon as the socket is connected
      useGroupChatStore.getState().subscribeToGroupMessages();
    });
  
    // Listen for online users updates from the server
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  
    // Listen for ban notifications from the server
    socket.on("banned", (data) => {
      toast.error(data.message || "You have been banned from the app.");
      get().logout();
    });
  },
  

  disconnectSocket:()=>{
    if(get().socket?.connected)get().socket.disconnect();
  },


  reportUser: async (reportedMessage, reason, description) => {
    try {
      await axiosInstance.post("/reports", { reportedMessage, reason, description });
      toast.success("Report submitted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit report.");
    }
  },
  




  deleteAccount: async (reason) => {
    try {
      await axiosInstance.delete("/users/delete-account", { data: { reason } });
      set({ authUser: null }); // ✅ Ensure user is logged out after deletion
      toast.success("Account deleted successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account.");
    }
},

    }));
    //D:\chat\frontend\src\store\useAuthStore.js
import Navbar from "./components/Navbar";
import { Routes,Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import  SelectedUserProfile from "./pages/SelectedUserProfile";
import AdminPage from "./pages/AdminPage";
import GroupChatPage from "./pages/GroupChatPage";
import FriendRequestsPage from "./pages/FriendRequestsPage";
import SendFriendRequestPage from "./pages/SendFriendRequestPage";
import ChatBot from "./pages/ChatBot";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import SnakeGame from "./pages/snake";
import { useNavigate } from "react-router-dom"; 

function App() {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  const navigate = useNavigate(); // ✅ Define navigate
  //console.log({onlineUsers});

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
   // console.log("💡 Current authUser in App.jsx:", authUser);
    
    // ✅ If the user is an admin, redirect them
    if (authUser?.isAdmin) {
     // console.log("🚀 Redirecting to /admin");
      navigate("/admin");
    }
  }, [authUser, navigate]); // ✅ Re-run when `authUser` changes
 
 // console.log({ authUser });
  //console.log("Current authUser:", authUser); // ✅ Debugging log
  if (isCheckingAuth && !authUser) return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin" />
    </div>
  );


  


  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/selecteduserprofile" element={authUser ? <SelectedUserProfile/> : <Navigate to="/login" />} />

        
        <Route path="/admin" element={authUser && authUser.isAdmin ? <AdminPage /> : <Navigate to="/" />} />

        <Route path="/group-chat" element={authUser ? <GroupChatPage /> :  <Navigate to="/login" />} />
        <Route path="/send" element={authUser ? <SendFriendRequestPage /> :  <Navigate to="/login" />} />
        <Route path="/accept" element={authUser ? <FriendRequestsPage /> :  <Navigate to="/login" />} />
        <Route path="/chatbot" element={authUser ? <ChatBot /> :  <Navigate to="/login" />} />
        <Route path="/snake" element={authUser ? <SnakeGame /> :  <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App
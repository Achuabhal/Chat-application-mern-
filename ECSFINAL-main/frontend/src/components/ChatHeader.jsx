import { X, MoreVertical } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { authUser, blockUser, unblockUser, onlineUsers } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  if (!selectedUser) return null; // Prevent rendering if no user is selected

  const isBlocked = authUser?.blockedUsers?.includes(selectedUser._id) || false;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="p-2.5 border-b border-base-300 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <Link to={"/selecteduserprofile"}>
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </Link>
        </div>

        {/* Three-dot menu and close button */}
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <MoreVertical />
          </button>
          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>

        {/* Dropdown menu (without report option) */}
        {menuOpen && (
          <div ref={menuRef} className="absolute top-12 right-2 bg-white shadow-md rounded p-2 z-50">
            {isBlocked ? (
              <button
                onClick={() => {
                  unblockUser(selectedUser._id);
                  setMenuOpen(false);
                }}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Unblock User
              </button>
            ) : (
              <button
                onClick={() => {
                  blockUser(selectedUser._id);
                  setMenuOpen(false);
                }}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Block User
              </button>
            )}
            <button
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 hover:bg-gray-100"
            >
              Close Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;

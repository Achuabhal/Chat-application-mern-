import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, Users,Handshake,Cpu,Gamepad } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  
  const isAdminPage = location.pathname === "/admin";

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
      backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {!isAdminPage && (
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-lg font-bold">EC-STUDY</h1>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isAdminPage && (
              <>
              {authUser && (
                <Link to="/accept" className="btn btn-sm gap-2 transition-colors">
                  <Handshake className="w-4 h-4" />
                  <span className="hidden sm:inline">Friend Requests</span>
                </Link>
                )}
              {authUser && (
                <Link to="/send" className="btn btn-sm gap-2 transition-colors">
                  <Handshake className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Friends</span>
                </Link>
                )}
                {/* Group Chat link appears first */}
                {authUser && (
                <Link to="/group-chat" className="btn btn-sm gap-2 transition-colors">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Group Chat</span>
                </Link>
                )}

                {authUser && (
                  <Link to="/chatbot" className="btn btn-sm gap-2">
                    <Cpu className="size-5" />
                    <span className="hidden sm:inline">ChatBot</span>
                  </Link>
                )}


                { authUser && (
                  <Link to="/snake" className="btn btn-sm gap-2">
                    <Gamepad className="size-5" />
                    <span className="hidden sm:inline">Game</span>
                  </Link>
                )}


                {/* Settings link comes after Group Chat */}
                {authUser && (
                <Link to="/settings" className="btn btn-sm gap-2 transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
                )}
                {authUser && (
                  <Link to="/profile" className="btn btn-sm gap-2">
                    <User className="size-5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                )}
              </>
            )}

            {authUser && (
              <button className="flex gap-2 items-center" onClick={logout}>
                <LogOut className="size-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
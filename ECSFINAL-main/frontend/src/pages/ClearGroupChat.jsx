import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

const ClearGroupChat = () => {
  const [loading, setLoading] = useState(false);

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to delete all group messages?")) return;

    setLoading(true);
    try {
      const response = await axiosInstance.delete("/admin/clear-group-messages");
      toast.success(response.data.message || "All group messages deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clear group chat.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Clear Group Chat</h2>
      <button 
        onClick={handleClearChat} 
        disabled={loading} 
        className="bg-red-500 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Clearing..." : "Clear All Group Messages"}
      </button>
    </div>
  );
};

export default ClearGroupChat;

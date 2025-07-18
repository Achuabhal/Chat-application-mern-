import React, { useEffect, useRef, useState } from "react"; // ADDED: useState import
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { Languages } from "lucide-react";
import axiosInstance from "../lib/axios";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
  } = useChatStore();
  const { authUser, reportUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Translation and image fullscreen state
  const [translations, setTranslations] = useState({}); // key: message id, value: translated text
  const [loadingTranslations, setLoadingTranslations] = useState({}); // key: message id, value: boolean
  const [selectedImage, setSelectedImage] = useState(null);
  const openImageFullscreen = (imageUrl) => setSelectedImage(imageUrl);
  const closeImageFullscreen = () => setSelectedImage(null);

  // Dropdown state for message options
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // States for reporting a message
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetMessage, setReportTargetMessage] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Translation function
  const handleTranslate = async (messageId, text) => {
    if (loadingTranslations[messageId]) return;
    setLoadingTranslations((prev) => ({ ...prev, [messageId]: true }));
    try {
      const { data } = await axiosInstance.post("/translate", {
        text,
        target: "ml", // Malayalam target language code
      });
      setTranslations((prev) => ({ ...prev, [messageId]: data.translatedText }));
    } catch (err) {
      console.error("Translation request failed:", err);
    } finally {
      setLoadingTranslations((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = (messageId) => {
    setDropdownOpen(dropdownOpen === messageId ? null : messageId);
  };

  // Delete message function
  const handleDeleteMessage = async (messageId) => {
    await deleteMessage(messageId);
    setDropdownOpen(null);
  };

  // Open report modal for a given message (PASS the full message object!)
  const openReportModal = (message) => {
    setReportTargetMessage(message);
    setReportModalOpen(true);
    setReportReason("");
    setReportDescription("");
  };

  // Submit report function
  const handleSubmitReport = async () => {
    if (!reportReason) {
      alert("Please select a reason for reporting.");
      return;
    }
    // Pass reportedMessage as the message _id from the full message object
    await reportUser(reportTargetMessage._id, reportReason, reportDescription);
    setReportModalOpen(false);
    setReportTargetMessage(null);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          // Compare sender IDs as strings
          const senderIdStr = message.senderId ? message.senderId.toString() : "deleted";
          const authUserIdStr = authUser._id.toString();
          const isSentByCurrentUser = senderIdStr === authUserIdStr;
          const chatAlignment = isSentByCurrentUser ? "chat-end" : "chat-start";

          return (
            <div
              key={message._id}
              className={`chat ${chatAlignment} relative`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isSentByCurrentUser
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col relative">
                {message.image && (
                  <img
                    src={message.image}
                    alt="attachment"
                    className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer"
                    onClick={() => openImageFullscreen(message.image)}
                  />
                )}
                {message.file && (
                  <a
                    href={`${message.file}?fl_attachment=true`}
                    download={message.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline break-all mb-2"
                  >
                    {message.fileName || "Download File"}
                  </a>
                )}
                {message.text && (
                  <>
                    <p>{message.text}</p>
                    {translations[message._id] && (
                      <p className="mt-2 text-green-600">
                        {translations[message._id]}
                      </p>
                    )}
                    <button
                      onClick={() => handleTranslate(message._id, message.text)}
                      className="btn btn-ghost btn-xs p-1"
                      disabled={loadingTranslations[message._id]}
                    >
                      {loadingTranslations[message._id] ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <Languages className="size-4" />
                      )}
                    </button>
                  </>
                )}

                {/* Report dropdown: Only for messages not sent by current user */}
                {!isSentByCurrentUser && (
                  <div className="dropdown dropdown-end absolute top-0 -right-10 z-50">
                    <button
                      tabIndex={0}
                      className="btn btn-ghost btn-circle"
                      onClick={() => toggleDropdown(message._id)}
                    >
                      <div className="w-6">⋮</div>
                    </button>
                    {dropdownOpen === message._id && (
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-red-200 rounded-box w-32"
                      >
                        <li>
                          {/* PASS the entire message to openReportModal */}
                          <button
                            onClick={() => openReportModal(message)}
                            className="font-bold text-black"
                          >
                            Report Message
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                )}

                {/* Delete dropdown for messages sent by current user */}
                {isSentByCurrentUser && (
                  <div className="dropdown dropdown-start absolute top-0 -left-10 z-50">
                    <button
                      tabIndex={0}
                      className="btn btn-ghost btn-circle"
                      onClick={() => toggleDropdown(message._id)}
                    >
                      <div className="w-6">⋮</div>
                    </button>
                    {dropdownOpen === message._id && (
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-red-200 rounded-box w-32 z-50"
                      >
                        <li>
                          <button
                            onClick={() => handleDeleteMessage(message._id)}
                            className="font-bold text-black"
                          >
                            Delete Message
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />

      {/* Inline Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <h2 className="text-lg font-bold mb-4">Report Message</h2>
            <label className="block mb-2">Reason:</label>
            <select
              className="w-full p-2 border rounded mb-4"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="">Select a reason</option>
              <option value="Spam">Spam</option>
              <option value="Harassment">Harassment</option>
              <option value="Sensitive Content">Sensitive Content</option>
              <option value="Other">Other</option>
            </select>
            <label className="block mb-2">Description (optional):</label>
            <textarea
              className="w-full p-2 border rounded mb-4"
              rows="3"
              placeholder="Provide more details..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Fullscreen Image View */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeImageFullscreen}
        >
          <div className="relative">
            <img
              src={selectedImage}
              alt="Fullscreen"
              className="max-w-full max-h-screen rounded-md"
            />
            <button
              className="absolute top-4 right-4 text-white text-2xl"
              onClick={closeImageFullscreen}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;

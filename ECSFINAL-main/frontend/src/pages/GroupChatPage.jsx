import React, { useEffect, useRef, useState } from "react"; // ADDED: useState import
import { useGroupChatStore } from "../store/useGroupChatStore";
import { useAuthStore } from "../store/useAuthStore";
import GroupChatHeader from "../components/GroupChatHeader";
import MessageInput from "../components/MessageInput";
import { formatMessageTime } from "../lib/utils";
import { Languages } from "lucide-react";
import axiosInstance from "../lib/axios";

const GroupChatPage = () => {
  const { authUser, reportUser } = useAuthStore(); // reportUser reports a message now
  const {
    groupMessages,
    isLoading,
    getGroupMessages,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    sendGroupMessage,
    deleteGroupMessage,
  } = useGroupChatStore();
  const messageEndRef = useRef(null);

  // Existing state for dropdown and translation, image fullscreen remain unchanged
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [translations, setTranslations] = useState({}); // key: message id, value: translated text
  const [loadingTranslations, setLoadingTranslations] = useState({}); // key: message id, value: boolean

  const [selectedImage, setSelectedImage] = useState(null);
  const openImageFullscreen = (imageUrl) => {
    setSelectedImage(imageUrl);
  };
  const closeImageFullscreen = () => {
    setSelectedImage(null);
  };

  // ADDED: States for reporting a message
  // Removed unused reportTargetUser and only use reportTargetMessage now.
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetMessage, setReportTargetMessage] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  useEffect(() => {
    if (authUser) {
      getGroupMessages();
      subscribeToGroupMessages();
    }
    return () => {
      unsubscribeFromGroupMessages();
    };
  }, [authUser, getGroupMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  useEffect(() => {
    if (messageEndRef.current && groupMessages.length) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  // Function to trigger translation for a message
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

  // Toggle dropdown menus (for delete/report options)
  const toggleDropdown = (messageId) => {
    setDropdownOpen(dropdownOpen === messageId ? null : messageId);
  };

  const handleDeleteGroupMessage = async (messageId) => {
    await deleteGroupMessage(messageId);
    setDropdownOpen(null);
  };

  // ADDED: Function to open report modal for a given message
  // CHANGED: Pass the whole message (not message.senderId) so that the reported message is recorded.
  const openReportModal = (message) => {
    setReportTargetMessage(message);
    setReportModalOpen(true);
    setReportReason("");
    setReportDescription("");
  };

  // ADDED: Function to submit the report
  const handleSubmitReport = async () => {
    if (!reportReason) {
      alert("Please select a reason for reporting.");
      return;
    }
    // Pass the reported message's _id to reportUser
    await reportUser(reportTargetMessage._id, reportReason, reportDescription);
    setReportModalOpen(false);
    setReportTargetMessage(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-screen">
        <div className="sticky top-16 z-10 bg-base-100 shadow-md">
          <GroupChatHeader />
        </div>
        <div className="flex-1 p-4 overflow-y-auto pt-20">Loading messages...</div>
        <div className="sticky bottom-0 bg-base-100 shadow-md">
          <MessageInput sendMessage={sendGroupMessage} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="sticky top-16 z-10 bg-base-100 shadow-md">
        <GroupChatHeader />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-20">
        {groupMessages.map((message) => {
          const senderId = message.senderId?._id || "deleted";
          const senderFullName = message.senderId?.fullName || "Deleted User";
          const senderProfilePic = message.senderId?.profilePic || "/avatar.png";
          const chatAlignment = senderId === authUser._id ? "chat-end" : "chat-start";

          return (
            <div
              key={message._id}
              className={`chat ${chatAlignment} relative`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="w-10 h-10 rounded-full border">
                  <img
                    src={
                      senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : senderProfilePic
                    }
                    alt="profile"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <span className="font-bold">{senderFullName}</span>
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col">
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
                      <p className="mt-2 text-green-600">{translations[message._id]}</p>
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
                {selectedImage && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                    onClick={closeImageFullscreen}
                  >
                    <div className="relative">
                      <img src={selectedImage} alt="Fullscreen" className="max-w-full max-h-screen rounded-md" />
                      <button
                        className="absolute top-4 right-4 text-white text-2xl"
                        onClick={closeImageFullscreen}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* ADDED: Dropdown for reporting a message (only for messages not sent by current user) */}
                {senderId !== authUser._id && (
                  <div className="dropdown dropdown-end absolute top-0 -right-8 z-50">
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
                          {/* CHANGED: Call openReportModal with the whole message, label updated */}
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

                {/* Dropdown for deletion (for messages sent by current user) */}
                {senderId === authUser._id && (
                  <div className="dropdown dropdown-start absolute top-0 -left-8 z-50">
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
                          <button
                            onClick={() => handleDeleteGroupMessage(message._id)}
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

      <div className="sticky bottom-0 bg-base-100 shadow-md">
        <MessageInput sendMessage={sendGroupMessage} />
      </div>

      {/* ADDED: Inline Report Modal for Group Chat */}
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
    </div>
  );
};

export default GroupChatPage;

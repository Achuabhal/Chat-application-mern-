import React from "react";

const GroupChatHeader = () => {
  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold">GC</span>
          </div>
        </div>
        <div>
          <h3 className="font-medium">Group Chat</h3>
          <p className="text-sm text-base-content/70">
            Chat with peers from your course &amp; semester
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupChatHeader;

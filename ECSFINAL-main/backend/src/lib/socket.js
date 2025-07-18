import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// Store online users for one-to-one chat: { userId: socketId }
const userSocketMap = {};

/**
 * Helper function to retrieve the socket ID for a given user.
 * Used in one-to-one messaging.
 * @param {String} userId 
 * @returns {String | undefined} socket ID
 */
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Extract query parameters from the handshake
  const { userId, course, semester } = socket.handshake.query;

  // Map the userId for one-to-one messaging
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // For group chat: if course and semester exist, join the corresponding room
  if (course && semester) {
    const roomName = `${course}-${semester}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room: ${roomName}`);
  }


  // [CHANGE] Listen for the "userUnblocked" event to optionally trigger reconnection or custom logic
  socket.on("userUnblocked", (data) => {
    console.log(`🔓 Received userUnblocked event for userId: ${data.userId} on socket: ${socket.id}`);
    // For example, you might want to force the socket to reconnect:
    socket.disconnect(true);
    // Note: The client should handle reconnection logic.
  });

  // Emit updated online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // On disconnect, remove user mapping and update online users list
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });




});

export { io, app, server };

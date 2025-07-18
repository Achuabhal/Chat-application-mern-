// friendRequest.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendFriendRequest,
  getIncomingRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
} from "../controllers/friendRequest.controller.js";

const router = express.Router();

router.post("/request", protectRoute, sendFriendRequest);
router.get("/incoming", protectRoute, getIncomingRequests);
router.get("/sent", protectRoute, getSentRequests);
router.put("/accept/:id", protectRoute, acceptFriendRequest);
router.put("/reject/:id", protectRoute, rejectFriendRequest);
router.get("/friends", protectRoute, getFriends);

export default router;

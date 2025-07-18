import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { blockUser, unblockUser } from "../controllers/user.controller.js";
import { deleteAccount } from "../controllers/user.controller.js";

const router = express.Router();
router.put("/block/:userId", protectRoute, blockUser);
router.put("/unblock/:userId", protectRoute, unblockUser);
router.delete("/delete-account", protectRoute, deleteAccount);

export default router;

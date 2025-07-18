import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getGroupMessages, sendGroupMessage,deleteGroupMessage } from "../controllers/groupMessage.controller.js";

const router = express.Router();

router.get("/", protectRoute, getGroupMessages);
router.post("/send", protectRoute, sendGroupMessage);

router.delete("/:id", protectRoute, deleteGroupMessage);

export default router;

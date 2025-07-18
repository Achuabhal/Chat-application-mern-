// routes/admin.route.js
import express from "express";
import { protectRoute, isAdmin } from "../middleware/auth.middleware.js";
import { getUsers, banUser } from "../controllers/admin.controller.js";
import { clearGroupMessages } from "../controllers/admin.controller.js";
import { getDeletedUsers } from "../controllers/admin.controller.js";

const router = express.Router();

// GET /admin/users?search=optionalQuery
router.get("/users", protectRoute, isAdmin, getUsers);

// PUT /admin/ban/:id
router.put("/ban/:id", protectRoute, isAdmin, banUser);


router.delete("/clear-group-messages", protectRoute, isAdmin, clearGroupMessages);


router.get("/deleted-users", protectRoute, isAdmin, getDeletedUsers);
export default router;

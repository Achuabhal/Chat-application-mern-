import express from "express"
import { login, signup , logout, updateProfile,updateSemester, checkAuth} from "../controllers/auth.controller.js";
import {protectRoute} from "../middleware/auth.middleware.js";


import { isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();
 
router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/update-semester", protectRoute, updateSemester);
router.get("/check",protectRoute, checkAuth);

router.get("/admin", protectRoute, isAdmin, (req, res) => {
    res.json({ message: "Welcome, Admin!" });
});
export default router;
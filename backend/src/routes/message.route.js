import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { getUsersForSiderbar,getMessages,sendMessage } from "../controllers/message.controller.js";
const router = express.Router();

router.get("/users",isAuthenticated,getUsersForSiderbar);
router.get("/:id",isAuthenticated,getMessages);
router.post("/send/:id",isAuthenticated,sendMessage);
export default router;

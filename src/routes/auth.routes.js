import express from "express";
import {registerUser , loginUser , getMe , changePassword , refreshAccessToken} from "../controllers/auth.controller.js";
import verifyAccessToken from "../middleware/auth.middleware.js";
// import 

const router = express.Router();

router.post("/register",registerUser);
router.post("/login", loginUser);
router.get("/me" , verifyAccessToken, getMe);
router.put("/change-password" , verifyAccessToken, changePassword);
router.post("/refresh-token", refreshAccessToken);

export default router;
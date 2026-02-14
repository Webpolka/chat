import { Router } from "express";
import {
  loginController,
  refreshController,
  logoutController,
  registerController,
} from "./auth.controller.js";
import { uploadAvatar } from "../middleware/uploadAvatars.js";

export const authRouter = Router();

// ---------------------- AUTH ROUTES ----------------------

// authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/refresh", refreshController);
authRouter.post("/register", uploadAvatar, registerController);

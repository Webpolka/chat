import { Router } from "express";
import {
  loginController,
  refreshController,
  logoutController,
  registerController,
  updateController,
  changePasswordController,
  deleteAccountController
} from "./auth.controller.js";
import { uploadAvatar } from "../middleware/uploadAvatars.js";

export const authRouter = Router();

// ---------------------- AUTH ROUTES ----------------------

authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/refresh", refreshController);
authRouter.post("/register", uploadAvatar, registerController);
authRouter.post("/update", uploadAvatar, updateController);
authRouter.post("/change-password", changePasswordController);
authRouter.post("/delete-account", deleteAccountController);

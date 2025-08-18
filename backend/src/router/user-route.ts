import express from "express";
import { LoginUserController } from "../controller/user/login-user-controller";

const router = express.Router();

const loginUserController = new LoginUserController();

router.post(
  "/user/login",
  loginUserController.handle.bind(loginUserController)
);

export default router;

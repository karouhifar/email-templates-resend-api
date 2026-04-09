import { Router } from "express";
import { UserController } from "../controller/controller";

const router = Router();

router.post("/create", UserController.create);

export default router;

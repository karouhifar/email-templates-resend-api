import { Router } from "express";
import { EmailController } from "../controller/controller";

const router = Router();

router.post("sendEmail/:key", EmailController.send);

export default router;

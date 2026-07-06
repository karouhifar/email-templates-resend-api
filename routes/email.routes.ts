import { Router } from "express";
import { EmailController } from "../controller/controller";

const router = Router();

router.post("/sendEmail/:key", EmailController.send);
router.post("/sendEmail/:key/quote", EmailController.sendQuote);
router.post(
  "/sendEmail/:key/3d-design-quote",
  EmailController.send3dDesignQuote,
);

export default router;

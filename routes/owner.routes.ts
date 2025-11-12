import { Router } from "express";
import { OwnerController } from "../controller/controller";

const router = Router();
// Define owner-specific routes here

router.get("/", OwnerController.list);
router.get("/:key", OwnerController.get);
router.post("/", OwnerController.upsert);
router.delete("/:key", OwnerController.remove);

export default router;

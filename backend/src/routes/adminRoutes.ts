import { Router } from "express";
import { getStats } from "../controllers/adminController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/stats", authenticate, requireAdmin, getStats);

export default router;

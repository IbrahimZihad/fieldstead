import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrderPayment,
} from "../controllers/orderController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/my", authenticate, getMyOrders);
router.get("/", authenticate, requireAdmin, getAllOrders);
router.put("/:id/status", authenticate, requireAdmin, updateOrderStatus);
router.put("/:id/payment", authenticate, requireAdmin, updateOrderPayment);

export default router;

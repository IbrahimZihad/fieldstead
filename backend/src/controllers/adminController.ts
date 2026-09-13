import { Response, NextFunction } from "express";
import { Order, Product, Category, User } from "../models";
import { AuthRequest } from "../middleware/auth";

export const getStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const [
      totalProducts,
      totalCategories,
      totalCustomers,
      totalOrders,
      paidOrders,
      pendingVerificationCount,
      lowStockCount,
    ] = await Promise.all([
      Product.count(),
      Category.count(),
      User.count({ where: { role: "customer" } }),
      Order.count(),
      Order.findAll({ where: { paymentStatus: "paid" } }),
      Order.count({ where: { paymentStatus: "pending_verification" } }),
      Product.count({ where: { stock: 0 } }),
    ]);

    const totalRevenue = paidOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0
    );

    const recentOrders = await Order.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    res.json({
      stats: {
        totalProducts,
        totalCategories,
        totalCustomers,
        totalOrders,
        totalRevenue,
        pendingVerificationCount,
        outOfStockCount: lowStockCount,
      },
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
};

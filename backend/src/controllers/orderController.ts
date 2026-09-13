import { Response, NextFunction } from "express";
import { sequelize, Order, OrderItem, Product } from "../models";
import { ApiError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { PaymentMethod } from "../models/Order";

interface IncomingItem {
  productId: number;
  quantity: number;
}

const PAYMENT_METHODS: PaymentMethod[] = ["cod", "bkash", "nagad"];

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const t = await sequelize.transaction();
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      transactionId,
      paymentPhone,
    } = req.body as {
      items: IncomingItem[];
      shippingAddress: string;
      paymentMethod: PaymentMethod;
      transactionId?: string;
      paymentPhone?: string;
    };

    if (!items || !items.length) {
      throw new ApiError(400, "Order must contain at least one item");
    }
    if (!shippingAddress) {
      throw new ApiError(400, "shippingAddress is required");
    }
    if (!paymentMethod || !PAYMENT_METHODS.includes(paymentMethod)) {
      throw new ApiError(
        400,
        `paymentMethod must be one of: ${PAYMENT_METHODS.join(", ")}`
      );
    }
    if (paymentMethod !== "cod") {
      if (!transactionId?.trim() || !paymentPhone?.trim()) {
        throw new ApiError(
          400,
          "transactionId and paymentPhone are required for bKash/Nagad payments"
        );
      }
    }

    let totalAmount = 0;
    const orderItemsData: {
      productId: number;
      productName: string;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        transaction: t,
      });
      if (!product) {
        throw new ApiError(404, `Product ${item.productId} not found`);
      }
      if (item.quantity < 1) {
        throw new ApiError(400, "Quantity must be at least 1");
      }
      if (product.stock < item.quantity) {
        throw new ApiError(
          400,
          `Not enough stock for "${product.name}" (available: ${product.stock})`
        );
      }

      const price = Number(product.price);
      totalAmount += price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price,
      });

      product.stock -= item.quantity;
      await product.save({ transaction: t });
    }

    const order = await Order.create(
      {
        userId: req.user!.id,
        totalAmount,
        shippingAddress,
        status: "pending",
        paymentMethod,
        paymentStatus:
          paymentMethod === "cod" ? "unpaid" : "pending_verification",
        transactionId: paymentMethod === "cod" ? null : transactionId!.trim(),
        paymentPhone: paymentMethod === "cod" ? null : paymentPhone!.trim(),
      },
      { transaction: t }
    );

    await OrderItem.bulkCreate(
      orderItemsData.map((i) => ({ ...i, orderId: order.id })),
      { transaction: t }
    );

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "items" }],
    });

    res.status(201).json({ order: fullOrder });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user!.id },
      include: [{ model: OrderItem, as: "items" }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: OrderItem, as: "items" }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");
    const { status } = req.body;
    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      throw new ApiError(400, `status must be one of: ${allowed.join(", ")}`);
    }
    order.status = status;
    await order.save();
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const updateOrderPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");
    const { paymentStatus } = req.body;
    const allowed = ["unpaid", "pending_verification", "paid"];
    if (!allowed.includes(paymentStatus)) {
      throw new ApiError(
        400,
        `paymentStatus must be one of: ${allowed.join(", ")}`
      );
    }
    order.paymentStatus = paymentStatus;
    await order.save();
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "bkash" | "nagad";
export type PaymentStatus = "unpaid" | "pending_verification" | "paid";

interface OrderAttributes {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId: string | null;
  paymentPhone: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type OrderCreationAttributes = Optional<
  OrderAttributes,
  "id" | "status" | "paymentStatus" | "transactionId" | "paymentPhone"
>;

export class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  public id!: number;
  public userId!: number;
  public status!: OrderStatus;
  public totalAmount!: number;
  public shippingAddress!: string;
  public paymentMethod!: PaymentMethod;
  public paymentStatus!: PaymentStatus;
  public transactionId!: string | null;
  public paymentPhone!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "shipped", "delivered", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shippingAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM("cod", "bkash", "nagad"),
      allowNull: false,
      defaultValue: "cod",
    },
    paymentStatus: {
      type: DataTypes.ENUM("unpaid", "pending_verification", "paid"),
      allowNull: false,
      defaultValue: "unpaid",
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
  }
);

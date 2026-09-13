import dotenv from "dotenv";
dotenv.config();

import { sequelize, User, Category, Product, Order, OrderItem } from "../models";

const categoriesData = [
  { name: "Stationery", slug: "stationery" },
  { name: "Home Goods", slug: "home-goods" },
  { name: "Bags & Travel", slug: "bags-travel" },
  { name: "Kitchen", slug: "kitchen" },
];

const productsData: {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categorySlug: string;
}[] = [
  {
    name: "Dot Grid Notebook",
    slug: "dot-grid-notebook",
    description:
      "A5 hardcover notebook with 160 dot-grid pages, ideal for journaling and sketching.",
    price: 12.5,
    stock: 40,
    imageUrl: "https://picsum.photos/seed/notebook/600/600",
    categorySlug: "stationery",
  },
  {
    name: "Brass Desk Pen",
    slug: "brass-desk-pen",
    description: "Solid brass ballpoint pen that develops a natural patina over time.",
    price: 24.0,
    stock: 25,
    imageUrl: "https://picsum.photos/seed/pen/600/600",
    categorySlug: "stationery",
  },
  {
    name: "Ceramic Pour-Over Set",
    slug: "ceramic-pour-over-set",
    description: "Hand-glazed ceramic dripper and matching mug for slow morning coffee.",
    price: 38.0,
    stock: 15,
    imageUrl: "https://picsum.photos/seed/pourover/600/600",
    categorySlug: "kitchen",
  },
  {
    name: "Linen Table Runner",
    slug: "linen-table-runner",
    description: "Stonewashed European linen runner, 14 x 90 inches.",
    price: 29.0,
    stock: 30,
    imageUrl: "https://picsum.photos/seed/runner/600/600",
    categorySlug: "home-goods",
  },
  {
    name: "Canvas Weekender Bag",
    slug: "canvas-weekender-bag",
    description: "Waxed canvas duffel with leather trim, fits a weekend of essentials.",
    price: 89.0,
    stock: 12,
    imageUrl: "https://picsum.photos/seed/weekender/600/600",
    categorySlug: "bags-travel",
  },
  {
    name: "Cast Iron Skillet",
    slug: "cast-iron-skillet",
    description: "10-inch pre-seasoned cast iron skillet, oven and campfire safe.",
    price: 34.0,
    stock: 20,
    imageUrl: "https://picsum.photos/seed/skillet/600/600",
    categorySlug: "kitchen",
  },
  {
    name: "Wool Throw Blanket",
    slug: "wool-throw-blanket",
    description: "Merino wool throw, woven in a soft herringbone pattern.",
    price: 65.0,
    stock: 18,
    imageUrl: "https://picsum.photos/seed/blanket/600/600",
    categorySlug: "home-goods",
  },
  {
    name: "Leather Passport Wallet",
    slug: "leather-passport-wallet",
    description: "Full-grain leather passport holder with card slots.",
    price: 42.0,
    stock: 22,
    imageUrl: "https://picsum.photos/seed/passport/600/600",
    categorySlug: "bags-travel",
  },
  {
    name: "Recycled Cork Coasters (Set of 4)",
    slug: "cork-coasters-set",
    description: "Minimal cork coasters made from reclaimed wine-stopper waste.",
    price: 16.0,
    stock: 50,
    imageUrl: "https://picsum.photos/seed/coasters/600/600",
    categorySlug: "kitchen",
  },
  {
    name: "Fountain Pen Ink, Indigo",
    slug: "fountain-pen-ink-indigo",
    description: "50ml bottle of smooth-flowing indigo fountain pen ink.",
    price: 14.5,
    stock: 35,
    imageUrl: "https://picsum.photos/seed/ink/600/600",
    categorySlug: "stationery",
  },
];

const usersData = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin" as const,
  },
  {
    name: "Jane Customer",
    email: "customer@example.com",
    password: "customer123",
    role: "customer" as const,
  },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log("Resetting database...");
    await sequelize.sync({ force: true });

    console.log("Seeding categories...");
    const categories = await Category.bulkCreate(categoriesData);
    const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));

    console.log("Seeding products...");
    await Product.bulkCreate(
      productsData.map((p) => ({
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        imageUrl: p.imageUrl,
        categoryId: categoryBySlug.get(p.categorySlug)!,
      }))
    );

    console.log("Seeding users...");
    // Created one by one (not bulkCreate) so the beforeCreate hash hook runs.
    for (const u of usersData) {
      await User.create(u);
    }
    const customer = await User.findOne({ where: { email: "customer@example.com" } });

    console.log("Seeding sample orders...");
    const allProducts = await Product.findAll({ order: [["id", "ASC"]] });
    if (customer && allProducts.length >= 2) {
      const orderA = await Order.create({
        userId: customer.id,
        shippingAddress: "House 12, Road 4, Dhanmondi, Dhaka",
        status: "delivered",
        paymentMethod: "cod",
        paymentStatus: "paid",
        totalAmount: Number(allProducts[0].price) * 1,
      });
      await OrderItem.create({
        orderId: orderA.id,
        productId: allProducts[0].id,
        productName: allProducts[0].name,
        quantity: 1,
        price: Number(allProducts[0].price),
      });

      const orderB = await Order.create({
        userId: customer.id,
        shippingAddress: "Flat 3B, Gulshan Avenue, Dhaka",
        status: "pending",
        paymentMethod: "bkash",
        paymentStatus: "pending_verification",
        transactionId: "8N7K2P9Q1R",
        paymentPhone: "01812345678",
        totalAmount: Number(allProducts[1].price) * 2,
      });
      await OrderItem.create({
        orderId: orderB.id,
        productId: allProducts[1].id,
        productName: allProducts[1].name,
        quantity: 2,
        price: Number(allProducts[1].price),
      });
    }

    console.log("\nSeed complete.");
    console.log("---------------------------------");
    console.log("Admin login:    admin@example.com / admin123");
    console.log("Customer login: customer@example.com / customer123");
    console.log("---------------------------------");

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();

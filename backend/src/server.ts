import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { sequelize } from "./models";

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    // sync() creates tables if they don't exist yet. In a real production
    // setup you would use migrations instead of sync({ alter: true }).
    await sequelize.sync();
    console.log("Database connected and synced.");

    app.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();

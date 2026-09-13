import { Sequelize } from "sequelize";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Zero-config SQLite database so the whole app runs with no external DB
// service to install. To use MySQL or PostgreSQL instead (matching a
// typical production setup), replace this block with e.g.:
//
// export const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD, {
//   host: process.env.DB_HOST,
//   dialect: "mysql", // or "postgres"
//   logging: false,
// });

const storagePath = process.env.DB_STORAGE || "./data/database.sqlite";
const resolvedPath = path.resolve(storagePath);
const dir = path.dirname(resolvedPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: resolvedPath,
  logging: false,
});

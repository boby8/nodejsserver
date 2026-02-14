import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "todo_db",
    user: process.env.DB_USER || "bobbysingh",
    password: process.env.DB_PASSWORD || "",
  },
};


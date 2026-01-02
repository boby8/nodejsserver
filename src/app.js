import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todo.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

// TODO: Add auth middleware later
app.use("/todos", todoRoutes);

// TODO: Centralized error handling
app.use(errorHandler);

export default app;


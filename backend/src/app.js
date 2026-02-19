import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import cardRoutes from "./routes/card.route.js";
import authRoutes from "./routes/auth.route.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per window
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true, // X-RateLimit-* headers
  legacyHeaders: false,
});
app.use(limiter);

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/cards", authenticate, cardRoutes);

app.use(errorHandler);

export default app;


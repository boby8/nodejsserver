import app from "./app.js";
import { env } from "./config/env.js";
import "./config/db.js"; // Initialize DB connection

app.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port}`);
});


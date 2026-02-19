import app from "./app.js";
import { env } from "./config/env.js";
import "./config/db.js"; // Initialize DB connection

app.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port}`);
});

// import http from "http";
// import app from "./app.js";

// const server = http.createServer(app);

// server.listen(5000, () => {
//   console.log("Server running");
// });

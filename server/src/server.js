import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { initSocket } from "./services/socket.service.js";

const server = http.createServer(app);
const allowedOrigins = new Set([
  env.clientUrl,
  env.clientUrl.replace("localhost", "127.0.0.1"),
  env.clientUrl.replace("127.0.0.1", "localhost"),
]);
const io = new Server(server, {
  cors: {
    origin: Array.from(allowedOrigins),
    credentials: true,
  },
});

initSocket(io);
await connectDb();

server.listen(env.port, () => {
  console.log(`TaskFlow API running on port ${env.port}`);
});

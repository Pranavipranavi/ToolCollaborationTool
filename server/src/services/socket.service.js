import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";

let io;

function readCookie(header, name) {
  if (!header) return null;
  const cookies = header.split(";").map((part) => part.trim());
  const match = cookies.find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function initSocket(serverIo) {
  io = serverIo;

  io.use(async (socket, next) => {
    try {
      const token = readCookie(socket.handshake.headers.cookie, "taskflow_token") || socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(decoded.id).select("_id");
      if (!user) return next(new Error("Invalid session"));

      socket.userId = user._id.toString();
      return next();
    } catch (_error) {
      return next(new Error("Invalid or expired session"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("workspace:join", async (workspaceId) => {
      try {
        const membership = await Workspace.exists({ _id: workspaceId, "members.user": socket.userId });
        if (!membership) return;
        socket.join(`workspace:${workspaceId}`);
      } catch (_error) {
        // Invalid workspace ids are ignored instead of breaking the socket connection.
      }
    });

    socket.on("workspace:leave", (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
    });
  });
}

export function emitToWorkspace(workspaceId, event, payload) {
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit(event, payload);
}

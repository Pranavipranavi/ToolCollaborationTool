let io;

export function initSocket(serverIo) {
  io = serverIo;

  io.on("connection", (socket) => {
    socket.on("workspace:join", (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
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

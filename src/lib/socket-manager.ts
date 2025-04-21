import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import { instrument } from "@socket.io/admin-ui";
class SocketManager {
  private static instance: SocketManager;
  public io: SocketIOServer;
  private httpServer: ReturnType<typeof createServer>;

  private constructor() {
    this.httpServer = createServer();
    this.io = new SocketIOServer(this.httpServer, {
      path: "/",
      cors: {
        origin: ["http://localhost:3000", "https://admin.socket.io"],
        credentials: true
      }
    });
    this.httpServer.listen(4000, () => {
      console.log(`Socket.IO server listening on 4000`);
    });
    this.initializeSocket();
  }
  private initializeSocket() {
    this.io.on("connection", (socket) => {
      console.log(`User connected (${socket.id})`);
      socket.on("disconnect", () => {
        console.log(`User disconnected (${socket.id})`);
      });
    });
    instrument(this.io, { auth: false, mode: "development" });
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }
}
export const socketManager = SocketManager.getInstance();
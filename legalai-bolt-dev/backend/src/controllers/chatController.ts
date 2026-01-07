import { Server, Socket } from "socket.io";
import { handleChatMessage } from "../services/chatService";

export function setupChatController(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log("👤 User connected:", socket.id);

    socket.on("user_message", async (msg: string) => {
      try {
        console.log(`📨 Message from ${socket.id}:`, msg);

        const response = await handleChatMessage(msg);

        socket.emit("ai_response", response);
        console.log(`🤖 Response sent to ${socket.id}`);
      } catch (err: any) {
        console.error("❌ Error generating response:", err);
        socket.emit("chat_error", err.message || "An error occurred while processing your message");
      }
    });

    socket.on("disconnect", () => {
      console.log("👋 User disconnected:", socket.id);
    });

    socket.on("error", (error) => {
      console.error("🚨 Socket error:", error);
    });
  });

  console.log("✅ Chat controller initialized with Socket.IO");
}

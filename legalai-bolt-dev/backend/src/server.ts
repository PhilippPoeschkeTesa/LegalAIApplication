import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { swaggerUi, swaggerSpec } from './config/swagger';
import { initChatService } from './services/chatService';
import { setupChatController } from './controllers/chatController';

dotenv.config();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

const pathsCount = swaggerSpec && swaggerSpec.paths ? Object.keys(swaggerSpec.paths).length : 0;
console.log(`📚 Swagger spec generated with ${pathsCount} path(s)`);

const PORT = process.env.PORT;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

async function startServer() {
  try {
    console.log("🚀 Initializing Azure AI Chat Service...");
    await initChatService();

    setupChatController(io);

    server.listen(PORT, () => {
      console.log(`✅ Server started on Port ${PORT}`);
      console.log(`🔌 WebSocket server ready for connections`);
      console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL }`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

 
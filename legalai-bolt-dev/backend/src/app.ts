import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import fileRoutes from './routes/fileRoutes';
import documentRoutes from './routes/documentRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/authMiddleware';
 
const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
 
// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Tesa Legal Ai Backend is running 🚀');
});

// Protected routes (authentication required)
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/files', authMiddleware, fileRoutes);
app.use('/api/documents', authMiddleware, documentRoutes);
 
// Centralized error handler middleware (should be last)
app.use(errorHandler);
 
export default app;
 
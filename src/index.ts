import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import superadminRoutes from './routes/superadmin.routes';
import resourceRoutes from './routes/resource.routes';
import pollRoutes from './routes/poll.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/resource', resourceRoutes);
app.use('/api/resource', pollRoutes); // Mount at /api/resource to match frontend call /api/resource/announcement/:id/vote

// Database Connection and Server Start
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`[Server] 🚀 Backend running on http://localhost:${PORT}`);
    });
});

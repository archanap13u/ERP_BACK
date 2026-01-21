require('dotenv').config();
const express = require('express');
// Force Restart 3
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const superadminOrgRoutes = require('./routes/superadmin/organizations');
const superadminLicenseRoutes = require('./routes/superadmin/licenses');
const superadminUserRoutes = require('./routes/superadmin/users');
const superadminStatsRoutes = require('./routes/superadmin/stats');
const superadminAnalyticsRoutes = require('./routes/superadmin/analytics');
const superadminSettingsRoutes = require('./routes/superadmin/settings');
const resourceRoutes = require('./routes/resource');
const performanceRoutes = require('./routes/performance');
const pollRoutes = require('./routes/poll');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/superadmin/organizations', superadminOrgRoutes);
app.use('/api/superadmin/licenses', superadminLicenseRoutes);
app.use('/api/superadmin/users', superadminUserRoutes);
app.use('/api/superadmin/stats', superadminStatsRoutes);
app.use('/api/superadmin/analytics', superadminAnalyticsRoutes);
app.use('/api/superadmin/settings', superadminSettingsRoutes);
app.use('/api/resource', resourceRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/poll', pollRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: 'v2-debug' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`[Server] Express running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('[Server] Failed to start:', error);
        process.exit(1);
    }
};

startServer();

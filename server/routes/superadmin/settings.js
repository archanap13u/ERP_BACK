const express = require('express');
const router = express.Router();

// Import models from local CommonJS files
const PlatformSettings = require('../../models/PlatformSettings');

// GET /api/superadmin/settings
router.get('/', async (req, res) => {
    try {
        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = await PlatformSettings.create({});
        }

        return res.json({ success: true, data: settings });
    } catch (error) {
        console.error('[SuperAdmin Settings API] GET Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch settings' });
    }
});

// PUT /api/superadmin/settings
router.put('/', async (req, res) => {
    try {
        const { platformName, defaultSubscriptionPlan, maintenanceMode, maintenanceMessage, security, email, features } = req.body;

        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = new PlatformSettings();
        }

        if (platformName !== undefined) settings.platformName = platformName;
        if (defaultSubscriptionPlan !== undefined) settings.defaultSubscriptionPlan = defaultSubscriptionPlan;
        if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
        if (maintenanceMessage !== undefined) settings.maintenanceMessage = maintenanceMessage;

        if (security) settings.security = { ...settings.security, ...security };
        if (email) settings.email = { ...settings.email, ...email };
        if (features) settings.features = { ...settings.features, ...features };

        settings.updatedAt = new Date();
        await settings.save();

        return res.json({ success: true, message: 'Settings updated successfully', data: settings });
    } catch (error) {
        console.error('[SuperAdmin Settings API] PUT Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to update settings' });
    }
});

module.exports = router;

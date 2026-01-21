const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// Vote on a poll
// Vote on a poll
router.post('/:doctype/:id/vote', async (req, res) => {
    try {
        const { doctype, id } = req.params;
        const { optionLabel, voterId } = req.body; // Changed employeeId to voterId for generic use

        if (!optionLabel || !voterId) {
            return res.status(400).json({ error: 'Option label and voter ID (employeeId/centerId) are required' });
        }

        const { models } = require('../models');
        const Model = models[doctype.toLowerCase()];

        if (!Model) {
            return res.status(404).json({ error: `Model ${doctype} not found` });
        }

        const announcement = await Model.findById(id);
        if (!announcement) {
            return res.status(404).json({ error: 'Record not found' });
        }

        if (announcement.type !== 'Poll') {
            return res.status(400).json({ error: 'This is not a poll' });
        }

        // check if already voted
        if (announcement.voters && announcement.voters.includes(voterId)) {
            return res.status(400).json({ error: 'You have already voted' });
        }

        // Find option and increment
        const optionIndex = announcement.pollOptions.findIndex(opt => opt.label === optionLabel);
        if (optionIndex === -1) {
            return res.status(400).json({ error: 'Invalid option' });
        }

        announcement.pollOptions[optionIndex].votes = (announcement.pollOptions[optionIndex].votes || 0) + 1;
        if (!announcement.voters) announcement.voters = [];
        announcement.voters.push(voterId);

        await announcement.save();

        res.json({ success: true, data: announcement });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

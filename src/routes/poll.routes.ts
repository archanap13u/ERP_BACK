import { Router, Request, Response } from 'express';
import Announcement from '../models/Announcement';
import mongoose from 'mongoose';

const router = Router();

// Vote on a poll
router.post('/announcement/:id/vote', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { optionLabel, employeeId } = req.body;

        if (!optionLabel || !employeeId) {
            return res.status(400).json({ error: 'Option label and employee ID are required' });
        }

        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        if (announcement.type !== 'Poll') {
            return res.status(400).json({ error: 'This is not a poll' });
        }

        // check if already voted
        if (announcement.voters && announcement.voters.includes(employeeId)) {
            return res.status(400).json({ error: 'You have already voted' });
        }

        // Find option and increment
        const optionIndex = announcement.pollOptions.findIndex((opt: any) => opt.label === optionLabel);
        if (optionIndex === -1) {
            return res.status(400).json({ error: 'Invalid option' });
        }

        announcement.pollOptions[optionIndex].votes = (announcement.pollOptions[optionIndex].votes || 0) + 1;
        announcement.voters.push(employeeId);

        await announcement.save();

        res.json({ success: true, data: announcement });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

export default router;

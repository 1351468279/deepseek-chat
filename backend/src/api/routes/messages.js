import express from 'express';
import { validateConversationId } from '../middleware/validation.js';
import { dbMessages } from '../../services/database.js';

const router = express.Router();

/**
 * GET /conversations/:id/messages - Get messages for a conversation
 */
router.get('/conversations/:id/messages', validateConversationId, async (req, res) => {
  try {
    await dbMessages.read();

    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const before = req.query.before;

    let messages = dbMessages.data.messages.filter(
      m => m.conversationId === req.params.id
    );

    if (before) {
      messages = messages.filter(m => m.timestamp < before);
    }

    messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const total = messages.length;
    const paginated = messages.slice(offset, offset + limit);

    res.json({
      messages: paginated,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'DATABASE_ERROR',
    });
  }
});

export default router;

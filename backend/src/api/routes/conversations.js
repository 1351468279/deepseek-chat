import express from 'express';
import conversationStore from '../../services/conversationStore.js';
import {
  validateConversationId,
  validateConversationBody,
} from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /conversations - List all conversations
 */
router.get('/conversations', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const conversations = await conversationStore.findAll();
    const paginated = conversations.slice(offset, offset + limit);

    res.json({
      conversations: paginated,
      total: conversations.length,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'DATABASE_ERROR',
    });
  }
});

/**
 * GET /conversations/:id - Get conversation with messages
 */
router.get('/conversations/:id', validateConversationId, async (req, res) => {
  try {
    const conversation = await conversationStore.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        code: 'CONVERSATION_NOT_FOUND',
      });
    }

    // Get messages
    const { dbMessages } = await import('../../services/database.js');
    await dbMessages.read();

    const messages = dbMessages.data.messages
      .filter(m => m.conversationId === req.params.id)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    res.json({
      ...conversation,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'DATABASE_ERROR',
    });
  }
});

/**
 * POST /conversations - Create new conversation
 */
router.post('/conversations', validateConversationBody, async (req, res) => {
  try {
    const conversation = await conversationStore.create(req.body);
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'DATABASE_ERROR',
    });
  }
});

/**
 * PATCH /conversations/:id - Update conversation
 */
router.patch('/conversations/:id', validateConversationId, validateConversationBody, async (req, res) => {
  try {
    const conversation = await conversationStore.update(req.params.id, req.body);
    res.json(conversation);
  } catch (error) {
    if (error.message === 'Conversation not found') {
      return res.status(404).json({
        error: 'Conversation not found',
        code: 'CONVERSATION_NOT_FOUND',
      });
    }
    res.status(500).json({
      error: error.message,
      code: 'DATABASE_ERROR',
    });
  }
});

/**
 * DELETE /conversations/:id - Delete conversation
 */
router.delete('/conversations/:id', validateConversationId, async (req, res) => {
  try {
    await conversationStore.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Conversation not found') {
      return res.status(404).json({
        error: 'Conversation not found',
        code: 'CONVERSATION_NOT_FOUND',
      });
    }
    res.status(500).json({
      error: error.message,
      code: 'DATABASE_ERROR',
    });
  }
});

export default router;

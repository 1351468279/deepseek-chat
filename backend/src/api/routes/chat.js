import express from 'express';
import { streamChatCompletion } from '../../services/aiClient.js';
import messageStore from '../../services/messageStore.js';
import conversationStore from '../../services/conversationStore.js';
import { validateChatRequest } from '../middleware/validation.js';
import { chatRateLimiter } from '../middleware/rateLimiter.js';
import {
  setupSSEHeaders,
  writeSSEChunk,
  writeSSEDone,
  writeSSError,
} from '../../utils/streamHandler.js';

const router = express.Router();

/**
 * POST /api/chat - Send message and receive streaming AI response
 * Rate limited: 20 requests per minute
 */
router.post('/chat', chatRateLimiter, validateChatRequest, async (req, res) => {
  const { message, conversationId: providedConversationId } = req.body;

  setupSSEHeaders(res);

  try {
    // Get or create conversation
    let conversationId = providedConversationId;

    if (!conversationId) {
      // Create new conversation for first message
      const conversation = await conversationStore.create({
        title: 'New Chat', // Will be updated based on first message
      });
      conversationId = conversation.id;
    }

    // Verify conversation exists
    const conversation = await conversationStore.findById(conversationId);
    if (!conversation) {
      writeSSError(res, new Error('Conversation not found'));
      res.end();
      return;
    }

    // Save user message
    const userMessage = await messageStore.create({
      conversationId,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Update conversation
    await conversationStore.incrementMessageCount(conversationId);

    // Get conversation history for GLM
    const history = await messageStore.getHistoryForGLM(conversationId);

    // Stream response from GLM
    let fullContent = '';

    try {
      await streamChatCompletion(history, (chunk) => {
        if (chunk.content) {
          fullContent += chunk.content;
          writeSSEChunk(res, chunk.content);
        }
      });

      // Save assistant message
      await messageStore.create({
        conversationId,
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString(),
      });

      // Update conversation timestamp
      await conversationStore.touch(conversationId);

      writeSSEDone(res);
    } catch (streamError) {
      writeSSError(res, streamError);
    }
  } catch (error) {
    writeSSError(res, error);
  } finally {
    res.end();
  }
});

export default router;

import express from 'express';
import { checkAPIHealth, AI_PROVIDER } from '../../services/aiClient.js';
import { dbConversations, dbMessages } from '../../services/database.js';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await dbConversations.read();
    await dbMessages.read();

    // Check AI API connectivity
    const apiHealth = await checkAPIHealth();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      aiApi: apiHealth.healthy ? 'connected' : 'disconnected',
      provider: apiHealth.provider,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      aiApi: 'unknown',
      error: error.message,
    });
  }
});

/**
 * Get current AI provider
 */
router.get('/ai/provider', (req, res) => {
  res.json({ provider: AI_PROVIDER });
});

/**
 * Get available AI providers
 */
router.get('/ai/providers', (req, res) => {
  res.json({
    providers: [
      { id: 'glm', name: 'GLM (智谱)', model: process.env.GLM_MODEL || 'glm-4' },
      { id: 'deepseek', name: 'DeepSeek', model: process.env.DEEPSEEK_MODEL || 'deepseek-chat' },
    ],
    current: AI_PROVIDER,
  });
});

export default router;

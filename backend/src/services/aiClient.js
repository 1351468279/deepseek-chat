import OpenAI from 'openai';

/**
 * AI Provider configuration
 */
const AI_PROVIDER = process.env.AI_PROVIDER || 'glm'; // 'glm' or 'deepseek'

/**
 * GLM API Client
 */
const glmClient = new OpenAI({
  baseURL: process.env.GLM_API_BASE || 'https://open.bigmodel.cn/api/paas/v4/',
  apiKey: process.env.GLM_API_KEY,
});

/**
 * DeepSeek API Client (OpenAI-compatible)
 */
const deepseekClient = new OpenAI({
  baseURL: process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

/**
 * Get the appropriate client based on provider setting
 */
function getClient() {
  if (AI_PROVIDER === 'deepseek') {
    return deepseekClient;
  }
  return glmClient;
}

/**
 * Get the model for the current provider
 */
function getModel() {
  if (AI_PROVIDER === 'deepseek') {
    return process.env.DEEPSEEK_MODEL || 'deepseek-chat';
  }
  return process.env.GLM_MODEL || 'glm-4';
}

/**
 * Retry configuration for API calls
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call API with exponential backoff retry
 */
async function callAPIWithRetry(messages, options = {}) {
  const { maxRetries = 3, initialDelay = 1000 } = options;
  let delay = initialDelay;
  const client = getClient();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await client.chat.completions.create({
        model: getModel(),
        messages,
        ...options,
      });
    } catch (error) {
      const isRetryable = [429, 500, 503, 502].includes(error.status);
      const isLastAttempt = attempt === maxRetries;

      if (!isRetryable || isLastAttempt) {
        throw error;
      }

      console.warn(`${AI_PROVIDER.toUpperCase()} API request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying...`);
      await sleep(delay);
      delay = Math.min(delay * RETRY_CONFIG.backoffMultiplier, RETRY_CONFIG.maxDelay);
    }
  }
}

/**
 * Get chat completion with streaming
 */
export async function streamChatCompletion(messages, onChunk) {
  const client = getClient();
  const stream = await client.chat.completions.create({
    model: getModel(),
    messages,
    stream: true,
  });

  let fullContent = '';

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      fullContent += content;
      if (onChunk) {
        onChunk({ content });
      }
    }

    if (chunk.choices[0]?.finish_reason) {
      break;
    }
  }

  return fullContent;
}

/**
 * Get chat completion without streaming
 */
export async function getChatCompletion(messages) {
  return await callAPIWithRetry(messages);
}

/**
 * Check API health
 */
export async function checkAPIHealth() {
  try {
    const client = getClient();
    await client.chat.completions.create({
      model: getModel(),
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 5,
    });
    return { healthy: true, provider: AI_PROVIDER };
  } catch {
    return { healthy: false, provider: AI_PROVIDER };
  }
}

export { AI_PROVIDER };
export default { getClient, getModel, AI_PROVIDER };

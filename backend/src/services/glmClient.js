import OpenAI from 'openai';

// Initialize GLM API client with custom baseURL for GLM
const glmClient = new OpenAI({
  baseURL: process.env.GLM_API_BASE || 'https://open.bigmodel.cn/api/paas/v4/',
  apiKey: process.env.GLM_API_KEY,
});

/**
 * Retry configuration for GLM API calls
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // ms
  maxDelay: 10000, // ms
  backoffMultiplier: 2,
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call GLM API with exponential backoff retry
 */
async function callGLMWithRetry(messages, options = {}) {
  const { maxRetries = 3, initialDelay = 1000 } = options;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await glmClient.chat.completions.create({
        model: process.env.GLM_MODEL || 'glm-4',
        messages,
        ...options,
      });
    } catch (error) {
      const isRetryable = [429, 500, 503].includes(error.status);
      const isLastAttempt = attempt === maxRetries;

      if (!isRetryable || isLastAttempt) {
        throw error;
      }

      console.warn(`GLM API request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying...`);
      await sleep(delay);
      delay = Math.min(delay * RETRY_CONFIG.backoffMultiplier, RETRY_CONFIG.maxDelay);
    }
  }
}

/**
 * Get chat completion with streaming
 */
export async function streamChatCompletion(messages, onChunk) {
  const stream = await glmClient.chat.completions.create({
    model: process.env.GLM_MODEL || 'glm-4',
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
  return await callGLMWithRetry(messages);
}

/**
 * Check GLM API health
 */
export async function checkGLMHealth() {
  try {
    await glmClient.chat.completions.create({
      model: 'glm-4',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 5,
    });
    return true;
  } catch {
    return false;
  }
}

export default glmClient;

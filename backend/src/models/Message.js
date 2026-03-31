import { generateId, getTimestamp } from '../services/database.js';

/**
 * Message model
 */
export class Message {
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.conversationId = data.conversationId || '';
    this.role = data.role || 'user';
    this.content = data.content || '';
    this.timestamp = data.timestamp || getTimestamp();
    this.tokens = data.tokens || 0;
  }

  /**
   * Validate message data
   */
  validate() {
    const errors = [];

    if (!this.id || typeof this.id !== 'string') {
      errors.push('Invalid id');
    }

    if (!this.conversationId || typeof this.conversationId !== 'string') {
      errors.push('Invalid conversationId');
    }

    if (!['user', 'assistant', 'system'].includes(this.role)) {
      errors.push('Role must be user, assistant, or system');
    }

    if (!this.content || typeof this.content !== 'string' || this.content.length > 100000) {
      errors.push('Content must be between 1 and 100000 characters');
    }

    if (this.tokens < 0) {
      errors.push('Tokens cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to GLM API format
   */
  toGLMFormat() {
    return {
      role: this.role,
      content: this.content,
    };
  }

  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      id: this.id,
      conversationId: this.conversationId,
      role: this.role,
      content: this.content,
      timestamp: this.timestamp,
      tokens: this.tokens,
    };
  }
}

/**
 * Estimate tokens from text (rough approximation)
 */
export function estimateTokens(text) {
  // Rough estimation: ~4 characters per token for English
  // ~2 characters per token for Chinese
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherChars = text.length - chineseChars;

  return Math.ceil(chineseChars / 2 + otherChars / 4);
}

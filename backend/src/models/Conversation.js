import { generateId, getTimestamp } from '../services/database.js';

/**
 * Conversation model
 */
export class Conversation {
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.title = data.title || 'New Chat';
    this.createdAt = data.createdAt || getTimestamp();
    this.updatedAt = data.updatedAt || getTimestamp();
    this.messageCount = data.messageCount || 0;
  }

  /**
   * Update the conversation timestamp
   */
  touch() {
    this.updatedAt = getTimestamp();
  }

  /**
   * Increment message count
   */
  incrementMessageCount() {
    this.messageCount++;
    this.touch();
  }

  /**
   * Decrement message count
   */
  decrementMessageCount() {
    if (this.messageCount > 0) {
      this.messageCount--;
    }
    this.touch();
  }

  /**
   * Validate conversation data
   */
  validate() {
    const errors = [];

    if (!this.id || typeof this.id !== 'string') {
      errors.push('Invalid id');
    }

    if (!this.title || typeof this.title !== 'string' || this.title.length > 100) {
      errors.push('Title must be between 1 and 100 characters');
    }

    if (this.messageCount < 0) {
      errors.push('Message count cannot be negative');
    }

    if (this.updatedAt < this.createdAt) {
      errors.push('updatedAt cannot be before createdAt');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      messageCount: this.messageCount,
    };
  }
}

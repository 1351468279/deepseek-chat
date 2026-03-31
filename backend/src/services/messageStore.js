import { dbMessages } from './database.js';
import { Message, estimateTokens } from '../models/Message.js';

/**
 * MessageStore - handles message data access
 */
export class MessageStore {
  /**
   * Create a new message
   */
  async create(messageData) {
    await dbMessages.read();

    const message = new Message(messageData);
    const validation = message.validate();

    if (!validation.valid) {
      throw new Error(`Invalid message: ${validation.errors.join(', ')}`);
    }

    dbMessages.data.messages.push(message.toJSON());
    await dbMessages.write();

    return message.toJSON();
  }

  /**
   * Find all messages for a conversation
   */
  async findByConversation(conversationId) {
    await dbMessages.read();

    return dbMessages.data.messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  /**
   * Get message history for GLM API (formatted)
   */
  async getHistoryForGLM(conversationId) {
    const messages = await this.findByConversation(conversationId);
    return messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
  }

  /**
   * Find a message by ID
   */
  async findById(id) {
    await dbMessages.read();

    return dbMessages.data.messages.find(m => m.id === id);
  }

  /**
   * Delete all messages for a conversation
   */
  async deleteByConversation(conversationId) {
    await dbMessages.read();

    dbMessages.data.messages = dbMessages.data.messages.filter(
      m => m.conversationId !== conversationId
    );

    await dbMessages.write();
  }

  /**
   * Count messages in a conversation
   */
  async countByConversation(conversationId) {
    const messages = await this.findByConversation(conversationId);
    return messages.length;
  }
}

export default new MessageStore();

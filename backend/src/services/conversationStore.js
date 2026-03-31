import { dbConversations, generateId, getTimestamp } from './database.js';
import { Conversation } from '../models/Conversation.js';

/**
 * ConversationStore - handles conversation data access
 */
class ConversationStore {
  /**
   * Create a new conversation
   */
  async create(data = {}) {
    await dbConversations.read();

    const conversation = new Conversation(data);
    const validation = conversation.validate();

    if (!validation.valid) {
      throw new Error(`Invalid conversation: ${validation.errors.join(', ')}`);
    }

    dbConversations.data.conversations.push(conversation.toJSON());
    await dbConversations.write();

    return conversation.toJSON();
  }

  /**
   * Find conversation by ID
   */
  async findById(id) {
    await dbConversations.read();
    return dbConversations.data.conversations.find(c => c.id === id);
  }

  /**
   * Find all conversations
   */
  async findAll(options = {}) {
    await dbConversations.read();

    let conversations = dbConversations.data.conversations.sort(
      (a, b) => b.updatedAt.localeCompare(a.updatedAt)
    );

    // Add last message preview
    const { dbMessages } = await import('./database.js');
    await dbMessages.read();

    conversations = conversations.map(c => ({
      ...c,
      lastMessage: dbMessages.data.messages
        .filter(m => m.conversationId === c.id)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0],
    }));

    return conversations;
  }

  /**
   * Update conversation
   */
  async update(id, updates) {
    await dbConversations.read();

    const index = dbConversations.data.conversations.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Conversation not found');
    }

    const conversation = new Conversation({
      ...dbConversations.data.conversations[index],
      ...updates,
      id, // Preserve ID
      createdAt: dbConversations.data.conversations[index].createdAt, // Preserve created date
    });

    const validation = conversation.validate();
    if (!validation.valid) {
      throw new Error(`Invalid conversation: ${validation.errors.join(', ')}`);
    }

    dbConversations.data.conversations[index] = conversation.toJSON();
    await dbConversations.write();

    return conversation.toJSON();
  }

  /**
   * Delete conversation
   */
  async delete(id) {
    await dbConversations.read();

    const index = dbConversations.data.conversations.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Conversation not found');
    }

    dbConversations.data.conversations.splice(index, 1);
    await dbConversations.write();

    // Cascade delete messages
    const { dbMessages } = await import('./database.js');
    await dbMessages.read();
    dbMessages.data.messages = dbMessages.data.messages.filter(m => m.conversationId !== id);
    await dbMessages.write();
  }

  /**
   * Touch (update timestamp)
   */
  async touch(id) {
    return this.update(id, { updatedAt: getTimestamp() });
  }

  /**
   * Increment message count
   */
  async incrementMessageCount(id) {
    const conv = await this.findById(id);
    if (!conv) {
      throw new Error('Conversation not found');
    }
    return this.update(id, { messageCount: conv.messageCount + 1 });
  }

  /**
   * Update title
   */
  async updateTitle(id, title) {
    return this.update(id, { title });
  }
}

const conversationStore = new ConversationStore();
export default conversationStore;

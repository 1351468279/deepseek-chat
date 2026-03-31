import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../data');

// Initialize lowdb with conversations and messages
const adapterConversations = new JSONFile(path.join(dataDir, 'conversations.json'));
const adapterMessages = new JSONFile(path.join(dataDir, 'messages.json'));

export const dbConversations = new Low(adapterConversations, { conversations: [] });
export const dbMessages = new Low(adapterMessages, { messages: [] });

// Initialize databases with default structure
export async function initializeDatabase() {
  await dbConversations.read();
  await dbMessages.read();

  if (!dbConversations.data.conversations) {
    dbConversations.data = { conversations: [] };
  }
  if (!dbMessages.data.messages) {
    dbMessages.data = { messages: [] };
  }

  await dbConversations.write();
  await dbMessages.write();
}

// Helper to generate UUID
export function generateId() {
  return crypto.randomUUID();
}

// Helper to get current timestamp
export function getTimestamp() {
  return new Date().toISOString();
}

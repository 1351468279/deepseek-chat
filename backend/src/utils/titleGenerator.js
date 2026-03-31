/**
 * titleGenerator - generates conversation titles from first message
 */

/**
 * Generate a title from the first message
 */
export function generateTitle(firstMessage) {
  const maxLength = 40;

  if (!firstMessage || firstMessage.length === 0) {
    return 'New Chat';
  }

  if (firstMessage.length <= maxLength) {
    return firstMessage;
  }

  // Truncate at word boundary
  const truncated = firstMessage.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Generate title from conversation (uses first message)
 */
export async function generateTitleFromConversation(conversationId) {
  const { dbMessages } = await import('../services/database.js');
  await dbMessages.read();

  const messages = dbMessages.data.messages
    .filter(m => m.conversationId === conversationId && m.role === 'user')
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  if (messages.length > 0) {
    return generateTitle(messages[0].content);
  }

  return 'New Chat';
}

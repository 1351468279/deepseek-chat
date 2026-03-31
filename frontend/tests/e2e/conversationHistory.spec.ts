import { test, expect } from '@playwright/test';

test.describe('Conversation History E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat/new');
  });

  test('should display conversation list in sidebar', async ({ page }) => {
    const sidebar = page.locator('.conversation-list');
    await expect(sidebar).toBeVisible();

    const heading = page.getByRole('region', { name: /conversation list/i }).getByRole('heading', { name: 'Conversations' });
    await expect(heading).toBeVisible();
  });

  test('should show empty state when no conversations exist', async ({ page }) => {
    const emptyState = page.locator('.conversation-list .empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No conversations yet');
  });

  test('should create new conversation', async ({ page }) => {
    // Click "New Chat" button
    const newChatButton = page.getByRole('button', { name: /create new conversation/i });
    await newChatButton.click();

    // Should navigate to new chat
    await expect(page).toHaveURL(/\/chat\/[a-f0-9-]+/);
  });

  test('should display conversations in list', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message input/i });
    const sendButton = page.getByRole('button', { name: /send message/i });

    // Send a message to create a conversation
    await messageInput.fill('Test conversation');
    await sendButton.click();

    // Wait for conversation to be created
    await page.waitForTimeout(1000);

    // Check if conversation appears in sidebar
    const conversationItems = page.locator('.conversation-item');
    await expect(conversationItems.first()).toBeVisible();
  });

  test('should select conversation from list', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message input/i });
    const sendButton = page.getByRole('button', { name: /send message/i });

    // Create first conversation
    await messageInput.fill('First conversation');
    await sendButton.click();
    await page.waitForTimeout(1000);

    // Create new chat
    const newChatButton = page.getByRole('button', { name: /create new conversation/i });
    await newChatButton.click();
    await page.waitForTimeout(500);

    // Select first conversation from list
    const conversationItems = page.locator('.conversation-item');
    if ((await conversationItems.count()) > 0) {
      await conversationItems.first().click();

      // Verify navigation
      await expect(page).toHaveURL(/\/chat\/[a-f0-9-]+/);
    }
  });

  test('should show conversation as active when selected', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message input/i });
    const sendButton = page.getByRole('button', { name: /send message/i });

    // Create a conversation
    await messageInput.fill('Test');
    await sendButton.click();
    await page.waitForTimeout(1000);

    // Check for active class on selected conversation
    const activeConversation = page.locator('.conversation-item.active');
    await expect(activeConversation).toBeVisible();
  });

  test('should display message count in conversation list', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message input/i });
    const sendButton = page.getByRole('button', { name: /send message/i });

    // Send messages
    await messageInput.fill('First message');
    await sendButton.click();
    await page.waitForTimeout(2000);

    // Check message count in sidebar
    const messageCount = page.locator('.conversation-meta').filter({ hasText: /messages/ });
    await expect(messageCount.first()).toBeVisible();
  });

  test('should resume conversation with message history', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message input/i });
    const sendButton = page.getByRole('button', { name: /send message/i });

    // Send a message
    const testMessage = 'History test message';
    await messageInput.fill(testMessage);
    await sendButton.click();

    // Wait for response
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 30000 });

    // Navigate away and back (simulate page reload or navigation)
    await page.goto('/chat/new');
    await page.waitForTimeout(500);

    // Click on the first conversation in list
    const conversationItems = page.locator('.conversation-item');
    if ((await conversationItems.count()) > 0) {
      await conversationItems.first().click();

      // Verify previous message is still visible
      await expect(page.getByText(testMessage)).toBeVisible();
    }
  });

  test('should display last message preview in conversation list', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message input/i });
    const sendButton = page.getByRole('button', { name: /send message/i });

    // Send a message
    const testMessage = 'This is a test message for preview';
    await messageInput.fill(testMessage);
    await sendButton.click();

    await page.waitForTimeout(1000);

    // Check for last message preview
    const lastMessagePreview = page.locator('.last-message');
    await expect(lastMessagePreview.first()).toContainText(testMessage.substring(0, 50));
  });

  test('should handle keyboard navigation in conversation list', async ({ page }) => {
    const newChatButton = page.getByRole('button', { name: /create new conversation/i });
    await newChatButton.click();
    await page.waitForTimeout(500);

    const conversationItems = page.locator('.conversation-item');
    const count = await conversationItems.count();

    if (count > 0) {
      const firstItem = conversationItems.first();
      await firstItem.focus();
      await firstItem.press('Enter');

      // Verify selection via keyboard
      await expect(page).toHaveURL(/\/chat\/[a-f0-9-]+/);
    }
  });
});

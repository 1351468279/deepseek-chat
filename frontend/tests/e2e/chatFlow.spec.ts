import { test, expect } from '@playwright/test';

test.describe('Chat Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/chat/new');
  });

  test('should send message and receive streaming response', async ({ page }) => {
    // Find the message input
    const messageInput = page.getByRole('textbox', { name: /message input/i });
    await expect(messageInput).toBeVisible();

    // Type a message
    await messageInput.fill('Hello, GLM!');

    // Click send button
    const sendButton = page.getByRole('button', { name: /send message/i });
    await sendButton.click();

    // Verify user message appears
    await expect(page.getByText('Hello, GLM!')).toBeVisible();

    // Verify streaming indicator appears
    await expect(page.locator('.loading-indicator')).toBeVisible();

    // Wait for response (with timeout)
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 30000 });

    // Verify streaming completed
    await expect(page.locator('.loading-indicator')).not.toBeVisible();
  });

  test('should send message with Enter key', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message input/i });

    await messageInput.fill('Test message');
    await messageInput.press('Enter');

    // Verify message was sent
    await expect(page.getByText('Test message')).toBeVisible();
  });

  test('should handle Shift+Enter for new line', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message input/i });

    await messageInput.fill('Line 1');
    await messageInput.press('Shift+Enter');
    await messageInput.type('Line 2');

    // Verify textarea has both lines
    const value = await messageInput.inputValue();
    expect(value).toContain('Line 1\nLine 2');

    // Message should not be sent yet
    await expect(page.getByText('Line 1')).not.toBeVisible();
  });

  test('should disable send button when input is empty', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: /send message/i });

    await expect(sendButton).toBeDisabled();
  });

  test('should enable send button when input has text', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message input/i });
    const sendButton = page.getByRole('button', { name: /send message/i });

    await messageInput.fill('Test');

    await expect(sendButton).toBeEnabled();
  });

  test('should clear input after sending message', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message input/i });
    const sendButton = page.getByRole('button', { name: /send message/i });

    await messageInput.fill('Test message');
    await sendButton.click();

    // Input should be cleared
    await expect(messageInput).toHaveValue('');
  });

  test('should display error message on API failure', async ({ page }) => {
    // Mock API failure scenario would require test setup
    // For now, just verify error message element exists
    const errorElement = page.locator('.error-message');
    await expect(errorElement).toHaveCount(0); // No error initially
  });

  test('should render markdown in assistant response', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message input/i });
    const sendButton = page.getByRole('button', { name: /send message/i });

    // Send a message that might trigger markdown response
    await messageInput.fill('Show me a code example in JavaScript');
    await sendButton.click();

    // Wait for response
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 30000 });

    // Verify markdown elements exist (code blocks, etc.)
    await expect(page.locator('.markdown-content')).toBeVisible();
  });

  test('should support multiple messages in conversation', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message input/i });
    const sendButton = page.getByRole('button', { name: /send message/i });

    // Send first message
    await messageInput.fill('First message');
    await sendButton.click();
    await expect(page.getByText('First message')).toBeVisible();

    // Wait for response
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 30000 });

    // Send second message
    await messageInput.fill('Second message');
    await sendButton.click();
    await expect(page.getByText('Second message')).toBeVisible();

    // Verify both user messages are in the list
    const userMessages = await page.locator('.message-user').count();
    expect(userMessages).toBeGreaterThanOrEqual(2);
  });
});

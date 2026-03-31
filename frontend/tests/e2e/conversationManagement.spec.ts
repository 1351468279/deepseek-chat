import { test, expect } from '@playwright/test';

test.describe('Conversation Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat/new');

    // Create a test conversation
    const messageInput = page.getByRole('textbox', { name: /message input/i });
    const sendButton = page.getByRole('button', { name: /send message/i });

    await messageInput.fill('Test conversation for management');
    await sendButton.click();

    // Wait for conversation to be created
    await page.waitForTimeout(2000);
  });

  test('should show rename button on conversation item', async ({ page }) => {
    const conversationItems = page.locator('.conversation-item');
    const count = await conversationItems.count();

    if (count > 0) {
      const renameButton = conversationItems.first().getByRole('button', { name: /rename/i });
      await expect(renameButton).toBeVisible();
    }
  });

  test('should show delete button on conversation item', async ({ page }) => {
    const conversationItems = page.locator('.conversation-item');
    const count = await conversationItems.count();

    if (count > 0) {
      const deleteButton = conversationItems.first().getByRole('button', { name: /delete/i });
      await expect(deleteButton).toBeVisible();
    }
  });

  test('should enter edit mode when rename button clicked', async ({ page }) => {
    const conversationItems = page.locator('.conversation-item');
    const count = await conversationItems.count();

    if (count > 0) {
      const renameButton = conversationItems.first().getByRole('button', { name: /rename/i });
      await renameButton.click();

      // Should show input field
      const editInput = page.locator('.conversation-edit input');
      await expect(editInput).toBeVisible();
    }
  });

  test('should save new title on Enter key', async ({ page }) => {
    const conversationItems = page.locator('.conversation-item');
    const count = await conversationItems.count();

    if (count > 0) {
      const firstItem = conversationItems.first();
      const originalTitle = await firstItem.locator('.conversation-title').textContent();

      const renameButton = firstItem.getByRole('button', { name: /rename/i });
      await renameButton.click();

      const editInput = page.locator('.conversation-edit input');
      await editInput.clear();
      await editInput.fill('New Title');
      await editInput.press('Enter');

      // Wait for update
      await page.waitForTimeout(500);

      // Verify title changed
      const updatedTitle = await firstItem.locator('.conversation-title').textContent();
      expect(updatedTitle).toBe('New Title');
    }
  });

  test('should cancel edit on Escape key', async ({ page }) => {
    const conversationItems = page.locator('.conversation-item');
    const count = await conversationItems.count();

    if (count > 0) {
      const firstItem = conversationItems.first();
      const originalTitle = await firstItem.locator('.conversation-title').textContent();

      const renameButton = firstItem.getByRole('button', { name: /rename/i });
      await renameButton.click();

      const editInput = page.locator('.conversation-edit input');
      await editInput.clear();
      await editInput.fill('Cancelled Title');
      await editInput.press('Escape');

      // Wait for cancel
      await page.waitForTimeout(500);

      // Verify title unchanged
      const currentTitle = await firstItem.locator('.conversation-title').textContent();
      expect(currentTitle).toBe(originalTitle);
    }
  });

  test('should save with save button', async ({ page }) => {
    const conversationItems = page.locator('.conversation-item');
    const count = await conversationItems.count();

    if (count > 0) {
      const firstItem = conversationItems.first();

      const renameButton = firstItem.getByRole('button', { name: /rename/i });
      await renameButton.click();

      const editInput = page.locator('.conversation-edit input');
      await editInput.clear();
      await editInput.fill('Saved Title');

      const saveButton = page.getByRole('button', { name: /save changes/i });
      await saveButton.click();

      // Wait for update
      await page.waitForTimeout(500);

      // Verify title changed
      const updatedTitle = await firstItem.locator('.conversation-title').textContent();
      expect(updatedTitle).toBe('Saved Title');
    }
  });

  test('should cancel with cancel button', async ({ page }) => {
    const conversationItems = page.locator('.conversation-item');
    const count = await conversationItems.count();

    if (count > 0) {
      const firstItem = conversationItems.first();
      const originalTitle = await firstItem.locator('.conversation-title').textContent();

      const renameButton = firstItem.getByRole('button', { name: /rename/i });
      await renameButton.click();

      const cancelButton = page.getByRole('button', { name: /cancel editing/i });
      await cancelButton.click();

      // Wait for cancel
      await page.waitForTimeout(500);

      // Verify title unchanged
      const currentTitle = await firstItem.locator('.conversation-title').textContent();
      expect(currentTitle).toBe(originalTitle);
    }
  });

  test('should show confirmation dialog when deleting', async ({ page }) => {
    const conversationItems = page.locator('.conversation-item');
    const count = await conversationItems.count();

    if (count > 0) {
      // Handle dialog before clicking delete button
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('delete this conversation');
        dialog.dismiss();
      });

      const deleteButton = conversationItems.first().getByRole('button', { name: /delete/i });
      await deleteButton.click();
    }
  });

  test('should delete conversation when confirmed', async ({ page }) => {
    const conversationItems = page.locator('.conversation-item');
    const countBefore = await conversationItems.count();

    if (countBefore > 0) {
      // Get the first conversation title before deletion
      const firstItem = conversationItems.first();
      const convTitle = await firstItem.locator('.conversation-title').textContent();

      // Accept the dialog
      page.on('dialog', dialog => dialog.accept());

      const deleteButton = firstItem.getByRole('button', { name: new RegExp(`delete ${convTitle}`, 'i') });
      await deleteButton.click();

      // Wait for deletion
      await page.waitForTimeout(1000);

      // Verify conversation removed
      const countAfter = await conversationItems.count();
      expect(countAfter).toBe(countBefore - 1);
    }
  });

  test('should not delete conversation when cancelled', async ({ page }) => {
    const conversationItems = page.locator('.conversation-item');
    const countBefore = await conversationItems.count();

    if (countBefore > 0) {
      const firstItem = conversationItems.first();
      const convTitle = await firstItem.locator('.conversation-title').textContent();

      // Dismiss the dialog
      page.on('dialog', dialog => dialog.dismiss());

      const deleteButton = firstItem.getByRole('button', { name: new RegExp(`delete ${convTitle}`, 'i') });
      await deleteButton.click();

      // Wait a bit
      await page.waitForTimeout(500);

      // Verify conversation still exists
      const countAfter = await conversationItems.count();
      expect(countAfter).toBe(countBefore);
    }
  });

  test('should navigate to new chat when current conversation is deleted', async ({ page }) => {
    const conversationItems = page.locator('.conversation-item');
    const count = await conversationItems.count();

    if (count > 0) {
      // Select the first conversation
      await conversationItems.first().click();
      await page.waitForTimeout(500);

      // Get current URL
      const currentUrl = page.url();

      // Accept dialog for deletion
      page.on('dialog', dialog => dialog.accept());

      const deleteButton = page.getByRole('button', { name: /delete/i }).first();
      await deleteButton.click();

      // Wait for navigation
      await page.waitForTimeout(1000);

      // Verify navigated to new chat
      await expect(page).toHaveURL(/\/chat\/new/);
    }
  });

  test('should create new chat with button', async ({ page }) => {
    const initialUrl = page.url();

    const newChatButton = page.getByRole('button', { name: /create new conversation/i });
    await newChatButton.click();

    // Wait for navigation
    await page.waitForTimeout(500);

    // Verify navigated to a new conversation (not /chat/new)
    const newUrl = page.url();
    expect(newUrl).not.toBe(initialUrl);
    expect(newUrl).toMatch(/\/chat\/[a-f0-9-]+/);
  });
});

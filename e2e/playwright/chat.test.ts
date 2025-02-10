import { test, expect } from '@playwright/test';
import { pool } from '../../src/config/database';

test.describe('Chat functionality', () => {
  test.afterAll(async () => {
    try {
      // Clean up database
      await pool.query('TRUNCATE TABLE users CASCADE');
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      await pool.end().catch(console.error);
    }
  });

  test('should show login requirement for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    
    // Check that message input is disabled
    const messageInput = await page.getByTestId('message-input');
    expect(await messageInput.isDisabled()).toBeTruthy();
    
    // Check placeholder text
    expect(await messageInput.getAttribute('placeholder')).toBe('Please log in to send messages');
    
    // Check that send button is disabled
    const sendButton = await page.getByTestId('send-button');
    expect(await sendButton.isDisabled()).toBeTruthy();
  });

  test('should allow sending messages for authenticated users', async ({ page }) => {
    await page.goto('/');
    
    // Login first
    await page.getByTestId('login-button').click();
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('submit-login').click();
    
    // Wait for login to complete
    await expect(page.getByTestId('welcome-message')).toBeVisible();
    
    // Now try to send a message
    const messageInput = await page.getByTestId('message-input');
    await messageInput.fill('Test message');
    await page.getByTestId('send-button').click();
    
    // Check that message appears in the list
    const messageList = await page.getByTestId('message-list');
    await expect(messageList).toContainText('Test message');
    
    // Check for system response
    await expect(messageList).toContainText('Message from testuser accepted');
  });

  test('should persist authentication state on refresh', async ({ page }) => {
    await page.goto('/');
    
    // Login
    await page.getByTestId('login-button').click();
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('submit-login').click();
    
    // Wait for login to complete
    await expect(page.getByTestId('welcome-message')).toBeVisible();
    
    // Refresh page
    await page.reload();
    
    // Check that we're still logged in
    await expect(page.getByTestId('welcome-message')).toBeVisible();
    
    // Verify we can still send messages
    const messageInput = await page.getByTestId('message-input');
    expect(await messageInput.isDisabled()).toBeFalsy();
  });

  test('should clear authentication state on logout', async ({ page }) => {
    await page.goto('/');
    
    // Login
    await page.getByTestId('login-button').click();
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('submit-login').click();
    
    // Wait for login to complete
    await expect(page.getByTestId('welcome-message')).toBeVisible();
    
    // Logout
    await page.getByTestId('logout-button').click();
    
    // Verify we're logged out
    await expect(page.getByTestId('login-button')).toBeVisible();
    
    // Verify message input is disabled
    const messageInput = await page.getByTestId('message-input');
    expect(await messageInput.isDisabled()).toBeTruthy();
  });
}); 
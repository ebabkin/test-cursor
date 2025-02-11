import { test, expect } from '@playwright/test';
import { pool } from '../../src/config/database';
import bcrypt from 'bcrypt';

// Import UI test user constants
const UI_TEST_USER = {
  email: 'uitest@example.com',
  nickname: 'uitest',
  password: 'password123'
};

test.describe('Chat functionality', () => {
  test.beforeAll(async () => {
    try {
      // Ensure test user exists before running tests
      const hashedPassword = await bcrypt.hash(UI_TEST_USER.password, 10);
      await pool.query(
        'INSERT INTO users (id, nickname, email, password) VALUES (gen_random_uuid(), $1, $2, $3) ON CONFLICT (email) DO NOTHING',
        [UI_TEST_USER.nickname, UI_TEST_USER.email, hashedPassword]
      );
    } catch (error) {
      console.error('Error during test user setup:', error);
    }
  });

  test.afterAll(async () => {
    try {
      // Note: We specifically delete only test-related data instead of truncating the whole table
      // to avoid affecting production data during tests
      await pool.query('DELETE FROM users WHERE email = $1', [UI_TEST_USER.email]);
      await pool.end().catch(console.error);
    } catch (error) {
      console.error('Error during cleanup:', error);
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
    await page.getByTestId('email-input').fill(UI_TEST_USER.email);
    await page.getByTestId('password-input').fill(UI_TEST_USER.password);
    await page.getByTestId('submit-login').click();
    
    // Wait for login to complete
    await expect(page.getByTestId('welcome-message')).toBeVisible();
    
    // Now try to send a message
    const messageInput = await page.getByTestId('message-input');
    await messageInput.fill('Test message UI test');
    await page.getByTestId('send-button').click();
    
    // Check that message appears in the list
    const messageList = await page.getByTestId('message-list');
    await expect(messageList).toContainText('Test message UI test');
    
    // Check for system response
    await expect(messageList).toContainText(`Message from ${UI_TEST_USER.nickname} accepted`);
  });

  test('should persist authentication state on refresh', async ({ page }) => {
    await page.goto('/');
    
    // Login
    await page.getByTestId('login-button').click();
    await page.getByTestId('email-input').fill(UI_TEST_USER.email);
    await page.getByTestId('password-input').fill(UI_TEST_USER.password);
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
    await page.getByTestId('email-input').fill(UI_TEST_USER.email);
    await page.getByTestId('password-input').fill(UI_TEST_USER.password);
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
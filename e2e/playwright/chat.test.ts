import { test, expect } from '@playwright/test';
import { pool } from '../../src/config/database';
import bcrypt from 'bcrypt';

test.describe('Chat functionality', () => {
  test.beforeAll(async () => {
    // Create test user
    await pool.query(
      'DELETE FROM USERS WHERE nickname= $1',
      ['testuser']
    );
    const hashedPassword = await bcrypt.hash('password123', 10);
    await pool.query(
      'INSERT INTO users (nickname, email, password) VALUES ($1, $2, $3)',
      ['testuser', 'test@example.com', hashedPassword]
    );
  });

  test.afterAll(async () => {
    await pool.query('TRUNCATE TABLE users CASCADE');
    await pool.end();
  });

  test('anonymous user can send and receive messages', async ({ page }) => {
    await page.goto('/');
    
    // Type and send a message
    await page.fill('[data-testid="message-input"]', 'Hello, World!');
    await page.click('[data-testid="send-button"]');
    
    // Verify message appears
    await expect(page.locator('text="Hello, World!"')).toBeVisible();
    
    // Verify system response includes "Anonymous"
    await expect(page.locator('text=/Message from Anonymous accepted/')).toBeVisible();
  });

  test('authenticated user can send and receive messages', async ({ page }) => {
    await page.goto('/');
    
    // Login with the created test user
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="submit-login"]');
    
    // Wait for login success and welcome message
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible({ timeout: 10000 });
    
    // Send message
    await page.fill('[data-testid="message-input"]', 'Hello from testuser!');
    await page.click('[data-testid="send-button"]');
    
    // Verify message appears with correct user info
    await expect(page.locator('text="Hello from testuser!"')).toBeVisible();
    await expect(page.locator('text=/Message from testuser accepted/')).toBeVisible();
  });

  test('empty messages cannot be sent', async ({ page }) => {
    await page.goto('/');
    
    // Get initial message count
    const initialMessages = await page.locator('[data-testid="message-list"] > div').all();
    const initialCount = initialMessages.length;
    
    // Try to send empty message
    await page.click('[data-testid="send-button"]');
    
    // Wait a bit to ensure no message is added
    await page.waitForTimeout(1000);
    
    // Verify no new messages appear
    const currentMessages = await page.locator('[data-testid="message-list"] > div').all();
    expect(currentMessages.length).toBe(initialCount);
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('Chat functionality', () => {
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
    
    // Login
    await page.click('text=Login');
    await page.fill('text=Email or Nickname', 'testuser');
    await page.fill('text=Password', 'password123');
    await page.click('button:text("Login")');
    
    // Verify login success
    await expect(page.locator('text=Welcome, testuser!')).toBeVisible();
    
    // Send message
    await page.fill('[data-testid="message-input"]', 'Hello from testuser!');
    await page.click('[data-testid="send-button"]');
    
    // Verify message appears with correct user info
    await expect(page.locator('text="Hello from testuser!"')).toBeVisible();
    await expect(page.locator('text=/Message from testuser accepted/')).toBeVisible();
  });
});

test('empty messages cannot be sent', async ({ page }) => {
  await page.goto('/');
  
  // Try to send empty message
  await page.click('[data-testid="send-button"]');
  
  // Verify no messages appear
  await expect(page.locator('.MuiPaper-root >> nth=1')).toHaveCount(0);
}); 
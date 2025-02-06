import { test, expect } from '@playwright/test';

test('user can send and receive messages', async ({ page }) => {
  await page.goto('/');
  
  // Type and send a message
  await page.fill('[data-testid="message-input"]', 'Hello, World!');
  await page.click('[data-testid="send-button"]');
  
  // Verify message appears
  await expect(page.locator('text="Hello, World!"')).toBeVisible();
  
  // Verify system response (using partial text match)
  await expect(page.locator('text=/Message accepted/')).toBeVisible();
  
  // Optional: Add a longer timeout if needed
  // await expect(page.locator('text=/Message accepted/')).toBeVisible({ timeout: 10000 });
});

test('empty messages cannot be sent', async ({ page }) => {
  await page.goto('/');
  
  // Try to send empty message
  await page.click('[data-testid="send-button"]');
  
  // Verify no messages appear
  await expect(page.locator('.MuiPaper-root >> nth=1')).toHaveCount(0);
}); 
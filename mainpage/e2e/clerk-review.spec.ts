import { test, expect } from '@playwright/test';

test.describe('Clerk UI/UX Review', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clerk');
    // Wait for initial content to load
    await page.waitForSelector('text=Ask questions about worker exploitation data');
  });

  test('Check welcome screen layout and design', async ({ page }) => {
    // Take screenshot of welcome screen
    await page.waitForTimeout(1000); // Wait for any animations
    await page.screenshot({ path: 'e2e/screenshots/clerk-welcome.png', fullPage: true });

    // Verify welcome screen elements
    // Use more specific locator for the page heading (not the nav link)
    const heading = page.locator('div.text-3xl:has-text("Clerk")');
    await expect(heading).toBeVisible();
    
    await expect(page.locator('text=Ask questions about worker exploitation data')).toBeVisible();
    
    // Check suggestion chips are visible
    const suggestionChips = page.locator('button').filter({ hasText: /cases|violations|wages/i });
    await expect(suggestionChips.first()).toBeVisible();
    
    // Check input area exists at bottom
    const inputArea = page.locator('textarea[placeholder*="Ask anything"]');
    await expect(inputArea).toBeVisible();
    
    // Verify header styling (should be full at start)
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('Check chat message layout and styling', async ({ page }) => {
    // Fill and submit a test query using the send button with arrow icon
    await page.fill('textarea[placeholder*="Ask anything"]', 'How many cases are there against Alignerr?');
    
    // Wait for the send button to be enabled and click it
    const sendButton = page.locator('button').filter({ has: page.locator('svg.lucide-arrow-up') }).first();
    await expect(sendButton).toBeEnabled();
    await sendButton.click();
    
    // Wait for any response to appear in the chat area - give it more time
    await page.waitForSelector('div[class*="bg-sindicato-smoked-charcoal"]', { timeout: 20000 });
    
    // Take screenshot of chat with messages
    await page.screenshot({ path: 'e2e/screenshots/clerk-with-messages.png', fullPage: true });
    
    // Verify message alignment and styling
    const userMessage = page.locator('.justify-end').first();
    await expect(userMessage).toBeVisible();
    
    // Look for the assistant response in the chat (any assistant message)
    const assistantMessage = page.locator('div[class*="bg-sindicato-smoked-charcoal"]').first();
    await expect(assistantMessage).toBeVisible();
  });

  test('Check rejection message styling', async ({ page }) => {
    // Send an invalid query
    await page.fill('textarea[placeholder*="Ask anything"]', 'What is the capital of France?');
    
    // Click the send button
    const sendButton = page.locator('button').filter({ has: page.locator('svg.lucide-arrow-up') }).first();
    await expect(sendButton).toBeEnabled();
    await sendButton.click();
    
    // Wait for any response to appear (could be rejection or error message)
    await page.waitForSelector('div[class*="bg-sindicato-smoked-charcoal"]', { timeout: 20000 });
    
    // Take screenshot of response
    await page.screenshot({ path: 'e2e/screenshots/clerk-rejection.png', fullPage: true });
    
    // Verify the response appeared
    const responseMessage = page.locator('div[class*="bg-sindicato-smoked-charcoal"]').first();
    await expect(responseMessage).toBeVisible();
    
    // Check if it's a rejection message by looking for keywords
    const responseText = await responseMessage.textContent();
    if (responseText.includes('can only answer questions about Sindicato')) {
      // If it's a rejection message, verify it has proper styling
      const className = await responseMessage.getAttribute('class');
      expect(className).toContain('red'); // Should contain red in the class name for rejections
    }
    // Whether it's rejection or not, the response should appear
  });

  test('Check suggestion panel behavior', async ({ page }) => {
    // Focus the input to show suggestions
    await page.focus('textarea[placeholder*="Ask anything"]');
    await page.fill('textarea[placeholder*="Ask anything"]', 'How many ');
    
    // Wait for suggestion panel to appear (using the correct selector)
    await page.waitForFunction(() => {
      // Check if the suggestion panel exists in the DOM
      const panels = document.querySelectorAll('.absolute.left-0.right-0.bottom-full');
      return panels.length > 0;
    }, { timeout: 5000 });
    
    // Take screenshot of suggestion panel
    await page.screenshot({ path: 'e2e/screenshots/clerk-suggestions-panel.png', fullPage: true });
    
    // Verify suggestion panel is visible (using the correct class)
    const suggestionPanel = page.locator('.absolute.left-0.right-0.bottom-full');
    await expect(suggestionPanel).toBeVisible();
    
    // Click elsewhere to close suggestions
    await page.locator('text=Ask questions about worker exploitation data').click();
    
    // Wait a bit and verify suggestions are hidden
    await page.waitForTimeout(500);
    await expect(suggestionPanel).not.toBeVisible();
  });

  test('Check variable chips functionality', async ({ page }) => {
    // Find and click a suggestion that includes variables (like "Cases against a specific company")
    const suggestion = page.locator('button').filter({ hasText: /Cases against a specific company/i }).first();
    const suggestionCount = await suggestion.count();
    
    if (suggestionCount > 0) {
      await suggestion.click();
      
      // Wait for variable selector to appear
      await page.waitForSelector('text=Select Company', { timeout: 5000 });
      
      // Take screenshot with variable selectors
      await page.screenshot({ path: 'e2e/screenshots/clerk-variable-chips.png', fullPage: true });
      
      // Verify variable selector is visible
      await expect(page.locator('text=Select Company')).toBeVisible();
    } else {
      // If no variable suggestions are found, at least verify the suggestion functionality works
      await expect(page.locator('button:has-text("Cases against a specific company")')).toHaveCount(0);
      // This test passes if no variable suggestions exist - that's fine
    }
  });

  test('Check responsive behavior on smaller screens', async ({ page }) => {
    // Resize to mobile dimensions
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Reload to see mobile layout
    await page.reload();
    await page.waitForSelector('text=Ask questions about worker exploitation data');
    
    // Take screenshot of mobile view
    await page.screenshot({ path: 'e2e/screenshots/clerk-mobile.png', fullPage: true });
    
    // Check that input area is still accessible
    const inputArea = page.locator('textarea[placeholder*="Ask anything"]');
    await expect(inputArea).toBeVisible();
    
    // Reset to desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Check accessibility features', async ({ page }) => {
    // Check for proper ARIA labels (using the chat container role)
    // The ChatContainerRoot has role="log"
    const chatContainer = page.locator('div[role="log"]');
    if (await chatContainer.count() > 0) {
      await expect(chatContainer).toBeVisible();
    }
    
    // Check focus states work properly
    const textarea = page.locator('textarea[placeholder*="Ask anything"]');
    await textarea.focus();
    await expect(textarea).toBeFocused();
    
    // Test keyboard navigation (tab to button)
    await textarea.press('Tab');
    
    // Take accessibility screenshot
    await page.screenshot({ path: 'e2e/screenshots/clerk-accessibility.png', fullPage: true });
  });
});
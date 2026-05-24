import { test, expect } from '@playwright/test';

test('Explore Clerk Page Structure', async ({ page }) => {
  await page.goto('/clerk');
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  // Take a screenshot of the page
  await page.screenshot({ path: 'e2e/screenshots/clerk-explore.png', fullPage: true });
  
  // Get and print the HTML structure
  const html = await page.content();
  console.log('Page HTML structure:');
  
  // Look for specific elements
  const hasClerkHeading = await page.locator('text=Clerk').count();
  console.log(`Found "Clerk" text instances: ${hasClerkHeading}`);
  
  const hasWelcomeText = await page.locator('text=Ask questions about worker exploitation data').count();
  console.log(`Found "Ask questions" text instances: ${hasWelcomeText}`);
  
  const textareas = await page.locator('textarea').count();
  console.log(`Number of textareas: ${textareas}`);
  
  const buttons = await page.locator('button').count();
  console.log(`Number of buttons: ${buttons}`);
  
  const hasArrowButton = await page.locator('svg.lucide-arrow-up').count();
  console.log(`Number of arrow up icons: ${hasArrowButton}`);
  
  // Try to identify the send button
  const sendButtons = page.locator('button').filter({ has: page.locator('svg.lucide-arrow-up') });
  console.log(`Send buttons found: ${await sendButtons.count()}`);
  
  // Wait to see the results
  await page.waitForTimeout(5000);
});
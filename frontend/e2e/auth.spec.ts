import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should redirect to login page when not authenticated', async ({ page }) => {
    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/auth\/signin/);

    // Should show login form
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in invalid credentials
    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should login successfully with valid admin credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in valid admin credentials
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'admin');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Should show user info or dashboard content
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Click logout button
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/auth\/signin/);
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Refresh the page
    await page.reload();

    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should protect authenticated routes', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/auth\/signin/);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API calls and simulate network error
    await page.route('**/api/auth/login', route => {
      route.abort('failed');
    });

    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');

    // Should show network error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      /network|connection|error/i
    );
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in invalid email format
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password');

    // Try to submit
    await page.click('button[type="submit"]');

    // Should show validation error
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('should require password field', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in email but leave password empty
    await page.fill('input[name="email"]', 'admin@test.com');

    // Try to submit
    await page.click('button[type="submit"]');

    // Should show validation error for password
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute('required');
  });

  test('should show loading state during authentication', async ({ page }) => {
    // Intercept API call to add delay
    await page.route('**/api/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'admin');

    // Click submit and check for loading state
    await page.click('button[type="submit"]');

    // Should show loading indicator
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

    // Button should be disabled during loading
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });
});

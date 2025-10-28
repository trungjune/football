import { test, expect } from '@playwright/test';

test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should display mobile navigation', async ({ page }) => {
    await page.goto('/dashboard');

    // Mobile menu button should be visible
    const mobileMenuButton = page
      .getByRole('button')
      .filter({ has: page.locator('svg') })
      .first();
    await expect(mobileMenuButton).toBeVisible();

    // Desktop sidebar should be hidden
    await expect(page.getByText('⚽ FC Manager')).not.toBeVisible();
  });

  test('should open mobile navigation menu', async ({ page }) => {
    await page.goto('/dashboard');

    // Click mobile menu button
    const mobileMenuButton = page
      .getByRole('button')
      .filter({ has: page.locator('svg') })
      .first();
    await mobileMenuButton.click();

    // Mobile menu should open
    await expect(page.getByText('⚽ FC Manager')).toBeVisible();
    await expect(page.getByText('Thành viên')).toBeVisible();
    await expect(page.getByText('Buổi tập')).toBeVisible();
  });

  test('should navigate using mobile menu', async ({ page }) => {
    await page.goto('/dashboard');

    // Open mobile menu
    const mobileMenuButton = page
      .getByRole('button')
      .filter({ has: page.locator('svg') })
      .first();
    await mobileMenuButton.click();

    // Navigate to members
    await page.getByText('Thành viên').click();

    await expect(page).toHaveURL('/members');
  });

  test('should have responsive layout on members page', async ({ page }) => {
    await page.goto('/members');

    // Check if page is responsive
    await expect(page.getByText('Quản lý thành viên')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thêm thành viên' })).toBeVisible();
  });

  test('should have responsive forms', async ({ page }) => {
    await page.goto('/members');

    await page.getByRole('button', { name: 'Thêm thành viên' }).click();

    // Form should be responsive
    await expect(page.getByText('Thêm thành viên mới')).toBeVisible();
    await expect(page.getByLabelText('Email *')).toBeVisible();
  });

  test('should display PWA install prompt elements', async ({ page }) => {
    await page.goto('/dashboard');

    // PWA elements should be present (even if not visible)
    const head = page.locator('head');
    await expect(head.locator('meta[name="theme-color"]')).toHaveCount(1);
    await expect(head.locator('link[rel="manifest"]')).toHaveCount(1);
  });

  test('should have touch-friendly buttons', async ({ page }) => {
    await page.goto('/members');

    const addButton = page.getByRole('button', { name: 'Thêm thành viên' });

    // Button should be large enough for touch
    const boundingBox = await addButton.boundingBox();
    expect(boundingBox?.height).toBeGreaterThan(40); // Minimum touch target size
  });

  test('should handle orientation change', async ({ page }) => {
    await page.goto('/dashboard');

    // Simulate landscape orientation
    await page.setViewportSize({ width: 667, height: 375 });

    // Page should still be functional
    await expect(page.getByText('Dashboard')).toBeVisible();
  });
});

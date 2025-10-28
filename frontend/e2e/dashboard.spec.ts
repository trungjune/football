import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/auth/signin');

    // Fill login form with demo credentials
    await page.getByPlaceholder('admin@football.com').fill('admin@football.com');
    await page.getByPlaceholder('••••••••').fill('admin123');

    // Note: In a real test, you'd need to mock the API or have a test database
    // For now, we'll just test the UI components
  });

  test('should display dashboard statistics', async ({ page }) => {
    await page.goto('/dashboard');

    // Check if dashboard elements are visible
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Tổng thành viên')).toBeVisible();
    await expect(page.getByText('Buổi tập sắp tới')).toBeVisible();
    await expect(page.getByText('Doanh thu tháng')).toBeVisible();
    await expect(page.getByText('Tỷ lệ tham gia')).toBeVisible();
  });

  test('should display recent activities', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText('Hoạt động gần đây')).toBeVisible();
    await expect(page.getByText('Buổi tập sắp tới')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/dashboard');

    // Test sidebar navigation
    await expect(page.getByText('⚽ FC Manager')).toBeVisible();
    await expect(page.getByText('Thành viên')).toBeVisible();
    await expect(page.getByText('Buổi tập')).toBeVisible();
    await expect(page.getByText('Tài chính')).toBeVisible();
    await expect(page.getByText('Chia đội')).toBeVisible();
  });

  test('should navigate to members page', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByText('Thành viên').click();

    await expect(page).toHaveURL('/members');
  });

  test('should navigate to sessions page', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByText('Buổi tập').click();

    await expect(page).toHaveURL('/sessions');
  });

  test('should navigate to finance page', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByText('Tài chính').click();

    await expect(page).toHaveURL('/finance');
  });

  test('should have theme toggle', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for theme toggle button (moon/sun icon)
    const themeButton = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first();
    await expect(themeButton).toBeVisible();
  });

  test('should have notification center', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for notification bell icon
    const notificationButton = page.getByRole('button').filter({ has: page.locator('svg') });
    await expect(notificationButton.first()).toBeVisible();
  });
});

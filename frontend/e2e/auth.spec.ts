import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/signin');

    await expect(page).toHaveTitle(/FC Manager/);
    await expect(page.getByText('Đăng nhập vào hệ thống quản lý đội bóng')).toBeVisible();
    await expect(page.getByPlaceholder('admin@football.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/signin');

    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    // Form should not submit without required fields
    await expect(page).toHaveURL('/auth/signin');
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/auth/signin');

    await page.getByText('Đăng ký ngay').click();

    await expect(page).toHaveURL('/auth/signup');
    await expect(page.getByText('Đăng ký tài khoản mới')).toBeVisible();
  });

  test('should display signup form correctly', async ({ page }) => {
    await page.goto('/auth/signup');

    await expect(page.getByText('Đăng ký tài khoản mới')).toBeVisible();
    await expect(page.getByLabelText('Email *')).toBeVisible();
    await expect(page.getByLabelText('Họ và tên *')).toBeVisible();
    await expect(page.getByLabelText('Vị trí thi đấu *')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Đăng ký' })).toBeVisible();
  });

  test('should validate signup form', async ({ page }) => {
    await page.goto('/auth/signup');

    // Try to submit without required fields
    await page.getByRole('button', { name: 'Đăng ký' }).click();

    // Form should not submit
    await expect(page).toHaveURL('/auth/signup');
  });

  test('should validate password confirmation', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.getByLabelText('Email *').fill('test@example.com');
    await page.getByLabelText('Họ và tên *').fill('Test User');
    await page.getByLabelText('Mật khẩu *').fill('password123');
    await page.getByLabelText('Xác nhận mật khẩu *').fill('differentpassword');

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.getByText('Mật khẩu xác nhận không khớp')).toBeVisible();
  });
});

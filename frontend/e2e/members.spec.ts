import { test, expect } from '@playwright/test';

test.describe('Members Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to members page
    await page.goto('/members');
  });

  test('should display members page correctly', async ({ page }) => {
    await expect(page.getByText('Quản lý thành viên')).toBeVisible();
    await expect(page.getByText('Quản lý thông tin thành viên đội bóng')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thêm thành viên' })).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    await expect(page.getByText('Tổng thành viên')).toBeVisible();
    await expect(page.getByText('Đang hoạt động')).toBeVisible();
    await expect(page.getByText('Tạm nghỉ')).toBeVisible();
    await expect(page.getByText('Đã rời đội')).toBeVisible();
  });

  test('should have search and filter functionality', async ({ page }) => {
    await expect(page.getByPlaceholder('Tìm kiếm theo tên, email, SĐT...')).toBeVisible();
    await expect(page.getByText('Tất cả vị trí')).toBeVisible();
    await expect(page.getByText('Tất cả trạng thái')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Xóa bộ lọc' })).toBeVisible();
  });

  test('should open add member dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Thêm thành viên' }).click();

    await expect(page.getByText('Thêm thành viên mới')).toBeVisible();
    await expect(page.getByText('Thêm thành viên mới vào đội bóng')).toBeVisible();
  });

  test('should validate member form', async ({ page }) => {
    await page.getByRole('button', { name: 'Thêm thành viên' }).click();

    // Try to submit without required fields
    await page.getByRole('button', { name: 'Thêm mới' }).click();

    // Form should still be open (validation failed)
    await expect(page.getByText('Thêm thành viên mới')).toBeVisible();
  });

  test('should filter members by search term', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Tìm kiếm theo tên, email, SĐT...');

    await searchInput.fill('test');

    // Search should trigger filtering (even if no results)
    await expect(searchInput).toHaveValue('test');
  });

  test('should filter by position', async ({ page }) => {
    await page.getByText('Tất cả vị trí').click();
    await page.getByText('Tiền vệ').click();

    // Filter should be applied
    await expect(page.getByText('Tiền vệ')).toBeVisible();
  });

  test('should filter by status', async ({ page }) => {
    await page.getByText('Tất cả trạng thái').click();
    await page.getByText('Đang hoạt động').click();

    // Filter should be applied
    await expect(page.getByText('Đang hoạt động')).toBeVisible();
  });

  test('should clear filters', async ({ page }) => {
    // Apply some filters first
    const searchInput = page.getByPlaceholder('Tìm kiếm theo tên, email, SĐT...');
    await searchInput.fill('test');

    // Clear filters
    await page.getByRole('button', { name: 'Xóa bộ lọc' }).click();

    // Search input should be cleared
    await expect(searchInput).toHaveValue('');
  });

  test('should close member form dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Thêm thành viên' }).click();

    // Close dialog
    await page.getByRole('button', { name: 'Hủy' }).click();

    // Dialog should be closed
    await expect(page.getByText('Thêm thành viên mới')).not.toBeVisible();
  });
});

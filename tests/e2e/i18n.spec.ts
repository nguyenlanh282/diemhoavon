import { test, expect } from '@playwright/test'

test.describe('Internationalization', () => {
  test('should display Vietnamese login page', async ({ page }) => {
    await page.goto('/vi/login')

    await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    await expect(page.getByText(/chưa có tài khoản/i)).toBeVisible()
  })

  test('should display English login page', async ({ page }) => {
    await page.goto('/en/login')

    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
    await expect(page.getByText(/don't have an account/i)).toBeVisible()
  })

  test('should switch language via language switcher on login page', async ({ page }) => {
    await page.goto('/vi/login')

    // Find and click EN button
    await page.getByRole('button', { name: 'EN' }).click()

    // Should redirect to English
    await expect(page).toHaveURL(/\/en\/login/)
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
  })

  test('should switch from English to Vietnamese', async ({ page }) => {
    await page.goto('/en/login')

    // Find and click VI button
    await page.getByRole('button', { name: 'VI' }).click()

    // Should redirect to Vietnamese
    await expect(page).toHaveURL(/\/vi\/login/)
    await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
  })

  test('should maintain language after navigation to register', async ({ page }) => {
    await page.goto('/vi/login')

    await page.getByRole('link', { name: /đăng ký/i }).click()

    // Should stay in Vietnamese
    await expect(page).toHaveURL(/\/vi\/register/)
    await expect(page.getByRole('heading', { name: /tạo tài khoản/i })).toBeVisible()
  })

  test('should display Vietnamese register form labels', async ({ page }) => {
    await page.goto('/vi/register')

    await expect(page.getByText(/họ tên/i)).toBeVisible()
    await expect(page.getByText(/email/i)).toBeVisible()
    await expect(page.getByText(/mật khẩu/i)).toBeVisible()
    await expect(page.getByText(/tên tổ chức/i)).toBeVisible()
  })

  test('should display English register form labels', async ({ page }) => {
    await page.goto('/en/register')

    await expect(page.getByText(/name/i)).toBeVisible()
    await expect(page.getByText(/email/i)).toBeVisible()
    await expect(page.getByText(/password/i)).toBeVisible()
    await expect(page.getByText(/organization name/i)).toBeVisible()
  })
})

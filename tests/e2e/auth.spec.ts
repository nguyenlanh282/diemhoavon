import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show login page in Vietnamese', async ({ page }) => {
    await page.goto('/vi/login')

    await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    await expect(page.getByPlaceholder('email@example.com')).toBeVisible()
  })

  test('should show login page in English', async ({ page }) => {
    await page.goto('/en/login')

    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/vi/login')

    await page.getByRole('link', { name: /đăng ký/i }).click()

    await expect(page).toHaveURL(/\/vi\/register/)
  })

  test('should show register page in Vietnamese', async ({ page }) => {
    await page.goto('/vi/register')

    await expect(page.getByRole('heading', { name: /tạo tài khoản/i })).toBeVisible()
  })

  test('should show register page in English', async ({ page }) => {
    await page.goto('/en/register')

    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/vi/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/vi\/login/)
  })

  test('should redirect from root to login', async ({ page }) => {
    await page.goto('/vi')

    // Should redirect to login for unauthenticated users
    await expect(page).toHaveURL(/\/vi\/login/)
  })
})

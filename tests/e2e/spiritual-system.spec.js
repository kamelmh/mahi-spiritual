const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8000';

const PAGES = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'soul', name: 'Soul Blueprint' },
  { id: 'chart', name: 'Natal Chart' },
  { id: 'verses', name: 'Quranic Verses' },
  { id: 'surahs', name: 'Surah Library' },
  { id: 'destiny', name: 'Destiny Map' },
  { id: 'practice', name: 'Practice Tracker' },
  { id: 'lunar', name: 'Lunar Calendar' },
  { id: 'emergency', name: 'Emergency Dhikr' },
  { id: 'ruqya', name: 'Ruqya Guide' },
  { id: 'daily-practice', name: 'Daily Practice' },
  { id: 'learning', name: 'Learning Hub' },
  { id: 'settings', name: 'Settings' },
  { id: 'prayer', name: 'Prayer Times' },
  { id: 'progress', name: 'Progress' },
  { id: 'audio', name: 'Quran Audio' },
  { id: 'export', name: 'Reports' },
  { id: 'family', name: 'Family Charts' },
];

test.describe('MAHI Spiritual System - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('dashboard loads as default page', async ({ page }) => {
    await expect(page.locator('.nav-item.active')).toHaveAttribute('data-page', 'dashboard');
    await expect(page.locator('#dashboard')).toBeVisible();
  });

  test('dashboard shows Quick Stats card', async ({ page }) => {
    await expect(page.locator('#dashboard .stats-card')).toBeVisible();
    await expect(page.locator('#streakCount')).toBeVisible();
  });

  test('dashboard shows Moon Phase card', async ({ page }) => {
    await expect(page.locator('#dashboard .moon-card')).toBeVisible();
    await expect(page.locator('#moonWidget')).toBeVisible();
  });

  test('dashboard shows Daily Wisdom card', async ({ page }) => {
    await expect(page.locator('#dashboard .quote-card')).toBeVisible();
  });

  test('dashboard shows Today Practice card', async ({ page }) => {
    await expect(page.locator('#dashboard .practice-card')).toBeVisible();
    await expect(page.locator('#practiceList')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('all nav items exist in sidebar', async ({ page }) => {
    for (const p of PAGES) {
      await expect(page.locator(`[data-page="${p.id}"]`)).toBeVisible();
    }
  });

  test('nav active state changes on click', async ({ page }) => {
    await expect(page.locator('.nav-item.active')).toHaveAttribute('data-page', 'dashboard');

    await page.click('[data-page="soul"]');
    await expect(page.locator('.nav-item.active')).toHaveAttribute('data-page', 'soul');

    await page.click('[data-page="chart"]');
    await expect(page.locator('.nav-item.active')).toHaveAttribute('data-page', 'chart');
  });

  test('sidebar shows MAHI branding', async ({ page }) => {
    await expect(page.locator('.sidebar-header .logo')).toHaveText('MAHI');
    await expect(page.locator('.sidebar-header .subtitle')).toHaveText("The Mystic's Path");
  });

  test('sidebar footer has theme toggle', async ({ page }) => {
    await expect(page.locator('.sidebar-footer #themeToggle')).toBeVisible();
  });

  test('connection status indicator is visible', async ({ page }) => {
    await expect(page.locator('#connectionStatus')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('theme toggle switches mode', async ({ page }) => {
    const toggle = page.locator('#themeToggle');
    await expect(toggle).toBeVisible();
    const bodyBefore = await page.locator('body').getAttribute('class');
    await toggle.click();
    await page.waitForTimeout(300);
    const bodyAfter = await page.locator('body').getAttribute('class');
    expect(bodyBefore).not.toEqual(bodyAfter);
  });

  test('theme toggle text updates on click', async ({ page }) => {
    const toggle = page.locator('#themeToggle');
    const textBefore = await toggle.locator('.theme-text').textContent();
    await toggle.click();
    await page.waitForTimeout(300);
    const textAfter = await toggle.locator('.theme-text').textContent();
    expect(textBefore).not.toEqual(textAfter);
  });
});

test.describe('MAHI Spiritual System - Soul Blueprint', () => {
  test('soul page loads with sections', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="soul"]');
    await expect(page.locator('#soul')).toBeVisible();
    await expect(page.locator('#soul .page-header h2')).toHaveText('Soul Blueprint');
    await expect(page.locator('#soulPurpose')).toBeVisible();
    await expect(page.locator('#pastLife')).toBeVisible();
    await expect(page.locator('#challenges')).toBeVisible();
    await expect(page.locator('#gifts')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Natal Chart', () => {
  test('chart page loads with controls', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="chart"]');
    await expect(page.locator('#chart')).toBeVisible();
    await expect(page.locator('#chartWheel')).toBeVisible();
    await expect(page.locator('#chartViewSelector')).toBeVisible();
    await expect(page.locator('#chartViewSelector .chart-view-btn.active')).toHaveText('Natal (D-1)');
  });

  test('chart has D9 and D10 buttons', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="chart"]');
    await expect(page.locator('[data-view="D9"]')).toBeVisible();
    await expect(page.locator('[data-view="D10"]')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Quranic Verses', () => {
  test('verses page loads with selector and display', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="verses"]');
    await expect(page.locator('#verses')).toBeVisible();
    await expect(page.locator('#verseSelector')).toBeVisible();
    await expect(page.locator('#verseDisplay')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Surah Library', () => {
  test('surahs page loads with search and grid', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="surahs"]');
    await expect(page.locator('#surahs')).toBeVisible();
    await expect(page.locator('#surahSearch')).toBeVisible();
    await expect(page.locator('#surahGrid')).toBeVisible();
  });

  test('surah search accepts input', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="surahs"]');
    const searchInput = page.locator('#surahSearch');
    await searchInput.fill('Fatiha');
    await expect(searchInput).toHaveValue('Fatiha');
  });
});

test.describe('MAHI Spiritual System - Destiny Map', () => {
  test('destiny page loads with dasha sections', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="destiny"]');
    await expect(page.locator('#destiny')).toBeVisible();
    await expect(page.locator('#dashaTimeline')).toBeVisible();
    await expect(page.locator('#currentDasha')).toBeVisible();
    await expect(page.locator('#timingWindows')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Practice Tracker', () => {
  test('practice page loads with streak and counter', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="practice"]');
    await expect(page.locator('#practice')).toBeVisible();
    await expect(page.locator('#practiceStreak')).toBeVisible();
    await expect(page.locator('#recitationCounter')).toBeVisible();
    await expect(page.locator('#journalPrompt')).toBeVisible();
    await expect(page.locator('#saveJournal')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Lunar Calendar', () => {
  test('lunar page loads with phase and calendar', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="lunar"]');
    await expect(page.locator('#lunar')).toBeVisible();
    await expect(page.locator('#lunarPhase')).toBeVisible();
    await expect(page.locator('#recitationSchedule')).toBeVisible();
    await expect(page.locator('#lunarCalendar')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Emergency Dhikr', () => {
  test('emergency page loads with grid', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="emergency"]');
    await expect(page.locator('#emergency')).toBeVisible();
    await expect(page.locator('#emergencyGrid')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Ruqya Guide', () => {
  test('ruqya page loads with cards', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="ruqya"]');
    await expect(page.locator('#ruqya')).toBeVisible();
    const cards = page.locator('#ruqya .card');
    await expect(cards.first()).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Daily Practice', () => {
  test('daily-practice page loads with MAHI Method', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="daily-practice"]');
    await expect(page.locator('#daily-practice')).toBeVisible();
    await expect(page.locator('#daily-practice .page-header h2')).toHaveText('Daily Practice — MAHI Method');
  });
});

test.describe('MAHI Spiritual System - Learning Hub', () => {
  test('learning page loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="learning"]');
    await expect(page.locator('#learning')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Settings', () => {
  test('settings page loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="settings"]');
    await expect(page.locator('#settings')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Prayer Times', () => {
  test('prayer page loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="prayer"]');
    await expect(page.locator('#prayer')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Progress', () => {
  test('progress page loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="progress"]');
    await expect(page.locator('#progress')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Quran Audio', () => {
  test('audio page loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="audio"]');
    await expect(page.locator('#audio')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Reports', () => {
  test('export page loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="export"]');
    await expect(page.locator('#export')).toBeVisible();
  });
});

test.describe('MAHI Spiritual System - Family Charts', () => {
  test('family page loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('[data-page="family"]');
    await expect(page.locator('#family')).toBeVisible();
  });
});

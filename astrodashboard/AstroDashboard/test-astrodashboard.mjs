import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:8000/index.html';
const SCREENSHOT_DIR = '/c/Users/Admin/AstroDashboard/test-screenshots';

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
  { id: 'learning', name: 'Learning Hub' },
  { id: 'settings', name: 'Settings' },
  { id: 'prayer', name: 'Prayer Times' },
  { id: 'progress', name: 'Progress' },
  { id: 'audio', name: 'Quran Audio' },
  { id: 'export', name: 'Reports Export' },
];

if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTests() {
  const results = [];
  const allErrors = [];
  let passed = 0, warned = 0, failed = 0;

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push({ type: msg.type(), text: msg.text().substring(0, 300) });
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push({ type: 'pageerror', text: err.message.substring(0, 300) });
  });
  
  for (const p of PAGES) {
    console.log(`\n--- ${p.name} (#${p.id}) ---`);
    const res = { name: p.name, id: p.id, status: 'UNKNOWN', issues: [] };
    try {
      await page.goto(`${BASE_URL}#${p.id}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: join(SCREENSHOT_DIR, `${p.id}.png`), fullPage: true });
      
      const hasSection = await page.$(`section#${p.id}`);
      const contentLen = hasSection ? await page.evaluate(id => document.getElementById(id)?.textContent.trim().length || 0, p.id) : 0;
      const hasButtons = hasSection ? await page.$(`section#${p.id} button, section#${p.id} a, section#${p.id} input, section#${p.id} select`) : null;
      const heading = hasSection ? await page.evaluate(id => { const s = document.getElementById(id); const h = s?.querySelector('h1,h2,h3,h4'); return h?.textContent.trim() || 'No heading'; }, p.id) : 'Section not found!';
      
      res.heading = heading;
      res.contentLen = contentLen;
      res.hasSection = !!hasSection;
      res.hasInteractive = !!hasButtons;
      
      if (!hasSection) { res.status = 'FAIL'; failed++; res.issues.push('Section missing'); }
      else if (contentLen < 50) { res.status = 'WARN'; warned++; res.issues.push('Minimal content'); }
      else { res.status = 'PASS'; passed++; }
      
      console.log(`  Section: ${res.hasSection} | Content: ${contentLen} chars | Interactive: ${res.hasInteractive}`);
      console.log(`  Heading: ${heading} | Status: ${res.status}`);
      results.push(res);
    } catch (err) {
      res.status = 'ERROR'; failed++; res.issues.push(err.message.substring(0, 200));
      console.log(`  ERROR: ${err.message.substring(0, 200)}`);
      results.push(res);
      allErrors.push({ page: p.name, error: err.message });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Passed: ${passed} | Warnings: ${warned} | Failed: ${failed} | Total: ${PAGES.length}`);
  
  console.log('\nDetailed Results:');
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️' : '❌';
    console.log(`  ${icon} ${r.name}: ${r.status}${r.issues.length ? ' - ' + r.issues.join(', ') : ''}`);
  }
  
  if (consoleErrors.length > 0) {
    console.log('\nConsole Errors/Warnings:');
    const seen = new Set();
    consoleErrors.filter(e => { if (seen.has(e.text)) return false; seen.add(e.text); return true; }).forEach((e, i) => {
      console.log(`  ${i + 1}. [${e.type}] ${e.text}`);
    });
  }
  
  writeFileSync(join(SCREENSHOT_DIR, 'test-report.json'), JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { passed, warned, failed, total: PAGES.length },
    pages: results,
    consoleErrors,
    criticalErrors: allErrors,
  }, null, 2));
  
  console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);
  await browser.close();
}

runTests().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

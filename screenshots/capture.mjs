import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const sprint = process.argv[2] ?? '0';
const screenshotDir = path.dirname(new URL(import.meta.url).pathname);

const fixtures = [
  { name: 'pulse', path: `${process.env.HOME}/dev/pulse/insights.flow.yaml` },
  { name: 'build', path: `${process.env.HOME}/dev/ai-foundation/linear-to-stage.flow.yaml` },
];

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

for (const fixture of fixtures) {
  const yamlContent = fs.readFileSync(fixture.path, 'utf-8');

  for (const theme of ['light', 'dark']) {
    await page.goto('http://localhost:5173');
    await page.emulateMedia({ colorScheme: theme });
    await page.waitForTimeout(500);

    // Expand YAML panel
    await page.click('.flow-mo__yaml-toggle');
    await page.waitForTimeout(300);

    // Load fixture YAML
    await page.fill('.flow-mo__textarea', yamlContent);
    await page.click('button:has-text("Apply YAML")');
    await page.waitForTimeout(800);

    // Collapse YAML panel to show full diagram
    await page.click('.flow-mo__yaml-toggle');
    await page.waitForTimeout(300);

    // Wait for edges to render (pathfinding is async)
    await page.waitForTimeout(500);

    const filename = `sprint-${sprint}-${fixture.name}-${theme}.png`;
    await page.screenshot({
      path: path.join(screenshotDir, filename),
      fullPage: true,
    });
    console.log(`Captured: ${filename}`);
  }
}

await browser.close();
console.log('Done.');

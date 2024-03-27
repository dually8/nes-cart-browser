import playwright from 'playwright';
import path from 'path';
import fs from 'fs';

(async () => {
  const assetsDir = path.join(process.cwd(), 'assets');
  console.log(assetsDir);
  const url = 'https://nescartdb.com/search/advanced?region_op=equal&region=USA';
  const resultSelector = 'td > a:not(.header)[title="View the database profile for this game"]';
  const imgSelector = '#cartfront img';
  const imgToSaveSelector = '.content img';
  // const browser = await playwright.chromium.launch();
  // const context = await browser.newContext();
  // const page = await context.newPage();
  // await page.goto(url);
  // await page.screenshot({ path: 'screenshot.png' });
  // await browser.close();
})();
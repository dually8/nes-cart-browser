import playwright from 'playwright';
import path from 'path';
import type { NesCartItem } from '../src/models/NesCartItem';
import fs from 'fs';
import { Logger, LogLevel } from './logger';

const ASSETS_DIR = path.join(process.cwd(), 'src', 'assets');
const BASE_URL = 'https://nescartdb.com';
const SEARCH_URL = `${BASE_URL}/search/advanced?region_op=equal&region=USA`;
const RESULT_SELECTOR = 'td > a:not(.header)[title="View the database profile for this game"]';
const CART_FRONT_SELECTOR = 'td#cartfront';
const CART_IMG_SELECTOR = '#cartfront a.myimg';
const IMG_TO_SAVE_SELECTOR = '.content img';
const logger = Logger.getInstance();

type GameLink = {
  title: string;
  link: string;
};

type GameDetails = {
  gameTitle: string;
  catalogId: string;
  region: string;
  releaseDate: string;
};

/**
 * Remove leading and trailing whitespace,
 * replace hidden characters and non-breaking
 * spaces with nothing
 * @param str input string
 * @returns cleaned string
 */
function cleanString(str: string): string {
  return str.trim().replace(/\s|\u00a0/g, '');
}

async function getGameLinks(page: playwright.Page): Promise<GameLink[]> {
  return await page.locator(RESULT_SELECTOR).evaluateAll((elements, _baseUrl) => {
    return elements.map((el) => {
      return {
        title: el.textContent as string,
        link: _baseUrl + el.getAttribute('href') as string,
      };
    });
  }, BASE_URL);
}

async function getGameDetails(page: playwright.Page, game: GameLink): Promise<GameDetails> {
  // get the first .headingmain element and get the text content
  const gameTitle = game.title;
  logger.info('Game title:', gameTitle);
  // find a th containing "Catalog ID" and get the text of the sibling td
  const catalogId = await page.locator('th:has-text("Catalog ID") ~ td').textContent() ?? 'null';
  logger.info('Catalog ID:', catalogId);
  // find a th containing "Region" and get the text of the sibling td
  const region = await page.locator('th:has-text("Region") ~ td').textContent() ?? 'null';
  logger.info('Region:', region);
  // find a th containing "Release Date" and get the text of the sibling td
  const releaseDate = await page.locator('th:has-text("Release Date") ~ td').textContent() ?? 'null';
  logger.info('Release Date:', releaseDate);
  return { gameTitle, catalogId, region, releaseDate };
}

async function saveGameImage(page: playwright.Page, catalogId: string) {
  const cartImg = page.locator(CART_FRONT_SELECTOR);
  const hasImg = await cartImg.locator('a').count() > 0;
  logger.info('Has Img:', hasImg);
  if (hasImg) {
    const imgUrl = await page.locator(CART_IMG_SELECTOR).getAttribute('href') as string;
    const fullImgUrl = BASE_URL + imgUrl;
    logger.info('Going to', fullImgUrl);
    // go to the imgUrl
    await page.goto(fullImgUrl);
    // get the src of the imgToSaveSelector
    const imgSrc = await page.locator(IMG_TO_SAVE_SELECTOR).getAttribute('src');
    logger.info('Image Src:', imgSrc);
    // save the image
    const imgPath = path.join(ASSETS_DIR, `${catalogId}.png`);
    const imgResponse = await fetch(
      `${BASE_URL}${imgSrc}`
    );
    const imgBuffer = await imgResponse.arrayBuffer();
    fs.writeFileSync(imgPath, Buffer.from(imgBuffer));
  }
}

async function scrapeGames() {
  const nesCarts: NesCartItem[] = [];
  const browser = await playwright.firefox.launch({
    headless: false,
  })
  const context = await browser.newContext();
  const page = await context.newPage();

  // First, get the initial page of games
  await page.goto(SEARCH_URL);
  const basePageUrl = 'https://nescartdb.com/search/advanced?region_op=equal&region=USA&page=';
  const pageLinks = Array.from({length: 15}, (_, i) => basePageUrl + (i + 2));
  let games = await getGameLinks(page);
  for (let game of games) {
    logger.info('Going to', game.link);
    await page.goto(game.link);
    const { gameTitle, catalogId, region, releaseDate } = await getGameDetails(page, game);
    await saveGameImage(page, catalogId);
    nesCarts.push({
      catalogId,
      region: cleanString(region),
      coverPhotoUrl: `/assets/${catalogId}.png`,
      releaseDate,
      title: gameTitle,
    });
  }

  // Then, go through the list of pageLinks and do the same
  for (let link of pageLinks) {
    logger.info('Going to', link);
    await page.goto(link);
    games = await getGameLinks(page);
    for (let game of games) {
      logger.info('Going to', game.link);
      await page.goto(game.link);
      const { gameTitle, catalogId, region, releaseDate } = await getGameDetails(page, game);
      await saveGameImage(page, catalogId);
      nesCarts.push({
        catalogId,
        region,
        coverPhotoUrl: `/assets/${catalogId}.png`,
        releaseDate,
        title: gameTitle,
      });
    }
  }

  await browser.close();
  return nesCarts;
}

async function main() {
  try {
    logger.setLogLevel(LogLevel.INFO);
    const nesCarts = await scrapeGames();
    // Write the contents of nesCarts to a json file
    const jsonPath = path.join(ASSETS_DIR, 'nesCarts.json');
    fs.writeFileSync(jsonPath, JSON.stringify(nesCarts, null, 2));
    logger.info('Done');
  } catch (e) {
    console.error(e);
  }
}

main();
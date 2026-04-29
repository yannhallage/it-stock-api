import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const DEFAULT_ARGS = ['--no-sandbox', '--disable-setuid-sandbox'];

function isVercelRuntime(): boolean {
  return process.env.VERCEL === '1';
}

export async function launchPdfBrowser() {
  if (isVercelRuntime()) {
    const executablePath = await chromium.executablePath();

    return puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });
  }

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

  if (executablePath) {
    return puppeteer.launch({
      executablePath,
      headless: true,
      args: DEFAULT_ARGS,
    });
  }

  return puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: DEFAULT_ARGS,
  });
}

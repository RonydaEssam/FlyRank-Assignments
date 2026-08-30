import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import * as cheerio from 'cheerio';

const USER_AGENT = 'FlyRankInternshipA9/1.0 (+https://github.com/<your-username>/flyrank-internship)';
const TIMEOUT_MS = 8000;
const CACHE_DIR = 'cache';
const DELAY_MS = 600;

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(url: string, cachePath: string): Promise<{ html: string; fromCache: boolean }> {
    if (existsSync(cachePath)) {
        const html = await readFile(cachePath, 'utf-8');
        console.log(`CACHE HIT — ${url} (${html.length} bytes)`);
        return { html, fromCache: true };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT },
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.status !== 200) {
            throw new Error(`Fetch failed for ${url}: status ${response.status}`);
        }

        const html = await response.text();
        await writeFile(cachePath, html, 'utf-8');
        console.log(`FETCH — ${url} (${html.length} bytes)`);

        await sleep(DELAY_MS);

        return { html, fromCache: false };
    } catch (err) {
        clearTimeout(timeout);
        throw err;
    }
}

async function discoverBookUrls(): Promise<string[]> {
    const bookUrls: string[] = [];
    let pageNum = 1;
    let pageUrl = 'https://books.toscrape.com/catalogue/page-1.html';
    const MAX_PAGES = 3;

    while (pageNum <= MAX_PAGES) {
        const cachePath = `${CACHE_DIR}/catalogue-page-${pageNum}.html`;
        const { html } = await fetchPage(pageUrl, cachePath);

        const $ = cheerio.load(html);

        $('article.product_pod h3 a').each((_, el) => {
            const href = $(el).attr('href');
            if (href) {
                const absoluteUrl = new URL(href, pageUrl).toString();
                bookUrls.push(absoluteUrl);
            }
        });

        if (pageNum === MAX_PAGES) {
            break;
        }

        const nextHref = $('li.next a').attr('href');
        if (!nextHref) {
            break;
        }

        pageUrl = new URL(nextHref, pageUrl).toString();
        pageNum++;
    }

    const uniqueUrls = [...new Set(bookUrls)];

    console.log(`catalogue_pages=${pageNum} discovered=${bookUrls.length} unique_urls=${uniqueUrls.length}`);

    return uniqueUrls;
}

async function main() {
    await mkdir(CACHE_DIR, { recursive: true });
    await discoverBookUrls();
}

main().catch((err) => {
    console.error('Run failed:', err.message);
    process.exit(1);
});
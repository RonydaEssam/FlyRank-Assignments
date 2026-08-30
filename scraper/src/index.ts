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

async function discoverBookUrls(): Promise<Map<string, string>> {
    const bookUrls = new Map<string, string>();
    let pageNum = 1;
    let pageUrl = 'https://books.toscrape.com/catalogue/page-1.html';
    const MAX_PAGES = 3;

    while (pageNum <= MAX_PAGES) {
        const cachePath = `${CACHE_DIR}/catalogue-page-${pageNum}.html`;
        const { html } = await fetchPage(pageUrl, cachePath);

        const currentPageUrl = pageUrl;
        const $ = cheerio.load(html);

        $('article.product_pod h3 a').each((_, el) => {
            const href = $(el).attr('href');
            if (href) {
                const absoluteUrl = new URL(href, currentPageUrl).toString();
                bookUrls.set(absoluteUrl, currentPageUrl);
            }
        });

        if (pageNum === MAX_PAGES) {
            break;
        }

        const nextHref = $('li.next a').attr('href');
        if (!nextHref) {
            break;
        }

        pageUrl = new URL(nextHref, currentPageUrl).toString();
        pageNum++;
    }

    console.log(`catalogue_pages=${pageNum} discovered=${bookUrls.size} unique_urls=${bookUrls.size}`);

    return bookUrls;
}

interface RawRecord {
    title: string;
    product_url: string;
    price_text: string;
    availability_text: string;
    rating_text: string;
    description: string | null;
    source_page: string;
    fetched_at: string;
}

function cachePathForBook(url: string): string {
    const segments = url.split('/').filter(Boolean);
    const slug = segments[segments.length - 2] || 'unknown';
    return `${CACHE_DIR}/book-${slug}.html`;
}

async function extractBookRecord(url: string, sourcePage: string): Promise<RawRecord> {
    const cachePath = cachePathForBook(url);
    const { html } = await fetchPage(url, cachePath);

    const $ = cheerio.load(html);
    const product = $('.product_page');

    const title = product.find('h1').text().trim();
    const price_text = product.find('.price_color').first().text().trim();
    const availability_text = product.find('.availability').text().trim().replace(/\s+/g, ' ');

    const ratingClasses = product.find('p.star-rating').attr('class') || '';
    const rating_text = ratingClasses.replace('star-rating', '').trim();

    const descriptionEl = $('#product_description').next('p');
    const description = descriptionEl.length ? descriptionEl.text().trim() : null;

    return {
        title,
        product_url: url,
        price_text,
        availability_text,
        rating_text,
        description,
        source_page: sourcePage,
        fetched_at: new Date().toISOString()
    };
}

async function extractAllBooks(bookUrls: string[], catalogueUrls: Map<string, string>): Promise<RawRecord[]> {
    const records: RawRecord[] = [];

    for (const url of bookUrls) {
        const sourcePage = catalogueUrls.get(url) || 'unknown';
        const record = await extractBookRecord(url, sourcePage);
        records.push(record);
    }

    console.log(`detail_pages=${records.length}`);

    return records;
}

async function main() {
    await mkdir(CACHE_DIR, { recursive: true });

    const bookUrlMap = await discoverBookUrls();
    const records = await extractAllBooks([...bookUrlMap.keys()], bookUrlMap);

    console.log(JSON.stringify(records[0], null, 2));
}

main().catch((err) => {
    console.error('Run failed:', err.message);
    process.exit(1);
});
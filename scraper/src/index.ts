import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import * as cheerio from 'cheerio';
import { z } from 'zod';

const USER_AGENT = 'FlyRankInternshipA9/1.0 (+https://github.com/<your-username>/flyrank-internship)';
const TIMEOUT_MS = 8000;
const CACHE_DIR = 'cache';
const DELAY_MS = 600;

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

interface FetchResult {
    html: string | null;
    fromCache: boolean;
    error: string | null;
}

async function fetchPage(url: string, cachePath: string, retried = false): Promise<FetchResult> {
    if (existsSync(cachePath)) {
        const html = await readFile(cachePath, 'utf-8');
        console.log(`CACHE HIT — ${url} (${html.length} bytes)`);
        return { html, fromCache: true, error: null };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT },
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.status === 404 || response.status === 403) {
            return { html: null, fromCache: false, error: `status ${response.status}` };
        }

        if (response.status >= 500 && !retried) {
            console.log(`RETRY — ${url} (got ${response.status})`);
            await sleep(1000);
            return fetchPage(url, cachePath, true);
        }

        if (response.status !== 200) {
            return { html: null, fromCache: false, error: `status ${response.status}` };
        }

        const html = await response.text();
        await writeFile(cachePath, html, 'utf-8');
        console.log(`FETCH — ${url} (${html.length} bytes)`);

        await sleep(DELAY_MS);

        return { html, fromCache: false, error: null };
    } catch (err) {
        clearTimeout(timeout);

        if (!retried) {
            console.log(`RETRY — ${url} (${(err as Error).message})`);
            await sleep(1000);
            return fetchPage(url, cachePath, true);
        }

        return { html: null, fromCache: false, error: (err as Error).message };
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
        const $ = cheerio.load(html || '');

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

const BookSchema = z.object({
    title: z.string().min(1),
    product_url: z.string().url(),
    price_gbp: z.number().positive(),
    price_text: z.string(),
    availability_text: z.string(),
    rating_text: z.string(),
    description: z.string().nullable(),
    source_page: z.string().url(),
    fetched_at: z.string()
});

type Book = z.infer<typeof BookSchema>;

function normalizeRecord(raw: RawRecord): unknown {
    const priceMatch = raw.price_text.match(/[\d.]+/);
    const price_gbp = priceMatch ? parseFloat(priceMatch[0]) : NaN;

    return {
        ...raw,
        price_gbp
    };
}

interface ValidationResult {
    valid: Book[];
    invalid: { record: unknown; reason: string }[];
}

function validateRecords(rawRecords: RawRecord[]): ValidationResult {
    const valid: Book[] = [];
    const invalid: { record: unknown; reason: string }[] = [];
    const seenUrls = new Set<string>();

    for (const raw of rawRecords) {
        const normalized = normalizeRecord(raw);
        const result = BookSchema.safeParse(normalized);

        if (!result.success) {
            invalid.push({ record: normalized, reason: result.error.issues.map(i => i.message).join('; ') });
            continue;
        }

        if (seenUrls.has(result.data.product_url)) {
            invalid.push({ record: normalized, reason: 'Duplicate product_url' });
            continue;
        }

        seenUrls.add(result.data.product_url);
        valid.push(result.data);
    }

    return { valid, invalid };
}

function cachePathForBook(url: string): string {
    const segments = url.split('/').filter(Boolean);
    const slug = segments[segments.length - 2] || 'unknown';
    return `${CACHE_DIR}/book-${slug}.html`;
}

async function extractBookRecord(url: string, sourcePage: string): Promise<RawRecord | null> {
    const cachePath = cachePathForBook(url);
    const { html, error } = await fetchPage(url, cachePath);

    if (error || !html) {
        console.log(`SKIPPED — ${url} (${error})`);
        return null;
    }

    const $ = cheerio.load(html);
    const product = $('.product_page');

    const title = product.find('h1').text().trim();
    const price_text = product.find('.price_color').first().text().trim();
    const availability_text = product.find('.availability').text().trim().replace(/\s+/g, ' ');

    const ratingClasses = product.find('p.star-rating').attr('class') || '';
    const rating_text = ratingClasses.replace('star-rating', '').trim();

    const descriptionEl = $('#product_description').next('p').first();
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

async function extractAllBooks(bookUrls: string[], catalogueUrls: Map<string, string>): Promise<{ records: RawRecord[]; failedPages: number }> {
    const records: RawRecord[] = [];
    let failedPages = 0;

    for (const url of bookUrls) {
        const sourcePage = catalogueUrls.get(url) || 'unknown';
        const record = await extractBookRecord(url, sourcePage);

        if (record) {
            records.push(record);
        } else {
            failedPages++;
        }
    }

    console.log(`detail_pages=${records.length} failed_pages=${failedPages}`);

    return { records, failedPages };
}

async function main() {
    const startTime = Date.now();
    const startedAt = new Date().toISOString();

    await mkdir(CACHE_DIR, { recursive: true });
    await mkdir('output', { recursive: true });

    const bookUrlMap = await discoverBookUrls();

    // Deliberately inject one fake URL to prove failure handling, remove before final submission,
    // or keep behind a flag if you want to demonstrate it on demand.
    bookUrlMap.set('https://books.toscrape.com/catalogue/this-book-does-not-exist_9999/index.html', 'test');

    const { records: rawRecords, failedPages } = await extractAllBooks([...bookUrlMap.keys()], bookUrlMap);

    const { valid, invalid } = validateRecords(rawRecords);

    await writeFile('output/books.json', JSON.stringify(valid, null, 2), 'utf-8');
    await writeFile('output/errors.json', JSON.stringify(invalid, null, 2), 'utf-8');

    const durationMs = Date.now() - startTime;

    const report = {
        started_at: startedAt,
        duration_ms: durationMs,
        pages_fetched: bookUrlMap.size + 3,
        valid_records: valid.length,
        invalid_records: invalid.length,
        failed_pages: failedPages
    };

    await writeFile('output/run-report.json', JSON.stringify(report, null, 2), 'utf-8');

    console.log(`valid_records=${valid.length} invalid_records=${invalid.length} failed_pages=${failedPages}`);
    console.log('Run report:', report);
}

main().catch((err) => {
    console.error('Run failed:', err.message);
    process.exit(1);
});
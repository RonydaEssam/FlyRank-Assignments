import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const USER_AGENT = 'FlyRankInternshipA9/1.0 (+https://github.com/RonydaEssam/FlyRank-Assignments)';
const TIMEOUT_MS = 8000;
const CACHE_DIR = 'cache';

async function fetchPage(url: string, cachePath: string): Promise<string> {
    if (existsSync(cachePath)) {
        const html = await readFile(cachePath, 'utf-8');
        console.log(`CACHE HIT — ${url} (${html.length} bytes)`);
        return html;
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
        return html;
    } catch (err) {
        clearTimeout(timeout);
        throw err;
    }
}

async function main() {
    await mkdir(CACHE_DIR, { recursive: true });

    const url = 'https://books.toscrape.com/catalogue/page-1.html';
    const cachePath = `${CACHE_DIR}/catalogue-page-1.html`;

    await fetchPage(url, cachePath);
}

main().catch((err) => {
    console.error('Run failed:', err.message);
    process.exit(1);
});
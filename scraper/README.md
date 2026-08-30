# The Polite Scraper

A scraping pipeline built for FlyRank Internship, Week 5, Assignment A9. Downloads the first 3 catalogue pages of [Books to Scrape](https://books.toscrape.com), visits all 60 book pages, and turns messy HTML into clean, validated JSON (politely), without crashing on a broken page, and with an honest report at the end of every run.

## Target classification

- **Site:** [Books to Scrape](https://books.toscrape.com)
- **What it is:** A public sandbox created by the team behind [toscrape.com](https://toscrape.com) specifically for people to practice web scraping without needing permission from a real business.
- **Scope:** Only the first 3 catalogue pages (60 books total).
- **Data collected:** Book title, price, availability, star rating, description, and product URL, all publicly displayed on the page, nothing behind a login or paywall.
- **robots.txt result:** `https://books.toscrape.com/robots.txt` returns `404 Not Found`, no robots file found. 

```
HTTP/1.1 404 Not Found
Date: Sun, 30 Aug 2026 09:40:27 GMT
Content-Type: text/html
Content-Length: 153
Connection: keep-alive
Strict-Transport-Security: max-age=0; includeSubDomains; preload

<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.21.6</center>
</body>
</html>
```


- **Why this is appropriate:** The site exists explicitly for this purpose, requests basic scraping etiquette rather than forbidding it, and no real user data or paid content is involved.

I will not reuse this code on another site without checking its rules and terms first.

## Why this needed no browser

Every field this scraper collects, title, price, availability, rating, description, is present directly in the HTML the server sends on first response. There's no client-side JavaScript rendering the content afterward. A headless browser (Playwright, Puppeteer) would only add startup cost and memory overhead here with zero benefit; a plain HTTP request is strictly the right tool.

## How to run it

```bash
git clone https://github.com/RonydaEssam/Flyrank-Assignments.git
cd assignments/scraper

npm install
npm start
```

Output appears in `output/books.json`, `output/errors.json`, and `output/run-report.json`.

## Politeness rules this scraper follows

- **Identifying user-agent** on every real request: `FlyRankInternshipA9/1.0 (+link-to-repo)`, so a site owner can trace who's making requests.
- **Timeout** on every request, a hung connection is abandoned after 8 seconds rather than waited on forever.
- **Delay** of at least 500ms between real (non-cached) requests to the live site.
- **Status code checked first**, only `200` is treated as a usable page; anything else is a failed fetch, not something to parse.
- **Local caching**, every fetched page is saved to `cache/` and read from there on subsequent runs, so the live site is hit once per page, not on every development restart. `cache/` is git-ignored.
- **Retry policy**, a timeout or `5xx` response is retried once after a short pause. A `404` or `403` is never retried, those mean "this isn't going to work," not "try again."

## Record schema

Each validated record in `output/books.json`:

| Field | Type | Notes |
|---|---|---|
| `title` | string | |
| `product_url` | string (URL) | Canonical identity, used to detect and reject duplicates |
| `price_text` | string | Raw price as shown on the page, e.g. `£51.77` |
| `price_gbp` | number | Normalized numeric price, e.g. `51.77` |
| `availability_text` | string | e.g. `In stock (22 available)` |
| `rating_text` | string | e.g. `Three` |
| `description` | string \| null | `null` when the book has no description on the page, never invented |
| `source_page` | string (URL) | Which catalogue page this book was discovered on |
| `fetched_at` | string (ISO timestamp) | When this specific page was fetched |

Records are validated against this schema (via Zod) before being written. Anything that fails validation, or that duplicates a `product_url` already seen, is written to `output/errors.json` with a reason instead, it never reaches `books.json`.

## Sample run report

```json
{
  "started_at": "2026-08-30T11:22:40.033Z",
  "duration_ms": 748,
  "pages_fetched": 64,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": 1
}
```

The run deliberately includes one fake, non-existent book URL to prove the pipeline survives a broken page, note `failed_pages: 1` above, while `books.json` still holds all 60 good, real records. This fake URL is left in intentionally as evidence of the failure-handling behavior, not an oversight.

## Idempotency

Running the scraper twice in a row produces the same 60 records in `books.json`, not 120, the output file is fully rewritten each run rather than appended to, and `product_url` acts as each record's stable identity.

## Known limitation

A small number of Books to Scrape's demo pages (e.g. *A Light in the Attic*) contain a description with duplicated text baked directly into the site's own source HTML, not a bug in this scraper's extraction, confirmed by inspecting the raw page. Per the assignment's own principle of never inventing or altering scraped content, this scraper stores the description exactly as the page provides it, duplication included, rather than silently "cleaning" it.

## Ethics note

This scraper only touches a site explicitly built and offered for scraping practice. In any other context: check for an official API first, never bypass a login, paywall, or access block, and collect only the data actually needed for the task at hand.

## Tech stack

- TypeScript, `tsx`
- Built-in `fetch` for HTTP requests
- Cheerio for HTML parsing
- Zod for schema validation

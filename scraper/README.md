# The Polite Scraper

A scraping pipeline built for FlyRank Internship, Week 5, Assignment A9.

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
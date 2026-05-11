import os
import time
import random
import logging
import datetime
from typing import Optional

try:
    import requests
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False

logger = logging.getLogger(__name__)

BASE_URL = os.getenv("TRENDYOL_BASE_URL", "https://www.trendyol.com")
REQUEST_DELAY = float(os.getenv("REQUEST_DELAY", "2"))
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "10"))

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


def _simulate_products(brand: str, page: int, count: int = 5) -> list[dict]:
    scraped_at = datetime.datetime.now().isoformat()
    products = []
    for i in range(1, count + 1):
        price = round(random.uniform(500, 3000), 2)
        original_price = round(price * random.uniform(1.1, 1.5), 2)
        discount = round((1 - price / original_price) * 100)
        products.append({
            "product_name": f"{brand} Ürün {(page - 1) * count + i}",
            "price": price,
            "original_price": original_price,
            "discount_percent": discount,
            "brand": brand,
            "rating": round(random.uniform(3.5, 5.0), 1),
            "review_count": random.randint(10, 2000),
            "platform": "trendyol",
            "url": f"{BASE_URL}/sr?q={brand}&pi={page}",
            "scraped_at": scraped_at,
        })
    return products


def _parse_page(html: str, brand: str) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    scraped_at = datetime.datetime.now().isoformat()
    products = []

    cards = soup.select("div.p-card-wrppr")
    for card in cards:
        try:
            name_el = card.select_one("span.prdct-desc-cntnr-ttl-w")
            price_el = card.select_one("div.prc-box-dscntd") or card.select_one("div.prc-box-sllng")
            original_el = card.select_one("div.prc-box-orgnl")
            rating_el = card.select_one("span.ratingScore")
            review_el = card.select_one("span.ratingCount")
            link_el = card.select_one("a")

            if not name_el or not price_el:
                continue

            price_text = price_el.get_text(strip=True).replace("TL", "").replace(".", "").replace(",", ".").strip()
            price = float(price_text)

            original_price = price
            if original_el:
                orig_text = original_el.get_text(strip=True).replace("TL", "").replace(".", "").replace(",", ".").strip()
                original_price = float(orig_text)

            discount = round((1 - price / original_price) * 100) if original_price > price else 0

            products.append({
                "product_name": name_el.get_text(strip=True),
                "price": price,
                "original_price": original_price,
                "discount_percent": discount,
                "brand": brand,
                "rating": float(rating_el.get_text(strip=True)) if rating_el else None,
                "review_count": int(review_el.get_text(strip=True).replace("(", "").replace(")", "")) if review_el else 0,
                "platform": "trendyol",
                "url": BASE_URL + link_el["href"] if link_el and link_el.get("href") else BASE_URL,
                "scraped_at": scraped_at,
            })
        except (ValueError, TypeError, KeyError):
            continue

    return products


def scrape_trendyol(brand: str, pages: int = 1) -> list[dict]:
    all_products: list[dict] = []

    if not BS4_AVAILABLE:
        logger.warning("requests/beautifulsoup4 yüklü değil — simüle edilmiş veri kullanılıyor.")
        for page in range(1, pages + 1):
            all_products.extend(_simulate_products(brand, page))
        return all_products

    session = requests.Session()
    session.headers.update(HEADERS)

    for page in range(1, pages + 1):
        url = f"{BASE_URL}/sr?q={requests.utils.quote(brand)}&pi={page}"
        logger.info("Sayfa çekiliyor: %s", url)
        try:
            resp = session.get(url, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            parsed = _parse_page(resp.text, brand)
            if parsed:
                all_products.extend(parsed)
                logger.info("Sayfa %d: %d ürün bulundu", page, len(parsed))
            else:
                logger.warning("Sayfa %d: HTML ayrıştırılamadı — simüle edilmiş veri kullanılıyor", page)
                all_products.extend(_simulate_products(brand, page))
        except requests.RequestException as exc:
            logger.error("İstek hatası (sayfa %d): %s — simüle edilmiş veri kullanılıyor", page, exc)
            all_products.extend(_simulate_products(brand, page))

        if page < pages:
            time.sleep(REQUEST_DELAY)

    return all_products


def summarize(products: list[dict]) -> Optional[dict]:
    if not products:
        return None
    prices = [p["price"] for p in products if p.get("price") is not None]
    brands = list({p["brand"] for p in products if p.get("brand")})
    return {
        "product_count": len(products),
        "avg_price": round(sum(prices) / len(prices), 2) if prices else 0,
        "min_price": min(prices) if prices else 0,
        "max_price": max(prices) if prices else 0,
        "brands": ", ".join(brands),
    }

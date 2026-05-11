#!/usr/bin/env python3
"""Trendyol Veri İzleme Sistemi — Ana Program."""

import argparse
import csv
import json
import logging
import os
import sys
import datetime
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from trendyol_scraper import scrape_trendyol, summarize

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
LOGS_DIR = BASE_DIR / "logs"
DATA_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)


def _setup_logging(timestamp: str) -> None:
    log_file = LOGS_DIR / f"system_{timestamp}.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.FileHandler(log_file, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )


def _save_csv(products: list[dict], path: Path) -> None:
    if not products:
        return
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=list(products[0].keys()))
        writer.writeheader()
        writer.writerows(products)


def _save_json(products: list[dict], summary: dict, path: Path, brand: str, pages: int) -> None:
    payload = {
        "metadata": {
            "brand": brand,
            "pages_scraped": pages,
            "scraped_at": datetime.datetime.now().isoformat(),
            "platform": "trendyol",
        },
        "summary": summary,
        "products": products,
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def _print_summary(summary: dict) -> None:
    sep = "=" * 68
    print(f"\n📊 TRENDYOL ÖZETİ")
    print(sep)
    print(f"Ürün Sayısı:      {summary['product_count']}")
    print(f"Ortalama Fiyat:   {summary['avg_price']:.2f} TL")
    print(f"Min Fiyat:        {summary['min_price']:.2f} TL")
    print(f"Max Fiyat:        {summary['max_price']:.2f} TL")
    print(f"Markalar:         {summary['brands']}")
    print(sep)


def main() -> None:
    parser = argparse.ArgumentParser(description="Trendyol Veri İzleme Sistemi")
    parser.add_argument("--brand", default="Nike", help="Aranacak marka")
    parser.add_argument("--pages", type=int, default=1, help="Taranacak sayfa sayısı")
    parser.add_argument(
        "--platform",
        default="trendyol",
        choices=["trendyol"],
        help="Platform (şimdilik sadece trendyol)",
    )
    parser.add_argument(
        "--output",
        default="both",
        choices=["csv", "json", "both"],
        help="Çıktı formatı",
    )
    args = parser.parse_args()

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    _setup_logging(timestamp)
    logger = logging.getLogger(__name__)

    sep = "=" * 68
    print(f"\n🚀{sep}")
    print("   TRENDYOL VERİ İZLEME SİSTEMİ - CLAUDE CODE")
    print(f"{sep}\n")

    print("✅ TRENDYOL Scraper başlatıldı")
    print(f"🔍 '{args.brand}' aranıyor (trendyol)...")

    products = scrape_trendyol(args.brand, pages=args.pages)
    print(f"✅ {len(products)} ürün bulundu")

    summary = summarize(products) or {}
    _print_summary(summary)

    csv_path = DATA_DIR / f"trendyol_urunler_{timestamp}.csv"
    json_path = DATA_DIR / f"trendyol_urunler_{timestamp}.json"
    log_path = LOGS_DIR / f"system_{timestamp}.log"

    if args.output in ("csv", "both"):
        _save_csv(products, csv_path)
        logger.info("CSV kaydedildi: %s", csv_path)

    if args.output in ("json", "both"):
        _save_json(products, summary, json_path, args.brand, args.pages)
        logger.info("JSON kaydedildi: %s", json_path)

    print("\n✅ TAMAMLANDI!")
    print(f"📁 Veri Klasörü: data/")
    if args.output in ("csv", "both"):
        print(f"   ✓ CSV:  {csv_path.relative_to(BASE_DIR)}")
    if args.output in ("json", "both"):
        print(f"   ✓ JSON: {json_path.relative_to(BASE_DIR)}")
    print(f"📋 Log Dosyası: {log_path.relative_to(BASE_DIR)}\n")


if __name__ == "__main__":
    main()

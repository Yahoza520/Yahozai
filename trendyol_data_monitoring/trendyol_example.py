#!/usr/bin/env python3
"""Trendyol scraper için basit test örneği."""

from trendyol_scraper import scrape_trendyol, summarize


def run_example(brand: str = "Nike", pages: int = 1) -> None:
    print(f"'{brand}' için Trendyol scraper test ediliyor...\n")

    products = scrape_trendyol(brand, pages=pages)
    summary = summarize(products)

    if not products:
        print("Hiç ürün bulunamadı.")
        return

    print(f"Toplam {len(products)} ürün bulundu.\n")
    print("İlk 3 ürün:")
    for p in products[:3]:
        print(f"  - {p['product_name']}")
        print(f"    Fiyat: {p['price']:.2f} TL  |  İndirim: %{p['discount_percent']}")
        print(f"    Puan:  {p['rating']}  |  Yorum: {p['review_count']}")
        print()

    if summary:
        print("Özet:")
        for key, val in summary.items():
            print(f"  {key}: {val}")


if __name__ == "__main__":
    run_example("Nike")

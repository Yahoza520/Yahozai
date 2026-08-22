export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6">
        <span className="rounded-full border border-emerald-600/30 bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-950/40 dark:text-emerald-300">
          Yakında
        </span>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Saguya Health
        </h1>

        <p className="text-balance text-lg text-neutral-600 dark:text-neutral-300">
          Yurt dışındaki hastaları Türkiye&apos;deki{" "}
          <strong className="font-semibold text-neutral-900 dark:text-neutral-100">
            yetki belgeli
          </strong>{" "}
          sağlık kuruluşlarıyla buluşturan güvenilir platform.
        </p>

        <p className="text-balance text-base text-neutral-500 dark:text-neutral-400">
          Doğrulanmış klinikler, şeffaf paket fiyatları ve koşullu tahsilatla
          güvenli ödeme. Çok yakında hizmetinizde.
        </p>

        <a
          href="mailto:info@saguya.com"
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Bize ulaşın
        </a>
      </div>

      <footer className="mt-16 text-xs text-neutral-400 dark:text-neutral-600">
        © {new Date().getFullYear()} Saguya Health. Tüm hakları saklıdır.
      </footer>
    </main>
  );
}

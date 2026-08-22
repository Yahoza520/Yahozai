import { createBrowserClient } from "@supabase/ssr";

/**
 * Tarayıcı (client component) tarafında kullanılan Supabase istemcisi.
 * Anahtarlar NEXT_PUBLIC_* ile gelir ve yalnızca "anon" (herkese açık) anahtardır;
 * gizli servis anahtarı buraya ASLA konmaz.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase ortam değişkenleri eksik. .env.local dosyasında NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı olmalı.",
    );
  }

  return createBrowserClient(url, anonKey);
}

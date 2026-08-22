import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Sunucu (server component / route handler) tarafında kullanılan Supabase istemcisi.
 * Oturum bilgisini çerezlerden okur ve tazeler.
 * RLS (satır seviyesi güvenlik) her zaman devrede olduğu için burada da
 * yalnızca "anon" anahtar kullanılır; kullanıcının yetkisi veritabanında zorlanır.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase ortam değişkenleri eksik. .env.local dosyasında NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı olmalı.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component içinden çağrıldığında set() engellenebilir.
          // Oturum tazeleme middleware üzerinden yapıldığında bu güvenle yok sayılır.
        }
      },
    },
  });
}

"use server";

import { cookies } from "next/headers";
import { isLocale, localeCookieName, type Locale } from "@/lib/i18n";

export async function setLocaleCookie(locale: Locale) {
  if (!isLocale(locale)) {
    return;
  }

  const cookieStore = await cookies();

  cookieStore.set(localeCookieName, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
}

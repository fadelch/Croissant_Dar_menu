import type messages from "../../messages/ar.json";
import type { Locale } from "@/i18n/routing";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}

import { site } from "@/lib/config";

/** WebApplication structured data so search engines and LLM crawlers can
 * describe this app accurately in results and citations. */
export function getJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: site.name,
    description: site.description,
    url: site.url,
    applicationCategory: "EducationApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

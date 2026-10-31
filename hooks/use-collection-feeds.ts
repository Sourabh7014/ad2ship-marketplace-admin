"use client";

/**
 * Product sections ka "collection feed" — section me collection chuni ho to
 * uske products live fetch karta hai.
 *
 * Pehle har product grid sirf `settings.products` dikhata tha — ek manually
 * curated snapshot. Collection me nayi product add karne par section me wo
 * apne aap nahi aati thi, seller ko theme editor khol kar list dobara banani
 * padti thi. Editor me "Connect to Collection Feed" ka control tha bhi, par wo
 * `collectionId` sirf save karta tha; storefront use kabhi padhta hi nahi tha.
 *
 * Ye hook wahi missing kadam hai: jis section me `collectionId` hai, uske
 * products collection API se aate hain aur collection badalte hi section bhi
 * badal jaata hai.
 */
import { useEffect, useState } from "react";
import { storefrontApiService } from "@/features/storefront/api.service";

/** `collectionId` -> us collection ke products. */
export type CollectionFeeds = Record<string, any[]>;

/**
 * Section ne kaunsi collection choose ki hai.
 *
 * Editor `collectionId` me id rakhta hai, par API slug se chalta hai — isliye
 * yahan `categories` me id se collection dhoondh kar uska slug nikaalte hain.
 * Purane sections me kabhi seedha slug bhi pada hota hai, isliye id match na
 * ho to value ko hi slug maan lete hain.
 */
export function resolveCollectionSlug(
  collectionId: unknown,
  categories: any[] | undefined,
): string | null {
  if (collectionId === undefined || collectionId === null || collectionId === "") return null;
  const raw = String(collectionId).trim();
  if (!raw) return null;

  const match = (categories ?? []).find((c: any) => String(c?.id) === raw);
  if (match) return String(match.slug ?? match.id);

  return raw;
}

/**
 * Jitne sections me collection chuni hai, un sabke products ek saath le aata
 * hai.
 *
 * @param sections    Page ke sections — inhi me se `collectionId` wale chunte hain.
 * @param categories  Storefront ki collections list (id -> slug ke liye).
 * @param domain      Kis store se fetch karna hai.
 */
export function useCollectionFeeds(
  sections: any[],
  categories: any[] | undefined,
  domain: string,
): CollectionFeeds {
  const [feeds, setFeeds] = useState<CollectionFeeds>({});

  // Jo slugs chahiye unhe ek stable string me badal dete hain, taaki har render
  // par effect dobara na chale (sections ka array har baar naya object hota hai).
  const slugs = Array.from(
    new Set(
      (sections ?? [])
        .map((s) => resolveCollectionSlug(s?.settings?.collectionId, categories))
        .filter((s): s is string => !!s),
    ),
  ).sort();
  const slugKey = slugs.join(",");

  useEffect(() => {
    if (!domain || !slugKey) return;

    let cancelled = false;
    const wanted = slugKey.split(",").filter(Boolean);

    Promise.all(
      wanted.map(async (slug) => {
        const data = await storefrontApiService.fetchCollectionProducts(domain, slug);
        return [slug, Array.isArray(data?.products) ? data.products : []] as const;
      }),
    )
      .then((entries) => {
        if (cancelled) return;
        const next: CollectionFeeds = {};
        for (const [slug, products] of entries) {
          // Khali collection ko store nahi karte — warna section apni maujooda
          // manual list chhod kar khali ho jaata. Feed miss hone par purana
          // behaviour hi chalta rahe.
          if (products.length) next[slug] = products;
        }
        setFeeds(next);
      })
      .catch(() => {
        // Feed na aaye to section apni manual list dikhata rahega.
      });

    return () => {
      cancelled = true;
    };
  }, [domain, slugKey]);

  return feeds;
}

/**
 * Section ko kaunse products dikhane hain.
 *
 * Collection chuni ho aur uska feed aa gaya ho to wahi jeetta hai — yahi
 * "auto-feed" ka matlab hai. Warna section ki apni manual list, aur wo bhi na
 * ho to `fallback`.
 */
export function productsForSection(
  section: any,
  feeds: CollectionFeeds,
  categories: any[] | undefined,
  fallback?: any[],
): any[] | undefined {
  const slug = resolveCollectionSlug(section?.settings?.collectionId, categories);
  if (slug && feeds[slug]?.length) return feeds[slug];
  const own = section?.settings?.products;
  if (Array.isArray(own) && own.length) return own;
  return fallback;
}

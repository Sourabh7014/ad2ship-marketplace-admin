# ad2ship-marketplace-admin

Ad2Ship marketplace ka admin panel. Neeche wale folders `ad2ship-theme-frontend`
se bina badle copy kiye gaye hain, taaki routes aur `@/...` imports same rahein.
Is repo me sirf admin hai — seller routes, logistics, storefront aur website nahi
liye gaye. `features/seller` me sirf wo 3 files hain jo `context/UserContext.tsx`
import karta hai.

```
app/
  (panel)/
    layout.tsx, template.tsx
    admin/              ← /admin, /admin/auth, /admin/auth/login, /admin/auth/verify-otp
    (dashboard)/
      layout.tsx        ← sidebar, header, route guards
      admin/            ← abhi sirf error.tsx hai, route folders hata diye gaye hain
  layout.tsx, page.tsx, globals.css
components/      ← theme-frontend ka poora folder (ui, data-table, sidebar, editor, plate-ui, ...)
config/          ← data-table config
context/         ← React context providers (UserContext, ...)
features/admin/auth/   ← login aur OTP forms, auth API
features/seller/       ← kyc aur profile ki sirf API service files
lib/             ← API client, cookie aur utils
types/data.ts
lang/            ← i18n messages (en.json, hi.json)
public/          ← static assets
i18n.ts          ← next-intl config (locale NEXT_LOCALE cookie se)
```

`components/` poora liya gaya hai, isliye usme `seller-sidebar.tsx` aur
`customer-storefront.tsx` jaisi non-admin files bhi hain.

## Auth pages chalane ke liye

`/admin/auth/*` pages `pnpm dev` par chalte hain, bas ye 15 packages chahiye jo
`package.json` me abhi nahi hain:

```bash
pnpm add @hookform/resolvers@^5.2.2 @radix-ui/react-alert-dialog@^1.1.15 \
  @radix-ui/react-dialog@^1.1.15 @radix-ui/react-label@^2.1.7 @radix-ui/react-slot@^1.2.3 \
  @radix-ui/react-tooltip@^1.2.8 axios@^1.16.1 class-variance-authority@^0.7.1 \
  input-otp@^1.4.2 lucide-react@^0.548.0 next-themes@^0.4.6 nuqs@^2.4.3 \
  react-hook-form@^7.65.0 sonner@^2.0.7 zod@^4.1.12
cp .env.example .env
pnpm dev
```

`/api/*` calls `next.config.ts` ke rewrites se `<backend>/admin/*` par jaate hain.
`<backend>` `INTERNAL_API_URL` ya `NEXT_PUBLIC_API_BASE_URL` se aata hai. Dono khaali
hon to `https://devapi.ad2ship.com` use hota hai. `ad2ship-marketplace-backend` me
abhi admin module nahi hai, admin auth API sirf `ad2ship-theme-backend` me hai.

## Abhi kya baaki hai

`pnpm build` abhi fail hoga, kyunki copy kiya hua baaki code in cheezon par depend
karta hai jo yahan nahi hain:

- `lib/` ki 6 files (`business-type`, `custom-theme`, `data-table`, `entitlements`,
  `format`, `module-title`)
- `hooks/` ki 3 files (`use-confirm`, `use-debounce`, `use-mobile`)
- `types/data-table`
- `features/seller` ki 3 files (`auth/api.service`, `search/api.service`,
  `wallet/hooks`), jo sidebar use karta hai
- baaki npm packages (`pnpm typecheck` se dikh jayenge)
- `app/(panel)/(dashboard)/admin/` ke route pages. Abhi `/admin/dashboard` bhi nahi
  hai, isliye OTP verify hone ke baad 404 aata hai.
- `app/admin/themes/` ke theme editor routes
- `middleware.ts`. Server-side admin route guard isi me hai. Ye dashboard pages ke
  saath aana chahiye. Abhi aaya to token wala admin har `/admin/auth/*` URL se
  `/admin/dashboard` ke 404 par redirect hoga.

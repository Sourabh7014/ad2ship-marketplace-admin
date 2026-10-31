# ad2ship-marketplace-admin

Ad2Ship marketplace ka admin panel. Neeche wale folders `ad2ship-theme-frontend`
se bina badle copy kiye gaye hain, taaki routes aur `@/...` imports same rahein.
Is repo me sirf admin hai — seller routes, logistics, storefront aur website nahi
liye gaye.

```
app/
  (panel)/
    layout.tsx, template.tsx
    (dashboard)/
      layout.tsx        ← sidebar, header, route guards
      admin/            ← abhi sirf error.tsx hai, route folders hata diye gaye hain
  layout.tsx, page.tsx, globals.css
components/      ← theme-frontend ka poora folder (ui, data-table, sidebar, editor, plate-ui, ...)
config/          ← data-table config
context/         ← React context providers (UserContext, ...)
features/admin/  ← abhi khaali hai, andar ke folders hata diye gaye hain
lib/utils.ts
lang/            ← i18n messages (en.json, hi.json)
public/          ← static assets
i18n.ts          ← next-intl config (locale NEXT_LOCALE cookie se)
```

`components/` poora liya gaya hai, isliye usme `seller-sidebar.tsx` aur
`customer-storefront.tsx` jaisi non-admin files bhi hain.

## Abhi kya baaki hai

Ye repo abhi build nahi hoga. Copy kiya hua code in cheezon par depend karta hai
jo yahan nahi hain:

- `lib/` ki 8 files (`cookie`, `entitlements`, `format`, ...)
- `hooks/` ki 3 files (`use-confirm`, `use-debounce`, `use-mobile`)
- `types/data-table`
- `features/seller` ki 5 files (`context/UserContext.tsx` aur sidebar inhe use karte hain)
- `features/admin/auth/api.service` (`components/sidebar/user-dropdown-content.tsx` ise use karta hai)
- 78 npm packages jo `package.json` me nahi hain
- `app/(panel)/(dashboard)/admin/` ke route pages (abhi koi `/admin/...` page nahi hai)
- `app/admin/` ke routes (login, verify-otp, theme editor). Ye `app/(panel)/admin/`
  me aayenge. `(panel)` route group hai, isliye URL wahi rahenge (`/admin/auth/login`, ...).

## Chalane ke liye

Upar wali cheezein aane ke baad:

```bash
pnpm install
cp .env.example .env
pnpm dev
```

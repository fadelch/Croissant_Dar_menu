# Croissant Dar — كروسان الدار

Phase 1 foundation for the Croissant Dar restaurant website.

## Local development

```bash
npm install
npm run dev
```

The application uses Next.js App Router, TypeScript, Tailwind CSS, ESLint, Zod,
Firebase, and `next-intl`. Public pages are available in Arabic at `/ar` and in
English at `/en`; `/` redirects to the default Arabic locale.

Copy `.env.example` to `.env.local` and provide the Firebase client values. Add
the Firebase Admin values only when future server-side features need them.
Authentication, menu data, cart, admin, and ordering behavior are intentionally
deferred to later phases.

## Firestore foundation

Phase 3 defines the `admins`, `categories`, and `menuItems` collections through
strict TypeScript models, Zod schemas, validated read mappings, public read
services, Firestore rules, and focused composite indexes. It does not seed menu
data or add database write operations.

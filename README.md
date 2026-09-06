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
Administrator authentication is documented below. Public menu data, management
CRUD, cart, and ordering behavior remain deferred to later phases.

## Firestore foundation

Phase 3 defines the `admins`, `categories`, and `menuItems` collections through
strict TypeScript models, Zod schemas, validated read mappings, public read
services, Firestore rules, and focused composite indexes. It does not seed menu
data or add database write operations.

## First administrator setup

The administrator claim can only be assigned by the trusted local bootstrap
script. There is no registration page or public claim-assignment endpoint.

1. In Firebase Console, enable the Email/Password sign-in provider.
2. Open **Authentication → Users → Add user** and create the administrator with
   an email address and password.
3. Copy the new user's Firebase Authentication UID.
4. Add `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, and
   `FIREBASE_ADMIN_PRIVATE_KEY` to `.env.local`. Keep escaped `\\n` characters in
   a one-line private key; the server converts them to real line breaks.
5. Run:

   ```bash
   node --env-file=.env.local scripts/bootstrap-admin.mjs <UID>
   ```

6. Confirm that the script reports a successful claim assignment. It also
   creates or updates `admins/{uid}` metadata without using that document as the
   authorization source.
7. Sign out and sign in again if this account was already signed in, ensuring a
   fresh ID token contains the new custom claim.
8. Start the project with `npm run dev`.
9. Visit `http://localhost:3000/admin/login`, sign in, and confirm the redirect
   to `/admin`.

The admin session lasts 12 hours and is stored only in an HttpOnly cookie. The
actual authorization source is the verified Firebase Authentication custom
claim `admin: true`, never the Firestore `role` field.

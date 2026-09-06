# Croissant Dar — كروسان الدار

Phase 1 foundation for the Croissant Dar restaurant website.

## Local development

```bash
npm install
npm run dev
```

The application uses Next.js App Router, TypeScript, Tailwind CSS, ESLint, Zod,
Firebase, and `next-intl`. The public website uses the single `/` URL. English
is the default language, and the language switch stores an Arabic or English
preference cookie without creating `/en` and `/ar` pages.

Copy `.env.example` to `.env.local` and provide the Firebase client values. Add
the Firebase Admin values only when future server-side features need them.
Administrator authentication is documented below. Public menu display,
menu-item management, cart, and ordering behavior remain deferred to later
phases.

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

## Server-side rate limiting

`POST /api/auth/session` is protected before JSON parsing and Firebase Admin
token verification. Its policy is five session-exchange requests per ten
minutes per client IP. A rejected request receives HTTP `429`, a safe message,
and `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and
`X-RateLimit-Reset` headers derived from the limiter result. Logout and public
pages are intentionally not rate limited.

Production uses a distributed Upstash Redis sliding-window limiter. Add these
server-only values to the deployment environment:

```dotenv
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-secret-token
APP_URL=https://your-production-domain.example
```

`APP_URL` gives the authentication endpoints an explicit allowed request
origin. If it is omitted, the request URL's origin is used, which supports
`http://localhost:3000` during local development. Origin checking is
defense-in-depth; Firebase token and admin-claim verification remain the actual
authentication and authorization controls.

When both Upstash variables are absent outside production, the app uses a small
in-memory sliding-window limiter for **development only**. It is not
production-safe: separate processes and serverless instances do not share it,
and every restart clears it. Production fails closed for the session endpoint
when Upstash is missing, malformed, or unavailable.

Client identifiers use the normalized first `x-forwarded-for` address, then
`x-real-ip`, then the stable `unknown-client` fallback. Proxy headers are only
trustworthy when the hosting platform replaces values supplied by clients. No
password, Firebase token, session cookie, or Redis credential is used in a
rate-limit key or written to logs.

The browser still sends email/password attempts directly to Firebase through
`signInWithEmailAndPassword()`. Therefore this application limiter protects the
Next.js session exchange and its server-side Firebase work; it does **not**
rate-limit incorrect password attempts that fail at Firebase. Firebase's abuse
protections and quotas cover that separate request path.

Category mutations reuse `configuredRateLimiter()` with the centralized
`adminMutation` policy and an identifier made from the verified admin UID plus
client IP. Future menu and upload routes can reuse the same boundary with their
appropriate policy.

## Administrator category management

Authenticated administrators can manage every category at `/admin/categories`.
The page lists active and inactive categories by `sortOrder`, provides one
shared create/edit form, supports status changes, and requires an explicit
confirmation before deletion.

Every Server Action independently verifies the revoked Firebase session and
`admin: true` claim, applies the 30-per-minute Admin mutation limit, and then
uses the existing category Zod schema. Firebase Admin services receive that
verified identity and never trust an identity, timestamp, or role from the
form. Firestore controls `createdAt` and `updatedAt` with server timestamps.

Slug availability is checked by query for compatibility with existing data and
reserved atomically in the internal `categorySlugs/{slug}` collection to prevent
simultaneous creates from claiming the same slug. This internal collection is
covered by the rules' deny-by-default fallback and is never exposed publicly.

Deletion queries `menuItems` for the category inside the transaction. If an
item exists, deletion stops rather than cascading or leaving an orphaned menu
item. Menu-item management itself remains deferred to Phase 7.

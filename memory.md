# 99 Billiards Handoff

## Project

Workspace: `E:\DEV\99Billiards`

Repository target: `git@github.com:huuanh/99Billiards.git`

Monorepo Next.js full-stack:

- `apps/web`: public landing website
- `apps/admin`: admin CMS
- `packages/db`: MongoDB/Mongoose models, seed data, R2 helpers
- `packages/config`: shared config/env helpers
- `packages/ui`: shared utility helpers

## Local URLs

- Public: `http://localhost:3000`
- Admin: `http://localhost:3001`
- Admin login dev: `admin@99billiards.local` / `99billiards`

## Current Env

Root `.env` is used locally by both apps via app `next.config.ts`.

Important env keys:

```env
MONGODB_URI=mongodb://localhost:27017/99billiards
ADMIN_JWT_SECRET=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
R2_PUBLIC_BASE_URL=...
```

Do not commit `.env`.

## What Is Implemented

Public web:

- Homepage landing with sections: products, branches, promotions, news, contact, booking.
- Branch detail pages: `/co-so/[id]`, e.g. `/co-so/cs1`.
- Promotion detail pages: `/uu-dai/[id]`, e.g. `/uu-dai/pr1`.
- News detail pages: `/tin-tuc/[id]`, e.g. `/tin-tuc/n1`.
- SEO metadata for detail pages.
- Booking modal and booking API: `POST /api/bookings`.
- Mobile sticky CTA bar: call, map, booking.
- Tracking scripts from CMS settings:
  - Google Analytics
  - Meta Pixel
  - TikTok Pixel

Admin CMS:

- Auth-protected admin with JWT httpOnly cookie.
- `/login`
- `/branches`: table + create/edit/delete; includes image, gallery, map, amenities, SEO fields.
- `/products`: table + create/edit/delete; image field.
- `/promotions`: table + create/edit/delete; content and SEO fields.
- `/posts`: table + create/edit/delete; content and SEO fields.
- `/bookings`: booking table, status update, delete.
- `/media`: R2 upload + Mongo-backed media library. Copy uploaded URL into image fields.
- `/settings`: homepage hero image, homepage hero card image, SEO defaults, tracking IDs.

Data:

- MongoDB local seed available via `npm run seed`.
- Seed data is UTF-8 Vietnamese and includes branch galleries/maps/amenities/SEO.
- Warning: `npm run seed` resets seeded collections and media assets. Do not run seed against production unless intentionally resetting.

## How To Run

```bash
npm install
npm run seed
npm run dev:web
npm run dev:admin
```

## Verification

Last known good verification:

```bash
npm run check:env
npm run lint
npm run build
npm run test:e2e
```

Expected:

- `check:env`: all OK when R2 + Mongo env are filled.
- `lint`: pass.
- `build`: pass.
- `test:e2e`: 11 passed.

Playwright tests:

- Public homepage booking.
- Public booking API.
- Public SEO detail pages.
- Admin auth redirect.
- Admin dashboard/tables.
- Admin media page.
- Admin settings page.

## Useful URLs To Test

Public:

- `http://localhost:3000/`
- `http://localhost:3000/co-so/cs1`
- `http://localhost:3000/co-so/cs7`
- `http://localhost:3000/uu-dai/pr1`
- `http://localhost:3000/tin-tuc/n1`

Admin:

- `http://localhost:3001/login`
- `http://localhost:3001/branches`
- `http://localhost:3001/products`
- `http://localhost:3001/promotions`
- `http://localhost:3001/posts`
- `http://localhost:3001/bookings`
- `http://localhost:3001/media`
- `http://localhost:3001/settings`

## Important Notes

- Images are now CMS-managed. To replace Unsplash/seed images with real 99 Billiards images:
  1. Upload image in `/media`.
  2. Copy public R2 URL.
  3. Paste into:
     - `/settings` for homepage hero images.
     - `/branches` for branch image/gallery.
     - `/products` for product image.
     - `/promotions` for promotion image.
     - `/posts` for news image.
- R2 upload was tested successfully after env was completed.
- Public homepage currently still has seed fallback image URLs. Once CMS settings are filled with real image URLs, the landing will use those.
- Root repo was initially not a git repo; initialize and push to GitHub after this handoff.

## Suggested Next Work

1. Improve admin image UX:
   - Add “copy URL” button in media library.
   - Add image picker modal instead of manual URL paste.

2. Improve public conversion:
   - Add branch filter/search on public.
   - Add “near me” / district selector.
   - Add visible booking CTA per branch card.

3. Improve booking operations:
   - Telegram/Zalo/email notification on new booking.
   - Booking filters by status/date/branch.
   - Branch-level staff permissions.

4. Production:
   - Deploy `apps/web` to `www.99billiards.vn`.
   - Deploy `apps/admin` to `admin.99billiards.vn`.
   - Use MongoDB Atlas or production Mongo.
   - Set strong `ADMIN_PASSWORD` and `ADMIN_JWT_SECRET`.
   - Do not run seed after real content/media is added.

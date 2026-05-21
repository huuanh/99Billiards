# 99 Billiards Deployment

## Local Development

```bash
npm install
npm run seed
npm run dev:web
npm run dev:admin
```

Local URLs:

- Public web: `http://localhost:3000`
- Admin CMS: `http://localhost:3001`

Default dev admin credentials, unless overridden in `.env`:

- Email: `admin@99billiards.local`
- Password: `99billiards`

## Required Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/99billiards
ADMIN_JWT_SECRET=change-this-secret-before-production
ADMIN_EMAIL=admin@99billiards.vn
ADMIN_PASSWORD=change-this-password

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
```

Check readiness:

```bash
npm run check:env
```

## Vercel Setup

Create two Vercel projects from the same repository:

1. Public website
   - Root directory: `apps/web`
   - Domain: `www.99billiards.vn`

2. Admin CMS
   - Root directory: `apps/admin`
   - Domain: `admin.99billiards.vn`

Set the same MongoDB, admin auth, and R2 variables in both projects when needed. The admin project needs all variables. The public project needs at least `MONGODB_URI`.

## Verification Before Deploy

```bash
npm run lint
npm run build
npm run test:e2e
```

Seed MongoDB once per environment:

```bash
npm run seed
```

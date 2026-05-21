# 99 Billiards Website

Monorepo Next.js full-stack cho public website va admin CMS cua chuoi 99 Billiards.

## Apps

- `apps/web`: public website
- `apps/admin`: admin CMS, deploy rieng tai `admin.99billiards.vn`

## Shared packages

- `packages/db`: MongoDB/Mongoose models, seed data va data access helpers
- `packages/config`: env/config helpers
- `packages/ui`: shared utilities/components nho

## Development

```bash
npm install
npm run dev:web
npm run dev:admin
```

Copy `.env.example` thanh `.env.local` trong tung app khi ket noi MongoDB/R2 that.

## Checks

```bash
npm run check:env
npm run lint
npm run build
npm run test:e2e
```

Deployment notes live in `DEPLOYMENT.md`.

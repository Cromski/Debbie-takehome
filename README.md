# Debbie Takehome

## Quick start

```bash
docker compose up -d
npm install
npm run build -w packages/common
npm run migrate -w packages/server
npm run seed -w packages/server    # optional: load sample data
```

## Development

```bash
npm run dev:server   # Express on :3001
npm run dev:client   # Vite on :5173 (proxies /api → :3001)
```

## Test

```bash
npm run test -w packages/server
```

## Project structure

- `packages/common` — shared TypeScript types
- `packages/server` — Express REST API + PostgreSQL
- `packages/client` — React SPA (Vite)

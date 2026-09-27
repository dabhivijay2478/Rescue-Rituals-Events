# Events monorepo

```
apps/
  backend/   — NestJS + Prisma API
  frontend/  — Next.js + shadcn/ui
```

NestJS + Prisma events platform with JWT auth, event CRUD, and capacity-aware RSVPs with a waitlist.

## Live URLs

| Service | URL |
|---------|-----|
| API | _Set after Railway deploy_ |
| Swagger | `{API_URL}/docs` |
| Web | _Set after Railway deploy_ |

## Quick start (local)

### 1. Database

```bash
docker compose up -d
cp apps/backend/.env.example apps/backend/.env
```

Postgres default: `localhost:5434`.

### 2. Install & API

```bash
npm install
npm run prisma:migrate -w backend
npm run prisma:seed -w backend
npm run dev:backend
```

- API: http://localhost:3000  
- Swagger: http://localhost:3000/docs  

### 3. Frontend

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
npm run dev:frontend
```

Web: http://localhost:3001 (shadcn/ui components)

## Demo accounts (seed)

| Email | Password | Notes |
|-------|----------|--------|
| `ada@events.dev` | `password123` | Host of seed events |
| `grace@events.dev` | `password123` | Already **GOING** on “Launch Night” (capacity 2) |

## Railway deployment

- **Backend service:** root directory `apps/backend`, use `apps/backend/Dockerfile`
- **Frontend service:** root directory `apps/frontend`, set `NEXT_PUBLIC_API_URL`
- **Postgres:** `DATABASE_URL`, `JWT_SECRET`, `WEB_ORIGIN` on backend

## Scripts (from repo root)

| Command | Description |
|---------|-------------|
| `npm run dev:backend` | API watch mode |
| `npm run dev:frontend` | Next.js dev server |
| `npm run build` | Build both apps |
| `npm run prisma:seed` | Seed demo data |

See [apps/backend/README.md](apps/backend/README.md) for API details, concurrency notes, and spike test.

# Backend (NestJS)

All API documentation, concurrency design, and spike test instructions live in the root [README](../../README.md) and below.

## Spike test

```bash
API_URL=http://localhost:3000 npm run spike:rsvp -w backend
```

## Concurrency (RSVP)

Atomic `UPDATE "Event" SET going_count = ...` inside a transaction; unique `(eventId, userId)` for idempotency. See root README for full write-up.

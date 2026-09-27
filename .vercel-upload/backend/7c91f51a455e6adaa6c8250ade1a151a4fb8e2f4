/**
 * Fires parallel RSVPs against a capped event and verifies capacity invariants.
 * Usage: EVENT_ID=<uuid> API_URL=http://localhost:3000 ts-node scripts/spike-rsvp.ts
 */
import { PrismaClient, RsvpStatus } from '@prisma/client';

const prisma = new PrismaClient();
const apiUrl = process.env.API_URL ?? 'http://localhost:3000';
const parallel = Number(process.env.SPIKE_PARALLEL ?? 30);

async function rsvp(token: string, eventId: string) {
  const res = await fetch(`${apiUrl}/events/${eventId}/rsvp`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status, body: await res.json() };
}

async function main() {
  let eventId = process.env.EVENT_ID;

  if (!eventId) {
    const event = await prisma.event.create({
      data: {
        title: 'Spike Test Event',
        description: 'Temporary event for concurrency spike',
        location: 'Test',
        startTime: new Date('2026-12-01T18:00:00.000Z'),
        endTime: new Date('2026-12-01T20:00:00.000Z'),
        capacity: 5,
        goingCount: 0,
        createdBy: {
          create: {
            email: `spike-host-${Date.now()}@events.dev`,
            password: 'unused',
            name: 'Spike Host',
          },
        },
      },
    });
    eventId = event.id;
    console.log(`Created spike event ${eventId} (capacity 5)`);
  }

  const users = await Promise.all(
    Array.from({ length: parallel }, async (_, i) => {
      const email = `spike-${Date.now()}-${i}@events.dev`;
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123',
          name: `Spike User ${i}`,
        }),
      });
      if (!res.ok) {
        throw new Error(`Register failed: ${res.status}`);
      }
      const body = (await res.json()) as { accessToken: string };
      return body.accessToken;
    }),
  );

  const results = await Promise.all(users.map((token) => rsvp(token, eventId!)));

  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });
  const counts = await prisma.rsvp.groupBy({
    by: ['status'],
    where: { eventId },
    _count: true,
  });

  const going =
    counts.find((c) => c.status === RsvpStatus.GOING)?._count ?? 0;
  const waitlisted =
    counts.find((c) => c.status === RsvpStatus.WAITLISTED)?._count ?? 0;

  console.log('HTTP statuses:', results.map((r) => r.status).join(', '));
  console.log({ goingCount: event.goingCount, going, waitlisted, capacity: event.capacity });

  if (event.capacity !== null && event.goingCount > event.capacity) {
    throw new Error('Oversold: going_count exceeds capacity');
  }
  if (event.goingCount !== going) {
    throw new Error('going_count does not match GOING RSVPs');
  }
  if (event.capacity !== null && going !== event.capacity) {
    throw new Error(`Expected ${event.capacity} GOING, got ${going}`);
  }
  if (waitlisted !== parallel - (event.capacity ?? 0)) {
    console.warn(
      `Waitlist count ${waitlisted} (expected ~${parallel - (event.capacity ?? 0)})`,
    );
  }

  console.log('Spike check passed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

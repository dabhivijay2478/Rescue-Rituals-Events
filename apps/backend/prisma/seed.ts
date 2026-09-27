import { PrismaClient, RsvpStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const ada = await prisma.user.upsert({
    where: { email: 'ada@events.dev' },
    update: {},
    create: {
      email: 'ada@events.dev',
      password,
      name: 'Ada Lovelace',
    },
  });

  const grace = await prisma.user.upsert({
    where: { email: 'grace@events.dev' },
    update: {},
    create: {
      email: 'grace@events.dev',
      password,
      name: 'Grace Hopper',
    },
  });

  const launch = await prisma.event.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      title: 'Launch Night',
      description: 'Celebrate the product launch — capacity 2, one seat already taken.',
      location: '123 Main St, San Francisco',
      startTime: new Date('2026-10-15T18:00:00.000Z'),
      endTime: new Date('2026-10-15T21:00:00.000Z'),
      capacity: 2,
      goingCount: 1,
      createdById: ada.id,
    },
  });

  await prisma.rsvp.upsert({
    where: {
      eventId_userId: { eventId: launch.id, userId: grace.id },
    },
    update: { status: RsvpStatus.GOING },
    create: {
      eventId: launch.id,
      userId: grace.id,
      status: RsvpStatus.GOING,
    },
  });

  await prisma.event.upsert({
    where: { id: '00000000-0000-4000-8000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000002',
      title: 'Retro Meetup',
      description: 'A past event for testing filters.',
      location: 'Virtual',
      startTime: new Date('2025-01-10T18:00:00.000Z'),
      endTime: new Date('2025-01-10T20:00:00.000Z'),
      capacity: 50,
      goingCount: 0,
      createdById: ada.id,
    },
  });

  await prisma.event.upsert({
    where: { id: '00000000-0000-4000-8000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000003',
      title: 'Open House',
      description: 'Unlimited capacity community gathering.',
      location: 'City Park',
      startTime: new Date('2026-11-01T14:00:00.000Z'),
      endTime: new Date('2026-11-01T17:00:00.000Z'),
      capacity: null,
      goingCount: 0,
      createdById: ada.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

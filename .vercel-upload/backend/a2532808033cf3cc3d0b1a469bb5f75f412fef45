import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RsvpStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListAttendeesQueryDto } from './dto/list-attendees-query.dto';

const rsvpInclude = {
  user: { select: { id: true, name: true, email: true } },
};

@Injectable()
export class RsvpService {
  constructor(private readonly prisma: PrismaService) {}

  async rsvp(eventId: string, userId: string) {
    await this.ensureEventExists(eventId);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const existing = await tx.rsvp.findUnique({
          where: { eventId_userId: { eventId, userId } },
          include: rsvpInclude,
        });

        if (
          existing &&
          (existing.status === RsvpStatus.GOING ||
            existing.status === RsvpStatus.WAITLISTED)
        ) {
          return existing;
        }

        const seatTaken = await this.tryTakeSeat(tx, eventId);
        const status = seatTaken ? RsvpStatus.GOING : RsvpStatus.WAITLISTED;

        if (existing) {
          return tx.rsvp.update({
            where: { id: existing.id },
            data: { status },
            include: rsvpInclude,
          });
        }

        return tx.rsvp.create({
          data: { eventId, userId, status },
          include: rsvpInclude,
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await this.prisma.rsvp.findUniqueOrThrow({
          where: { eventId_userId: { eventId, userId } },
          include: rsvpInclude,
        });
        return existing;
      }
      throw error;
    }
  }

  async cancelRsvp(eventId: string, userId: string) {
    await this.ensureEventExists(eventId);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.rsvp.findUnique({
        where: { eventId_userId: { eventId, userId } },
        include: rsvpInclude,
      });

      if (!existing) {
        throw new NotFoundException('RSVP not found');
      }

      if (existing.status === RsvpStatus.CANCELLED) {
        return existing;
      }

      if (existing.status === RsvpStatus.WAITLISTED) {
        return tx.rsvp.update({
          where: { id: existing.id },
          data: { status: RsvpStatus.CANCELLED },
          include: rsvpInclude,
        });
      }

      await tx.rsvp.update({
        where: { id: existing.id },
        data: { status: RsvpStatus.CANCELLED },
      });

      const next = await tx.rsvp.findFirst({
        where: { eventId, status: RsvpStatus.WAITLISTED },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      });

      if (next) {
        await tx.rsvp.update({
          where: { id: next.id },
          data: { status: RsvpStatus.GOING },
        });
      } else {
        await tx.$executeRaw`
          UPDATE "Event"
          SET going_count = GREATEST(going_count - 1, 0)
          WHERE id = ${eventId}
        `;
      }

      return tx.rsvp.findUniqueOrThrow({
        where: { id: existing.id },
        include: rsvpInclude,
      });
    });
  }

  async listAttendees(eventId: string, query: ListAttendeesQueryDto) {
    await this.ensureEventExists(eventId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.RsvpWhereInput = {
      eventId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.rsvp.count({ where }),
      this.prisma.rsvp.findMany({
        where,
        include: rsvpInclude,
        orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  private async ensureEventExists(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
  }

  private async tryTakeSeat(
    tx: Prisma.TransactionClient,
    eventId: string,
  ): Promise<boolean> {
    const rows = await tx.$queryRaw<{ id: string }[]>`
      UPDATE "Event"
      SET going_count = going_count + 1
      WHERE id = ${eventId}
        AND (capacity IS NULL OR going_count < capacity)
      RETURNING id
    `;
    return rows.length > 0;
  }
}

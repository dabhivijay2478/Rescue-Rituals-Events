import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventWhenFilter, ListEventsQueryDto } from './dto/list-events-query.dto';

const eventInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
};

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto) {
    this.validateTimes(dto.startTime, dto.endTime);
    if (dto.capacity !== undefined) {
      this.validateCapacity(dto.capacity);
    }

    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        capacity: dto.capacity ?? null,
        createdById: userId,
      },
      include: eventInclude,
    });
  }

  async findAll(query: ListEventsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const when = query.when ?? EventWhenFilter.UPCOMING;
    const now = new Date();

    const where: Prisma.EventWhereInput = {};
    if (when === EventWhenFilter.UPCOMING) {
      where.endTime = { gte: now };
    } else if (when === EventWhenFilter.PAST) {
      where.endTime = { lt: now };
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        include: eventInclude,
        orderBy: { startTime: when === EventWhenFilter.PAST ? 'desc' : 'asc' },
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

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: eventInclude,
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    const existing = await this.findOne(id);
    const startTime = dto.startTime ?? existing.startTime.toISOString();
    const endTime = dto.endTime ?? existing.endTime.toISOString();
    this.validateTimes(startTime, endTime);

    if (dto.capacity !== undefined) {
      this.validateCapacity(dto.capacity);
      if (dto.capacity < existing.goingCount) {
        throw new BadRequestException(
          'Capacity cannot be less than current going count',
        );
      }
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        capacity: dto.capacity,
      },
      include: eventInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.event.delete({ where: { id } });
    return { deleted: true };
  }

  private validateTimes(start: string, end: string) {
    if (new Date(end) <= new Date(start)) {
      throw new BadRequestException('endTime must be after startTime');
    }
  }

  private validateCapacity(capacity: number) {
    if (capacity < 1) {
      throw new BadRequestException('capacity must be at least 1');
    }
  }
}

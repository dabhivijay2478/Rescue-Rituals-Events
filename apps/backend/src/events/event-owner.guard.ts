import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class EventOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser;
    const eventId = request.params.id as string;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { createdById: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.createdById !== user.id) {
      throw new ForbiddenException('You can only modify your own events');
    }

    request.event = event;
    return true;
  }
}

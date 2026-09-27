import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventOwnerGuard } from './event-owner.guard';

@Module({
  controllers: [EventsController],
  providers: [EventsService, EventOwnerGuard],
  exports: [EventsService],
})
export class EventsModule {}

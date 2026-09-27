import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';
import {
  EventResponseDto,
  PaginatedEventsResponseDto,
} from './dto/event-response.dto';
import { EventOwnerGuard } from './event-owner.guard';
import { EventsService } from './events.service';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an event (authenticated)' })
  @ApiCreatedResponse({ type: EventResponseDto })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List events (paginated, filter by upcoming/past)' })
  @ApiOkResponse({ type: PaginatedEventsResponseDto })
  findAll(@Query() query: ListEventsQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by id' })
  @ApiOkResponse({ type: EventResponseDto })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, EventOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own event' })
  @ApiOkResponse({ type: EventResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, EventOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own event' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}

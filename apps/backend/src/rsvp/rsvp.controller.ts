import {
  Controller,
  Delete,
  Get,
  Param,
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
import { ListAttendeesQueryDto } from './dto/list-attendees-query.dto';
import {
  PaginatedAttendeesResponseDto,
  RsvpResponseDto,
} from './dto/rsvp-response.dto';
import { RsvpService } from './rsvp.service';

@ApiTags('rsvp')
@Controller('events')
export class RsvpController {
  constructor(private readonly rsvpService: RsvpService) {}

  @Post(':id/rsvp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'RSVP to an event (idempotent, capacity-aware)' })
  @ApiCreatedResponse({ type: RsvpResponseDto })
  rsvp(@Param('id') eventId: string, @CurrentUser() user: AuthUser) {
    return this.rsvpService.rsvp(eventId, user.id);
  }

  @Delete(':id/rsvp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancel own RSVP and promote earliest waitlisted attendee',
  })
  @ApiOkResponse({ type: RsvpResponseDto })
  cancelRsvp(@Param('id') eventId: string, @CurrentUser() user: AuthUser) {
    return this.rsvpService.cancelRsvp(eventId, user.id);
  }

  @Get(':id/attendees')
  @ApiOperation({ summary: 'List event attendees (paginated)' })
  @ApiOkResponse({ type: PaginatedAttendeesResponseDto })
  listAttendees(
    @Param('id') eventId: string,
    @Query() query: ListAttendeesQueryDto,
  ) {
    return this.rsvpService.listAttendees(eventId, query);
  }
}

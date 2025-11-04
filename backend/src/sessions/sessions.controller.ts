import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  SessionSearchDto,
  MarkAttendanceDto,
} from './dto/session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole as Role } from '@shared/enums';

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @ApiOperation({ summary: 'Create a new training session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createSessionDto: CreateSessionDto) {
    // For now, use a default team ID. In a real app, this would come from the user's team
    const teamId = 'team-1';
    return this.sessionsService.create(createSessionDto, teamId);
  }

  @ApiOperation({ summary: 'Get all training sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  @Get()
  findAll(@Query() searchDto: SessionSearchDto) {
    // For now, use a default team ID. In a real app, this would come from the user's team
    const teamId = 'team-1';
    return this.sessionsService.findAll(searchDto, teamId);
  }

  @ApiOperation({ summary: 'Get a training session by ID' })
  @ApiResponse({ status: 200, description: 'Session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a training session' })
  @ApiResponse({ status: 200, description: 'Session updated successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionsService.update(id, updateSessionDto);
  }

  @ApiOperation({ summary: 'Delete a training session' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionsService.remove(id);
  }

  @ApiOperation({ summary: 'Register for a training session' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Registration failed' })
  @Post(':id/register')
  @HttpCode(HttpStatus.OK)
  async register(@Param('id') sessionId: string, @Request() req: any) {
    // Get member ID from user
    const member = await this.getMemberFromUser(req.user.id);
    return this.sessionsService.register(sessionId, member.id);
  }

  @ApiOperation({ summary: 'Unregister from a training session' })
  @ApiResponse({ status: 200, description: 'Unregistration successful' })
  @Delete(':id/register')
  async unregister(@Param('id') sessionId: string, @Request() req: any) {
    // Get member ID from user
    const member = await this.getMemberFromUser(req.user.id);
    return this.sessionsService.unregister(sessionId, member.id);
  }

  @ApiOperation({ summary: 'Mark attendance for a session' })
  @ApiResponse({ status: 200, description: 'Attendance marked successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/attendance/:memberId')
  markAttendance(
    @Param('id') sessionId: string,
    @Param('memberId') memberId: string,
    @Body() markAttendanceDto: MarkAttendanceDto,
  ) {
    return this.sessionsService.markAttendance(
      sessionId,
      memberId,
      markAttendanceDto.status,
      markAttendanceDto.reason,
    );
  }

  @ApiOperation({ summary: 'Get attendance statistics' })
  @ApiResponse({ status: 200, description: 'Attendance stats retrieved successfully' })
  @ApiQuery({ name: 'memberId', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @Get('attendance/stats')
  getAttendanceStats(
    @Query('memberId') memberId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    // For now, use a default team ID. In a real app, this would come from the user's team
    const teamId = 'team-1';
    return this.sessionsService.getAttendanceStats(memberId, teamId, dateFrom, dateTo);
  }

  private async getMemberFromUser(userId: string) {
    // This is a helper method to get member from user ID
    // In a real implementation, you might want to inject PrismaService or create a separate service
    const { PrismaService } = await import('../prisma/prisma.service');
    const prisma = new PrismaService();

    const member = await prisma.member.findUnique({
      where: { userId },
    });

    if (!member) {
      throw new Error('Member not found for user');
    }

    return member;
  }
}

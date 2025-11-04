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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MembersService } from './members.service';
import {
  CreateMemberDto,
  UpdateMemberDto,
  MemberSearchDto,
  AssignToTeamDto,
} from './dto/member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole as Role } from '../shared-types';
import { AuthenticatedRequest } from '../types/express.types';

@ApiTags('Members')
@Controller('members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @ApiOperation({ summary: 'Create member profile' })
  @ApiResponse({ status: 201, description: 'Member profile created successfully' })
  @ApiResponse({ status: 409, description: 'User already has a member profile' })
  @Post()
  async create(@Request() req: AuthenticatedRequest, @Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(req.user.id, createMemberDto);
  }

  @ApiOperation({ summary: 'Get all members with search and pagination' })
  @ApiResponse({ status: 200, description: 'Members retrieved successfully' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name, nickname, email, or phone',
  })
  @ApiQuery({
    name: 'position',
    required: false,
    enum: ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'],
  })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'LEFT'] })
  @ApiQuery({ name: 'memberType', required: false, enum: ['OFFICIAL', 'TRIAL', 'GUEST'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  async findAll(@Query() searchDto: MemberSearchDto) {
    return this.membersService.findAll(searchDto);
  }

  @ApiOperation({ summary: 'Get member statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('statistics')
  async getStatistics() {
    return this.membersService.getStatistics();
  }

  @ApiOperation({ summary: 'Get current user member profile' })
  @ApiResponse({ status: 200, description: 'Member profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Member profile not found' })
  @Get('me')
  async getMyProfile(@Request() req: AuthenticatedRequest) {
    const member = await this.membersService.findByUserId(req.user.id);
    if (!member) {
      return { message: 'No member profile found' };
    }
    return member;
  }

  @ApiOperation({ summary: 'Get member profile with dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Member profile with dashboard data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Member profile not found' })
  @Get('profile/:userId')
  async getMemberProfile(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.membersService.getMemberProfile(userId);
  }

  @ApiOperation({ summary: 'Get member by ID' })
  @ApiResponse({ status: 200, description: 'Member retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.membersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update member profile' })
  @ApiResponse({ status: 200, description: 'Member updated successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @Request() req: AuthenticatedRequest,
  ) {
    // Members can only update their own profile, admins can update any
    if (req.user.role !== 'ADMIN') {
      const member = await this.membersService.findOne(id);
      if (member.userId !== req.user.id) {
        throw new Error('You can only update your own profile');
      }
    }

    return this.membersService.update(id, updateMemberDto);
  }

  @ApiOperation({ summary: 'Delete member' })
  @ApiResponse({ status: 200, description: 'Member deleted successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.membersService.remove(id);
    return { message: 'Member deleted successfully' };
  }

  @ApiOperation({ summary: 'Assign members to team' })
  @ApiResponse({ status: 200, description: 'Members assigned to team successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('assign-to-team')
  async assignToTeam(@Body() assignToTeamDto: AssignToTeamDto) {
    await this.membersService.assignToTeam(assignToTeamDto.teamId, assignToTeamDto.memberIds);
    return { message: 'Members assigned to team successfully' };
  }

  @ApiOperation({ summary: 'Remove members from team' })
  @ApiResponse({ status: 200, description: 'Members removed from team successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('remove-from-team/:teamId')
  async removeFromTeam(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Body() body: { memberIds: string[] },
  ) {
    await this.membersService.removeFromTeam(teamId, body.memberIds);
    return { message: 'Members removed from team successfully' };
  }
}

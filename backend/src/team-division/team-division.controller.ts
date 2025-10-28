import { Controller, Get, Post, Body, UseGuards, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeamDivisionService } from './team-division.service';
import { DivideTeamsDto, SaveFormationDto } from './dto/team-division.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Team Division')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('team-division')
export class TeamDivisionController {
  constructor(private readonly teamDivisionService: TeamDivisionService) {}

  @ApiOperation({ summary: 'Divide participants into teams' })
  @ApiResponse({ status: 200, description: 'Teams divided successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Post('divide')
  divideTeams(@Body() divideTeamsDto: DivideTeamsDto) {
    return this.teamDivisionService.divideTeams(divideTeamsDto);
  }

  @ApiOperation({ summary: 'Save a team formation' })
  @ApiResponse({ status: 201, description: 'Formation saved successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('formations')
  saveFormation(@Body() saveFormationDto: SaveFormationDto) {
    return this.teamDivisionService.saveFormation(saveFormationDto);
  }

  @ApiOperation({ summary: 'Get saved formations' })
  @ApiResponse({ status: 200, description: 'Formations retrieved successfully' })
  @Get('formations')
  getSavedFormations() {
    return this.teamDivisionService.getSavedFormations();
  }

  @ApiOperation({ summary: 'Get formation by ID' })
  @ApiResponse({ status: 200, description: 'Formation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Formation not found' })
  @Get('formations/:id')
  getFormationById(@Param('id') id: string) {
    return this.teamDivisionService.getFormationById(id);
  }

  @ApiOperation({ summary: 'Update a saved formation' })
  @ApiResponse({ status: 200, description: 'Formation updated successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('formations/:id')
  updateFormation(@Param('id') id: string, @Body() updateData: Partial<SaveFormationDto>) {
    return this.teamDivisionService.updateFormation(id, updateData);
  }

  @ApiOperation({ summary: 'Delete a saved formation' })
  @ApiResponse({ status: 200, description: 'Formation deleted successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('formations/:id')
  deleteFormation(@Param('id') id: string) {
    return this.teamDivisionService.deleteFormation(id);
  }
}

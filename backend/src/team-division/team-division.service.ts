import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DivideTeamsDto, SaveFormationDto, TeamDivisionResult } from './dto/team-division.dto';
// Position enum replaced with string literal

interface Participant {
  id: string;
  name: string;
  skill: number;
  position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
}

interface Team {
  participants: Participant[];
  totalScore: number;
  positionCounts: Record<'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD', number>;
}

interface PositionStats {
  position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
  count: number;
  totalScore: number;
}

@Injectable()
export class TeamDivisionService {
  constructor(private prisma: PrismaService) {}

  async divideTeams(divideTeamsDto: DivideTeamsDto): Promise<TeamDivisionResult> {
    const { participantIds, numberOfTeams, balanceStrategy = 'BALANCED' } = divideTeamsDto;

    if (participantIds.length === 0) {
      throw new BadRequestException('Chưa có người chơi nào trong danh sách');
    }

    if (numberOfTeams < 2 || numberOfTeams > 6) {
      throw new BadRequestException('Số đội phải từ 2 đến 6');
    }

    // Get participants from database
    const members = await this.prisma.member.findMany({
      where: {
        id: { in: participantIds },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (members.length !== participantIds.length) {
      throw new BadRequestException('Một số thành viên không tồn tại');
    }

    const participants: Participant[] = members.map(member => ({
      id: member.id,
      name: member.fullName,
      skill: this.calculateMemberSkill(member),
      position: member.position,
    }));

    let teams: Team[];

    switch (balanceStrategy) {
      case 'RANDOM':
        teams = this.divideRandomly(participants, numberOfTeams);
        break;
      case 'SKILL_BALANCED':
        teams = this.divideBySkill(participants, numberOfTeams);
        break;
      case 'POSITION_BALANCED':
        teams = this.divideByPosition(participants, numberOfTeams);
        break;
      case 'BALANCED':
      default:
        teams = this.divideBalanced(participants, numberOfTeams);
        break;
    }

    return {
      teams: teams.map((team, index) => ({
        name: `Đội ${index + 1}`,
        participants: team.participants,
        totalScore: team.totalScore,
        positionStats: this.getPositionStats(team.participants),
      })),
      summary: {
        totalParticipants: participants.length,
        averageSkill: participants.reduce((sum, p) => sum + p.skill, 0) / participants.length,
        positionDistribution: this.getOverallPositionStats(participants),
      },
    };
  }
  private calculateMemberSkill(member: any): number {
    // Simple skill calculation based on member data
    let baseSkill = 3; // Default skill level

    // Adjust based on member type
    if (member.memberType === 'OFFICIAL') baseSkill += 0.5;
    if (member.memberType === 'TRIAL') baseSkill -= 0.5;

    // Adjust based on position (goalkeepers might have different scaling)
    if (member.position === 'GOALKEEPER') baseSkill += 0.3;

    return Math.max(1, Math.min(5, Math.round(baseSkill * 10) / 10));
  }

  private divideRandomly(participants: Participant[], numberOfTeams: number): Team[] {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const teams: Team[] = Array.from({ length: numberOfTeams }, () => ({
      participants: [],
      totalScore: 0,
      positionCounts: this.initializePositionCounts(),
    }));

    shuffled.forEach((participant, index) => {
      const teamIndex = index % numberOfTeams;
      teams[teamIndex].participants.push(participant);
      teams[teamIndex].totalScore += participant.skill;
      teams[teamIndex].positionCounts[participant.position]++;
    });

    return teams;
  }

  private divideBySkill(participants: Participant[], numberOfTeams: number): Team[] {
    const sorted = [...participants].sort((a, b) => b.skill - a.skill);
    const teams: Team[] = Array.from({ length: numberOfTeams }, () => ({
      participants: [],
      totalScore: 0,
      positionCounts: this.initializePositionCounts(),
    }));

    // Snake draft: 1,2,3,4,4,3,2,1,1,2,3,4...
    let currentTeam = 0;
    let direction = 1;

    for (const participant of sorted) {
      teams[currentTeam].participants.push(participant);
      teams[currentTeam].totalScore += participant.skill;
      teams[currentTeam].positionCounts[participant.position]++;

      currentTeam += direction;
      if (currentTeam === numberOfTeams) {
        currentTeam = numberOfTeams - 1;
        direction = -1;
      } else if (currentTeam === -1) {
        currentTeam = 0;
        direction = 1;
      }
    }

    return teams;
  }

  private divideByPosition(participants: Participant[], numberOfTeams: number): Team[] {
    const teams: Team[] = Array.from({ length: numberOfTeams }, () => ({
      participants: [],
      totalScore: 0,
      positionCounts: this.initializePositionCounts(),
    }));

    // Group by position
    const positionGroups: Record<
      'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD',
      Participant[]
    > = {
      GOALKEEPER: [],
      DEFENDER: [],
      MIDFIELDER: [],
      FORWARD: [],
    };

    participants.forEach(p => {
      positionGroups[p.position].push(p);
    });

    // Distribute each position group
    (['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'] as const).forEach(position => {
      const group = positionGroups[position].sort(() => Math.random() - 0.5);
      group.forEach((participant, index) => {
        const teamIndex = index % numberOfTeams;
        teams[teamIndex].participants.push(participant);
        teams[teamIndex].totalScore += participant.skill;
        teams[teamIndex].positionCounts[participant.position]++;
      });
    });

    return teams;
  }
  private divideBalanced(participants: Participant[], numberOfTeams: number): Team[] {
    const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
    const teams: Team[] = Array.from({ length: numberOfTeams }, () => ({
      participants: [],
      totalScore: 0,
      positionCounts: this.initializePositionCounts(),
    }));

    // Initial distribution
    const baseTeamSize = Math.floor(shuffledParticipants.length / numberOfTeams);
    const extraPlayers = shuffledParticipants.length % numberOfTeams;

    let playerIndex = 0;
    for (let i = 0; i < numberOfTeams; i++) {
      const teamSize = i < extraPlayers ? baseTeamSize + 1 : baseTeamSize;
      const teamParticipants = shuffledParticipants.slice(playerIndex, playerIndex + teamSize);

      teams[i].participants = teamParticipants;
      teams[i].totalScore = teamParticipants.reduce((sum, p) => sum + p.skill, 0);
      teamParticipants.forEach(p => {
        teams[i].positionCounts[p.position]++;
      });

      playerIndex += teamSize;
    }

    // Balance teams with improved algorithm
    this.balanceTeams(teams, 1000);

    return teams;
  }

  private balanceTeams(teams: Team[], maxIterations: number): void {
    const MAX_SCORE_DIFF = 2;
    const MAX_POSITION_DIFF = 1;

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let improved = false;

      // 1. Balance total scores
      const teamScores = teams.map(team => team.totalScore);
      const maxScore = Math.max(...teamScores);
      const minScore = Math.min(...teamScores);

      if (maxScore - minScore > MAX_SCORE_DIFF) {
        const maxTeamIndex = teamScores.indexOf(maxScore);
        const minTeamIndex = teamScores.indexOf(minScore);
        const maxTeam = teams[maxTeamIndex];
        const minTeam = teams[minTeamIndex];

        // Find best swap to balance scores
        const bestSwap = this.findBestScoreSwap(maxTeam, minTeam, MAX_SCORE_DIFF);
        if (bestSwap) {
          this.swapParticipants(maxTeam, minTeam, bestSwap.fromMax, bestSwap.fromMin);
          improved = true;
          continue;
        }
      }

      // 2. Balance positions
      for (const position of ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'] as const) {
        const positionCounts = teams.map(team => team.positionCounts[position]);
        const maxCount = Math.max(...positionCounts);
        const minCount = Math.min(...positionCounts);

        if (maxCount - minCount > MAX_POSITION_DIFF) {
          const maxTeamIndex = positionCounts.indexOf(maxCount);
          const minTeamIndex = positionCounts.indexOf(minCount);
          const maxTeam = teams[maxTeamIndex];
          const minTeam = teams[minTeamIndex];

          // Find swap that balances position without breaking score balance
          const swap = this.findPositionBalanceSwap(maxTeam, minTeam, position, MAX_SCORE_DIFF);
          if (swap) {
            this.swapParticipants(maxTeam, minTeam, swap.fromMax, swap.fromMin);
            improved = true;
            break;
          }
        }
      }

      if (!improved) break;
    }
  }
  private findBestScoreSwap(maxTeam: Team, minTeam: Team, maxScoreDiff: number) {
    let bestSwap = null;
    let bestScoreDiff = maxTeam.totalScore - minTeam.totalScore;

    for (const playerFromMax of maxTeam.participants) {
      for (const playerFromMin of minTeam.participants) {
        if (playerFromMax.position === playerFromMin.position) {
          const newMaxScore = maxTeam.totalScore - playerFromMax.skill + playerFromMin.skill;
          const newMinScore = minTeam.totalScore - playerFromMin.skill + playerFromMax.skill;
          const newScoreDiff = Math.abs(newMaxScore - newMinScore);

          if (newScoreDiff < bestScoreDiff && newScoreDiff <= maxScoreDiff) {
            bestScoreDiff = newScoreDiff;
            bestSwap = { fromMax: playerFromMax, fromMin: playerFromMin };
          }
        }
      }
    }

    return bestSwap;
  }

  private findPositionBalanceSwap(
    maxTeam: Team,
    minTeam: Team,
    position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD',
    maxScoreDiff: number,
  ) {
    const playersFromMax = maxTeam.participants.filter(p => p.position === position);
    const playersFromMin = minTeam.participants.filter(p => p.position !== position);

    for (const playerFromMax of playersFromMax) {
      for (const playerFromMin of playersFromMin) {
        const newMaxScore = maxTeam.totalScore - playerFromMax.skill + playerFromMin.skill;
        const newMinScore = minTeam.totalScore - playerFromMin.skill + playerFromMax.skill;

        if (Math.abs(newMaxScore - newMinScore) <= maxScoreDiff) {
          return { fromMax: playerFromMax, fromMin: playerFromMin };
        }
      }
    }

    return null;
  }

  private swapParticipants(
    team1: Team,
    team2: Team,
    player1: Participant,
    player2: Participant,
  ): void {
    // Remove players from their current teams
    const player1Index = team1.participants.indexOf(player1);
    const player2Index = team2.participants.indexOf(player2);

    team1.participants[player1Index] = player2;
    team2.participants[player2Index] = player1;

    // Update scores
    team1.totalScore = team1.totalScore - player1.skill + player2.skill;
    team2.totalScore = team2.totalScore - player2.skill + player1.skill;

    // Update position counts
    team1.positionCounts[player1.position]--;
    team1.positionCounts[player2.position]++;
    team2.positionCounts[player2.position]--;
    team2.positionCounts[player1.position]++;
  }

  private initializePositionCounts(): Record<
    'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD',
    number
  > {
    return {
      GOALKEEPER: 0,
      DEFENDER: 0,
      MIDFIELDER: 0,
      FORWARD: 0,
    };
  }

  private getPositionStats(participants: Participant[]): PositionStats[] {
    const stats: PositionStats[] = [];

    for (const position of ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'] as const) {
      const positionPlayers = participants.filter(p => p.position === position);
      stats.push({
        position: position as 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD',
        count: positionPlayers.length,
        totalScore: positionPlayers.reduce((sum, p) => sum + p.skill, 0),
      });
    }

    return stats;
  }

  private getOverallPositionStats(
    participants: Participant[],
  ): Record<'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD', number> {
    const stats = this.initializePositionCounts();
    participants.forEach(p => {
      stats[p.position]++;
    });
    return stats;
  }
  // Formation management
  async saveFormation(
    saveFormationDto: SaveFormationDto,
    teamId: string = 'fc-vui-ve',
  ): Promise<any> {
    const { name, description, teams } = saveFormationDto;

    // Check if formation name already exists for this team
    const existingFormation = await this.prisma.savedFormation.findFirst({
      where: {
        teamId,
        name,
      },
    });

    if (existingFormation) {
      throw new BadRequestException('Tên đội hình đã tồn tại');
    }

    return this.prisma.savedFormation.create({
      data: {
        teamId,
        name,
        description,
        formationData: teams as any,
      },
      include: {
        team: true,
      },
    });
  }

  async getSavedFormations(teamId: string = 'fc-vui-ve'): Promise<any[]> {
    return this.prisma.savedFormation.findMany({
      where: {
        teamId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        team: true,
      },
    });
  }

  async getFormationById(id: string): Promise<any> {
    const formation = await this.prisma.savedFormation.findUnique({
      where: { id },
      include: {
        team: true,
      },
    });

    if (!formation) {
      throw new BadRequestException('Không tìm thấy đội hình');
    }

    return formation;
  }

  async deleteFormation(id: string): Promise<any> {
    const _formation = await this.getFormationById(id);

    return this.prisma.savedFormation.delete({
      where: { id },
    });
  }

  async updateFormation(id: string, updateData: Partial<SaveFormationDto>): Promise<any> {
    await this.getFormationById(id);

    return this.prisma.savedFormation.update({
      where: { id },
      data: {
        ...updateData,
        formationData: updateData.teams ? (updateData.teams as any) : undefined,
      },
      include: {
        team: true,
      },
    });
  }
}

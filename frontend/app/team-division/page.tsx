'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Trash2, Plus, Users, Hand } from 'lucide-react';
import api from '@/lib/axios';
import { ManualTeamDivision } from '@/components/team-division/manual-team-division';

type Position = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
type BalanceStrategy = 'RANDOM' | 'SKILL_BALANCED' | 'POSITION_BALANCED' | 'BALANCED';

interface Member {
  id: string;
  fullName: string;
  position: Position;
  memberType: 'OFFICIAL' | 'TRIAL' | 'GUEST';
  status: 'ACTIVE' | 'INACTIVE' | 'LEFT';
}

interface Participant {
  id: string;
  name: string;
  skill: number;
  position: Position;
}

interface Team {
  name: string;
  participants: Participant[];
  totalScore: number;
  positionStats: PositionStats[];
}

interface PositionStats {
  position: Position;
  count: number;
  totalScore: number;
}

const positionNames: Record<Position, string> = {
  GOALKEEPER: 'Thủ môn',
  DEFENDER: 'Hậu vệ',
  MIDFIELDER: 'Tiền vệ',
  FORWARD: 'Tiền đạo',
};

const balanceStrategyNames: Record<BalanceStrategy, string> = {
  RANDOM: 'Ngẫu nhiên',
  SKILL_BALANCED: 'Cân bằng kỹ năng',
  POSITION_BALANCED: 'Cân bằng vị trí',
  BALANCED: 'Cân bằng tổng thể',
};

export default function TeamDivisionPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [numberOfTeams, setNumberOfTeams] = useState(2);
  const [balanceStrategy, setBalanceStrategy] = useState<BalanceStrategy>('BALANCED');
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Load members from API
  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const response = await api.get('/members');
      setMembers(response.data.data || []);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const addParticipant = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const participant: Participant = {
      id: member.id,
      name: member.fullName,
      skill: calculateMemberSkill(member),
      position: member.position,
    };

    setParticipants(prev => [...prev, participant]);
    setSelectedMembers(prev => [...prev, memberId]);
  };

  const removeParticipant = (index: number) => {
    const participant = participants[index];
    setParticipants(prev => prev.filter((_, i) => i !== index));
    setSelectedMembers(prev => prev.filter(id => id !== participant.id));
  };

  const calculateMemberSkill = (member: Member): number => {
    // Simple skill calculation
    let baseSkill = 3;
    if (member.memberType === 'OFFICIAL') baseSkill += 0.5;
    if (member.memberType === 'TRIAL') baseSkill -= 0.5;
    if (member.position === 'GOALKEEPER') baseSkill += 0.3;
    return Math.max(1, Math.min(5, Math.round(baseSkill * 10) / 10));
  };

  const generateTeams = async () => {
    if (participants.length === 0) {
      alert('Chưa có người chơi nào trong danh sách. Vui lòng thêm người chơi trước khi tạo đội.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/team-division/divide', {
        participantIds: participants.map(p => p.id),
        numberOfTeams,
        balanceStrategy,
      });

      setTeams(response.data.teams);
    } catch (error) {
      console.error('Error dividing teams:', error);
      alert('Có lỗi xảy ra khi chia đội. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionDisplay = (position: Position) => `${position} (${positionNames[position]})`;

  const getGridClassName = () => {
    switch (numberOfTeams) {
      case 2:
        return 'grid grid-cols-2 gap-4';
      case 3:
        return 'grid grid-cols-3 gap-4';
      case 4:
        return 'grid grid-cols-2 gap-4';
      case 6:
        return 'grid grid-cols-3 gap-4';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    }
  };

  const availableMembers = members.filter(member => !selectedMembers.includes(member.id));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Chia đội</h1>
          <p className="text-muted-foreground">
            Chia thành viên thành các đội cân bằng cho trận đấu
          </p>
        </div>

        <Tabs defaultValue="auto" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="auto" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Chia đội tự động
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Hand className="h-4 w-4" />
              Chia đội thủ công
            </TabsTrigger>
          </TabsList>

          <TabsContent value="auto" className="space-y-6 mt-6">

        <Card>
          <CardHeader>
            <CardTitle>Chọn thành viên</CardTitle>
            <CardDescription>Chọn thành viên tham gia chia đội</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Thành viên có sẵn</Label>
                  <div className="mt-2 max-h-60 overflow-y-auto rounded-md border p-2">
                    {availableMembers.map(member => (
                      <div
                        key={member.id}
                        className="flex cursor-pointer items-center justify-between rounded p-2 hover:bg-accent"
                        onClick={() => addParticipant(member.id)}
                      >
                        <div>
                          <p className="font-medium">{member.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {getPositionDisplay(member.position)} - Kỹ năng:{' '}
                            {calculateMemberSkill(member)}
                          </p>
                        </div>
                        <Plus className="h-4 w-4" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Thành viên đã chọn ({participants.length})</Label>
                  <div className="mt-2 max-h-60 overflow-y-auto rounded-md border p-2">
                    {participants.map((participant, index) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between rounded p-2 hover:bg-accent"
                      >
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {getPositionDisplay(participant.position)} - Kỹ năng:{' '}
                            {participant.skill}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeParticipant(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cài đặt chia đội</CardTitle>
            <CardDescription>Chọn số lượng đội và chiến lược chia đội</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="teams">Số lượng đội</Label>
                <Select
                  value={numberOfTeams.toString()}
                  onValueChange={value => setNumberOfTeams(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Số đội" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} đội
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="strategy">Chiến lược chia đội</Label>
                <Select
                  value={balanceStrategy}
                  onValueChange={(value: BalanceStrategy) => setBalanceStrategy(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chiến lược" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(balanceStrategyNames).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={generateTeams}
                  disabled={isLoading || participants.length === 0}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Đang chia đội...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Chia đội
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {teams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Kết quả chia đội</CardTitle>
              <CardDescription>Các đội được tạo dựa trên chiến lược đã chọn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Summary Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border text-sm">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 text-left">Vị trí</th>
                        {teams.map((_, index) => (
                          <th key={index} className="border p-2 text-center">
                            Đội {index + 1}
                          </th>
                        ))}
                        <th className="border p-2 text-center">Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(positionNames).map(([pos]) => {
                        const teamStats = teams.map(team =>
                          team.positionStats.find(s => s.position === pos)
                        );
                        const totalCount = teamStats.reduce(
                          (sum, stat) => sum + (stat?.count || 0),
                          0
                        );
                        const totalScore = teamStats.reduce(
                          (sum, stat) => sum + (stat?.totalScore || 0),
                          0
                        );

                        return (
                          <tr key={pos}>
                            <td className="border p-2">{getPositionDisplay(pos as Position)}</td>
                            {teamStats.map((stat, index) => (
                              <td key={index} className="border p-2 text-center">
                                {stat?.count ? `${stat.count} người (${stat.totalScore}đ)` : '-'}
                              </td>
                            ))}
                            <td className="border p-2 text-center font-bold">
                              {totalCount > 0 ? `${totalCount} người (${totalScore}đ)` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-muted font-bold">
                        <td className="border p-2">Tổng</td>
                        {teams.map((team, index) => (
                          <td key={index} className="border p-2 text-center">
                            {team.participants.length} người ({team.totalScore}đ)
                          </td>
                        ))}
                        <td className="border p-2 text-center">
                          {participants.length} người (
                          {participants.reduce((sum, p) => sum + p.skill, 0)}đ)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Team Cards */}
                <div className={getGridClassName()}>
                  {teams.map((team, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {team.name} (Tổng điểm: {team.totalScore}, Số người:{' '}
                          {team.participants.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(positionNames).map(([position]) => {
                            const positionPlayers = team.participants.filter(
                              p => p.position === position
                            );
                            return (
                              <div key={position}>
                                <h4 className="text-sm font-semibold">
                                  {getPositionDisplay(position as Position)}:
                                </h4>
                                {positionPlayers.length > 0 ? (
                                  <ul className="list-disc space-y-1 pl-5">
                                    {positionPlayers.map((member, memberIndex) => (
                                      <li key={memberIndex} className="text-sm">
                                        <span className="font-medium">{member.name}</span>
                                        <span className="ml-2 text-muted-foreground">
                                          ({member.skill})
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="pl-5 text-sm text-destructive">Thiếu người chơi</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" onClick={generateTeams} disabled={isLoading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tạo lại đội
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Chọn thành viên</CardTitle>
                <CardDescription>Chọn thành viên tham gia chia đội thủ công</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label>Thành viên có sẵn</Label>
                      <div className="mt-2 max-h-60 overflow-y-auto rounded-md border p-2">
                        {availableMembers.map(member => (
                          <div
                            key={member.id}
                            className="flex cursor-pointer items-center justify-between rounded p-2 hover:bg-accent"
                            onClick={() => addParticipant(member.id)}
                          >
                            <div>
                              <p className="font-medium">{member.fullName}</p>
                              <p className="text-sm text-muted-foreground">
                                {getPositionDisplay(member.position)} - Kỹ năng:{' '}
                                {calculateMemberSkill(member)}
                              </p>
                            </div>
                            <Plus className="h-4 w-4" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Thành viên đã chọn ({participants.length})</Label>
                      <div className="mt-2 max-h-60 overflow-y-auto rounded-md border p-2">
                        {participants.map((participant, index) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between rounded p-2 hover:bg-accent"
                          >
                            <div>
                              <p className="font-medium">{participant.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {getPositionDisplay(participant.position)} - Kỹ năng:{' '}
                                {participant.skill}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeParticipant(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ManualTeamDivision participants={participants} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

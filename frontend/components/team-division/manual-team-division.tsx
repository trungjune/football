'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Users, Trash2 } from 'lucide-react';

type Position = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

interface Participant {
  id: string;
  name: string;
  skill: number;
  position: Position;
}

interface ManualTeam {
  name: string;
  participants: Participant[];
}

interface ManualTeamDivisionProps {
  participants: Participant[];
}

const positionNames: Record<Position, string> = {
  GOALKEEPER: 'Thủ môn',
  DEFENDER: 'Hậu vệ',
  MIDFIELDER: 'Tiền vệ',
  FORWARD: 'Tiền đạo',
};

export function ManualTeamDivision({ participants }: ManualTeamDivisionProps) {
  const [numberOfTeams, setNumberOfTeams] = useState(2);
  const [teams, setTeams] = useState<ManualTeam[]>([]);
  const [unassignedParticipants, setUnassignedParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  // Khởi tạo đội
  const initializeTeams = () => {
    const newTeams: ManualTeam[] = Array.from({ length: numberOfTeams }, (_, i) => ({
      name: `Đội ${i + 1}`,
      participants: [],
    }));
    setTeams(newTeams);
    setUnassignedParticipants([...participants]);
    setSelectedParticipant(null);
  };

  // Thêm người chơi vào đội
  const addToTeam = (teamIndex: number) => {
    if (!selectedParticipant) return;

    const participant = unassignedParticipants.find(p => p.id === selectedParticipant);
    if (!participant) return;

    const newTeams = [...teams];
    newTeams[teamIndex].participants.push(participant);
    setTeams(newTeams);

    setUnassignedParticipants(prev => prev.filter(p => p.id !== selectedParticipant));
    setSelectedParticipant(null);
  };

  // Xóa người chơi khỏi đội
  const removeFromTeam = (teamIndex: number, participantId: string) => {
    const participant = teams[teamIndex].participants.find(p => p.id === participantId);
    if (!participant) return;

    const newTeams = [...teams];
    newTeams[teamIndex].participants = newTeams[teamIndex].participants.filter(
      p => p.id !== participantId
    );
    setTeams(newTeams);

    setUnassignedParticipants(prev => [...prev, participant]);
  };

  // Di chuyển người chơi giữa các đội
  const moveToTeam = (fromTeamIndex: number, toTeamIndex: number, participantId: string) => {
    const participant = teams[fromTeamIndex].participants.find(p => p.id === participantId);
    if (!participant) return;

    const newTeams = [...teams];
    newTeams[fromTeamIndex].participants = newTeams[fromTeamIndex].participants.filter(
      p => p.id !== participantId
    );
    newTeams[toTeamIndex].participants.push(participant);
    setTeams(newTeams);
  };

  // Tính tổng điểm của đội
  const getTeamScore = (team: ManualTeam) => {
    return team.participants.reduce((sum, p) => sum + p.skill, 0);
  };

  // Lấy thống kê vị trí của đội
  const getPositionStats = (team: ManualTeam) => {
    return Object.keys(positionNames).map(pos => {
      const positionPlayers = team.participants.filter(p => p.position === pos);
      return {
        position: pos as Position,
        count: positionPlayers.length,
        totalScore: positionPlayers.reduce((sum, p) => sum + p.skill, 0),
      };
    });
  };

  const getPositionDisplay = (position: Position) => `${positionNames[position]}`;

  const getGridClassName = () => {
    switch (numberOfTeams) {
      case 2:
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      case 3:
        return 'grid grid-cols-1 md:grid-cols-3 gap-4';
      case 4:
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt chia đội thủ công</CardTitle>
          <CardDescription>Chọn số lượng đội và phân chia thủ công</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="teams">Số lượng đội</Label>
              <Select
                value={numberOfTeams.toString()}
                onValueChange={value => setNumberOfTeams(Number(value))}
                disabled={teams.length > 0}
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
            <Button onClick={initializeTeams} disabled={participants.length === 0}>
              <Users className="mr-2 h-4 w-4" />
              {teams.length > 0 ? 'Khởi tạo lại' : 'Bắt đầu chia đội'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {teams.length > 0 && (
        <>
          {/* Danh sách người chơi chưa phân đội */}
          <Card>
            <CardHeader>
              <CardTitle>Người chơi chưa phân đội ({unassignedParticipants.length})</CardTitle>
              <CardDescription>Chọn người chơi và thêm vào đội</CardDescription>
            </CardHeader>
            <CardContent>
              {unassignedParticipants.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {unassignedParticipants.map(participant => (
                    <div
                      key={participant.id}
                      className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                        selectedParticipant === participant.id
                          ? 'border-primary bg-primary/10'
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => setSelectedParticipant(participant.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {getPositionDisplay(participant.position)} - Kỹ năng: {participant.skill}
                          </p>
                        </div>
                        {selectedParticipant === participant.id && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Tất cả người chơi đã được phân đội
                </p>
              )}
            </CardContent>
          </Card>

          {/* Các đội */}
          <div className={getGridClassName()}>
            {teams.map((team, teamIndex) => (
              <Card key={teamIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{team.name}</span>
                    <Button
                      size="sm"
                      onClick={() => addToTeam(teamIndex)}
                      disabled={!selectedParticipant}
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Thêm
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {team.participants.length} người - Tổng điểm: {getTeamScore(team)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(positionNames).map(([position]) => {
                      const positionPlayers = team.participants.filter(
                        p => p.position === position
                      );
                      return (
                        <div key={position}>
                          <h4 className="mb-1 text-sm font-semibold">
                            {getPositionDisplay(position as Position)}:
                          </h4>
                          {positionPlayers.length > 0 ? (
                            <div className="space-y-1">
                              {positionPlayers.map(member => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between rounded bg-accent/50 p-2 text-sm"
                                >
                                  <span>
                                    {member.name} ({member.skill})
                                  </span>
                                  <div className="flex gap-1">
                                    {teams.length > 1 && (
                                      <Select
                                        onValueChange={value =>
                                          moveToTeam(teamIndex, Number(value), member.id)
                                        }
                                      >
                                        <SelectTrigger className="h-7 w-7 p-0">
                                          <ArrowRight className="h-3 w-3" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {teams.map((_, idx) =>
                                            idx !== teamIndex ? (
                                              <SelectItem key={idx} value={idx.toString()}>
                                                Đội {idx + 1}
                                              </SelectItem>
                                            ) : null
                                          )}
                                        </SelectContent>
                                      </Select>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => removeFromTeam(teamIndex, member.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="pl-3 text-sm text-muted-foreground">Chưa có người chơi</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bảng thống kê */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê chia đội</CardTitle>
              <CardDescription>Tổng quan về sự phân bổ người chơi và điểm số</CardDescription>
            </CardHeader>
            <CardContent>
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
                        getPositionStats(team).find(s => s.position === pos)
                      );
                      const totalCount = teamStats.reduce((sum, stat) => sum + (stat?.count || 0), 0);
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
                          {team.participants.length} người ({getTeamScore(team)}đ)
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

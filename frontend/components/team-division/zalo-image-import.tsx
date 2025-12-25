'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Camera, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '@/lib/axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Position = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

interface MatchedMember {
  memberId: string;
  memberName: string;
  ocrName: string;
  confidence: number;
  matchScore: number;
  position: Position;
  skillLevel: number;
}

interface ProcessImageResponse {
  ocrNames: string[];
  matchedMembers: MatchedMember[];
  unmatchedNames: string[];
}

interface ZaloImageImportProps {
  onImportComplete: (members: MatchedMember[]) => void;
}

const positionNames: Record<Position, string> = {
  GOALKEEPER: 'Thủ môn',
  DEFENDER: 'Hậu vệ',
  MIDFIELDER: 'Tiền vệ',
  FORWARD: 'Tiền đạo',
};

export function ZaloImageImport({ onImportComplete }: ZaloImageImportProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessImageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State cho manual corrections
  const [corrections, setCorrections] = useState<Map<string, string>>(new Map());

  // Handle paste from clipboard
  const handlePaste = async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Kiểm tra nếu là ảnh
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        
        const blob = item.getAsFile();
        if (!blob) continue;

        // Kiểm tra file size
        if (blob.size > 10 * 1024 * 1024) {
          setError('Kích thước ảnh không được vượt quá 10MB');
          return;
        }

        // Convert blob to File
        const file = new File([blob], `pasted-image-${Date.now()}.png`, {
          type: blob.type,
        });

        setSelectedFile(file);
        setError(null);
        setResult(null);

        // Tạo preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        break;
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Kiểm tra file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    // Kiểm tra file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await api.post<ProcessImageResponse>('/ocr/process-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (err) {
      console.error('OCR processing error:', err);
      setError('Không thể xử lý ảnh. Vui lòng thử lại hoặc chọn ảnh khác.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMemberChange = (ocrName: string, newMemberId: string) => {
    setCorrections(prev => new Map(prev).set(ocrName, newMemberId));
  };

  const handleConfirm = async () => {
    if (!result) return;

    // Áp dụng corrections
    const finalMembers = result.matchedMembers.map(member => {
      const correctedMemberId = corrections.get(member.ocrName);
      if (correctedMemberId && correctedMemberId !== member.memberId) {
        // Tìm member mới từ corrections
        const correctedMember = result.matchedMembers.find(m => m.memberId === correctedMemberId);
        if (correctedMember) {
          return {
            ...member,
            memberId: correctedMemberId,
            memberName: correctedMember.memberName,
            position: correctedMember.position,
            skillLevel: correctedMember.skillLevel,
          };
        }
      }
      return member;
    });

    // Lưu mappings để cải thiện độ chính xác cho lần sau
    try {
      const mappings = finalMembers.map(member => ({
        ocrName: member.ocrName,
        memberId: member.memberId,
        confidence: member.confidence,
      }));

      await api.post('/ocr/save-mappings', { mappings });
    } catch (err) {
      console.error('Failed to save mappings:', err);
      // Không block user nếu save mappings fail
    }

    // Callback với kết quả
    onImportComplete(finalMembers);

    // Reset
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setCorrections(new Map());
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setCorrections(new Map());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Nhập từ ảnh Zalo
        </CardTitle>
        <CardDescription>
          Chụp hoặc upload ảnh điểm danh từ Zalo để tự động nhận dạng thành viên
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        {!result && (
          <div className="space-y-4" onPaste={handlePaste}>
            <div>
              <Label htmlFor="image-upload">Chọn ảnh điểm danh</Label>
              <div className="mt-2">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="image-upload">
                  <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-muted-foreground/50">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                      Click để chọn ảnh hoặc kéo thả vào đây
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG, WebP (tối đa 10MB)
                    </p>
                    <div className="mt-3 flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5">
                      <Camera className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        Hoặc Ctrl+V để paste ảnh từ clipboard
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="space-y-2">
                <Label>Xem trước</Label>
                <div className="relative overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-auto w-full max-w-md object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleProcess} disabled={isProcessing} className="flex-1">
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Nhận dạng
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    Hủy
                  </Button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-4">
            {/* Summary */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Đã nhận dạng <strong>{result.ocrNames.length}</strong> tên.{' '}
                <strong>{result.matchedMembers.length}</strong> khớp với thành viên,{' '}
                <strong>{result.unmatchedNames.length}</strong> không khớp.
              </AlertDescription>
            </Alert>

            {/* Matched Members */}
            {result.matchedMembers.length > 0 && (
              <div className="space-y-2">
                <Label>Thành viên đã khớp ({result.matchedMembers.length})</Label>
                <div className="space-y-2 rounded-lg border p-3">
                  {result.matchedMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-md bg-accent/50 p-2"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{member.memberName}</p>
                        <p className="text-xs text-muted-foreground">
                          OCR: "{member.ocrName}" • Độ khớp: {member.matchScore}% •{' '}
                          {positionNames[member.position]} • Kỹ năng: {member.skillLevel}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.matchScore < 90 && (
                          <Select
                            value={corrections.get(member.ocrName) || member.memberId}
                            onValueChange={value => handleMemberChange(member.ocrName, value)}
                          >
                            <SelectTrigger className="h-8 w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {result.matchedMembers.map(m => (
                                <SelectItem key={m.memberId} value={m.memberId}>
                                  {m.memberName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unmatched Names */}
            {result.unmatchedNames.length > 0 && (
              <div className="space-y-2">
                <Label>Tên không khớp ({result.unmatchedNames.length})</Label>
                <div className="space-y-1 rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                  {result.unmatchedNames.map((name, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span>{name}</span>
                    </div>
                  ))}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Những tên này sẽ không được thêm vào danh sách chia đội
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleConfirm} className="flex-1">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Xác nhận và thêm vào danh sách
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Thử lại
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

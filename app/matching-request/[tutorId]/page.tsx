'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { TUTORS } from '../../data/mockData';
import { useUser } from '../../components/UserContext';
import { useCreateMatchingMutation } from '../../hooks/queries/useMatchings';
import { useTutorDetailQuery } from '../../hooks/queries/useTutors';

export default function MatchingRequestPage() {
  const router = useRouter();
  const params = useParams();
  const tutorId = Number(params.tutorId);
  const { data: realTutor } = useTutorDetailQuery(tutorId);
  const fallbackTutor = TUTORS.find((t) => t.id === tutorId) ?? TUTORS[0];
  const tutor = realTutor ?? fallbackTutor;
  const { role } = useUser();
  const createMatchingMutation = useCreateMatchingMutation();

  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullMessage = [
      message ? `튜터에게 한마디: ${message}` : '',
      phoneNumber ? `연락처: ${phoneNumber}` : '',
    ]
      .filter(Boolean)
      .join(' / ');

    createMatchingMutation.mutate(
      {
        tutorId,
        message: fullMessage,
        schedule: '상담 후 조율',
      },
      { onSuccess: () => router.push('/my-matchings') },
    );
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 py-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
      >
        <ArrowLeft size={14} /> 튜터 상세로
      </button>

      <div>
        <h2 className="text-xl font-bold text-foreground">레슨 매칭 요청</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {tutor.name} 튜터에게 1:1 레슨을 요청합니다
        </p>
      </div>

      {/* Tutor summary */}
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <img
          src={tutor.avatar}
          alt={tutor.name}
          className="w-11 h-11 rounded-full object-cover bg-muted shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{tutor.name} 튜터</p>
          <p className="text-xs text-muted-foreground">
            {tutor.subject} · {tutor.price.toLocaleString()}원/시간
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      >
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            튜터에게 한마디 <span className="text-accent">*</span>
          </label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 300))}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors resize-none"
            rows={4}
            placeholder="원하는 수업 목표, 방식이나 특별한 요청사항을 자유롭게 알려주세요..."
          />
          <p className="text-right text-xs text-muted-foreground mt-1">{message.length}/300</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            학생 전화번호 <span className="text-accent">*</span>
          </label>
          <input
            required
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
            placeholder="예: 010-1234-5678"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            튜터와의 원활한 소통 및 레슨 일정 조율을 위해 사용됩니다.
          </p>
        </div>

        <button
          type="submit"
          disabled={createMatchingMutation.isPending || role !== 'STUDENT'}
          className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Send size={15} /> 매칭 요청 보내기
        </button>
      </form>
    </div>
  );
}

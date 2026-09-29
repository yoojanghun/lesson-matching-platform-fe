'use client';

import { useState } from 'react';
import { X, CreditCard, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getTossPayments } from '../lib/tossPayments';
import { usePreparePaymentMutation } from '../hooks/queries/usePayments';

interface Props {
  matchingId: number;
  tutorName: string;
  subject: string;
  defaultLessonCount?: number;
  onClose: () => void;
}

export default function TossPaymentModal({
  matchingId,
  tutorName,
  subject,
  defaultLessonCount = 1,
  onClose,
}: Props) {
  const [lessonCount, setLessonCount] = useState<number>(defaultLessonCount);
  const [method, setMethod] = useState<'카드' | '가상계좌' | '계좌이체'>('카드');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const prepareMutation = usePreparePaymentMutation();

  const handlePay = async () => {
    if (lessonCount <= 0) {
      setErrorMsg('레슨 횟수는 1회 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 1. 백엔드 /api/payments/prepare 호출하여 주문 생성 및 금액 산출
      const prepareRes = await prepareMutation.mutateAsync({
        matchingId,
        lessonCount,
      });

      // 2. Toss Payments SDK 인스턴스 초기화
      const tossPayments = await getTossPayments();

      const origin = window.location.origin;
      const successUrl = `${origin}/payments/success`;
      const failUrl = `${origin}/payments/fail`;

      // 3. 토스페이먼츠 표준 결제창 호출
      await tossPayments.requestPayment(method, {
        amount: prepareRes.amount,
        orderId: prepareRes.orderId,
        orderName: prepareRes.orderName || `${tutorName} 튜터 ${lessonCount}회 레슨`,
        customerName: '수강생',
        successUrl,
        failUrl,
      });
    } catch (err: any) {
      console.error('Toss payment error:', err);
      // 사용자가 창을 닫았을 때
      if (err.code === 'USER_CANCEL') {
        setErrorMsg('결제를 취소하셨습니다.');
      } else {
        const message =
          err.response?.data?.message ||
          err.message ||
          '결제 준비 중 오류가 발생했습니다. 다시 시도해 주세요.';
        setErrorMsg(message);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Card */}
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 border border-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <CreditCard size={18} />
            </span>
            <p className="text-base font-bold text-foreground">토스페이먼츠 레슨 결제</p>
          </div>
          <button
            disabled={isLoading}
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lesson Info */}
        <div className="bg-muted/50 rounded-xl p-4 mb-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">담당 튜터</span>
            <span className="font-bold text-foreground">{tutorName}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">과목</span>
            <span className="font-medium text-foreground">{subject}</span>
          </div>
        </div>

        {/* Lesson Count Selection */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            결제할 레슨 회차 수
          </label>
          <div className="flex items-center gap-2">
            {[1, 4, 8, 12].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setLessonCount(cnt)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  lessonCount === cnt
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {cnt}회
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            결제 수단
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['카드', '가상계좌', '계좌이체'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  method === m
                    ? 'border-primary bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs mb-4">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <p className="leading-tight">{errorMsg}</p>
          </div>
        )}

        {/* Security badge */}
        <div className="flex items-center gap-1.5 mb-5 text-[11px] text-muted-foreground">
          <Lock size={12} />
          토스페이먼츠의 고도화된 보안 암호화로 결제가 안전하게 처리됩니다.
        </div>

        {/* Submit Button */}
        <button
          disabled={isLoading}
          onClick={handlePay}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              결제창 로딩 중...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              {lessonCount}회차 레슨 결제 진행하기
            </>
          )}
        </button>
      </div>
    </div>
  );
}

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useConfirmPaymentMutation } from '../../hooks/queries/usePayments';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amountStr = searchParams.get('amount');

  const confirmMutation = useConfirmPaymentMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentKey || !orderId || !amountStr) {
      setErrorMessage('결제 승인 파라미터가 유효하지 않습니다.');
      return;
    }

    const amount = parseInt(amountStr, 10);
    confirmMutation.mutate(
      { paymentKey, orderId, amount },
      {
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            '결제 승인 중 오류가 발생했습니다.';
          setErrorMessage(msg);
        },
      }
    );
  }, [paymentKey, orderId, amountStr]);

  if (errorMessage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">결제 승인 실패</h2>
        <p className="text-sm text-muted-foreground mb-6">{errorMessage}</p>
        <button
          onClick={() => router.push('/my-matchings')}
          className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
        >
          내 매칭 목록으로 이동
        </button>
      </div>
    );
  }

  if (confirmMutation.isPending) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 size={36} className="text-primary animate-spin mb-4" />
        <h2 className="text-lg font-bold text-foreground">결제를 안전하게 승인하고 있습니다</h2>
        <p className="text-sm text-muted-foreground mt-1">잠시만 기다려 주세요...</p>
      </div>
    );
  }

  const result = confirmMutation.data;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
        <CheckCircle2 size={32} className="text-emerald-500" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-1">결제가 성공적으로 완료되었습니다!</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {result?.amount?.toLocaleString()}원이 안전하게 결제되었습니다.
      </p>

      {result && (
        <div className="w-full bg-card border border-border rounded-2xl p-4 text-left space-y-2 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">주문 번호</span>
            <span className="font-mono text-xs">{result.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">결제 금액</span>
            <span className="font-bold text-primary">{result.amount?.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">결제 수단</span>
            <span>{result.paymentMethod || '카드'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">승인 일시</span>
            <span className="text-xs text-muted-foreground">{result.approvedAt || '방금'}</span>
          </div>
        </div>
      )}

      <button
        onClick={() => router.push('/my-matchings')}
        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
      >
        내 매칭 및 결제 내역 확인
      </button>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
          <Loader2 size={36} className="text-primary animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

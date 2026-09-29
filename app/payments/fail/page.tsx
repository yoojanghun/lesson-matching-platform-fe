'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get('code');
  const message = searchParams.get('message') || '결제가 취소되었거나 승인되지 않았습니다.';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-1">결제에 실패하였습니다</h2>
      <p className="text-sm text-muted-foreground mb-6">{message}</p>

      {code && (
        <p className="text-xs text-muted-foreground/80 mb-6 font-mono">
          에러 코드: {code}
        </p>
      )}

      <button
        onClick={() => router.push('/my-matchings')}
        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
      >
        내 매칭 페이지로 돌아가기
      </button>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      }
    >
      <PaymentFailContent />
    </Suspense>
  );
}

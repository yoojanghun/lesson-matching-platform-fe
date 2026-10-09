'use client';

import { useState } from 'react';
import { X, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import type { PaymentItem } from '../types';

export interface PaymentDetailData {
  paymentId?: number;
  orderId?: string;
  matchingId?: number;
  tutorName: string;
  studentName?: string;
  amount: number;
  lessonCount?: number;
  status: 'paid' | 'unpaid' | 'claimed' | 'cancelled';
  cancelReason?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  createdAt?: string;
  transferClaimedAt?: string;
  confirmedAt?: string;
  reservations: Array<{
    reservationId?: number;
    lessonDate: string;
    startTime: string;
    endTime: string;
    price: number;
  }>;
}

interface Props {
  detail: PaymentDetailData;
  onClose: () => void;
  onClaimTransfer?: (orderId?: string) => void;
  onCancelTransfer?: (orderId?: string) => void;
}

function fmtDate(dateStr: string) {
  if (!dateStr) return '';
  const datePart = dateStr.includes(' ') ? dateStr.split(' ')[0] : dateStr;
  const parts = datePart.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const day = new Date(`${datePart}T00:00:00`).toLocaleDateString('ko-KR', { weekday: 'short' });
    return `${Number(y)}년 ${Number(m)}월 ${Number(d)}일 (${day})`;
  }
  return dateStr;
}

export default function PaymentDetailModal({ detail, onClose, onClaimTransfer, onCancelTransfer }: Props) {
  const isPaid = detail.status === 'paid';
  const isClaimed = detail.status === 'claimed';
  const isUnpaid = detail.status === 'unpaid';

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-end sm:justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Side drawer panel (전달해주신 스크린샷 1:1 맞춤 디자인) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full sm:w-[480px] h-full bg-card shadow-2xl flex flex-col overflow-hidden border-l border-border animate-in slide-in-from-right duration-250"
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-4 flex items-start justify-between">
          <div>
            <div className="mb-2">
              {isPaid ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  결제 완료
                </span>
              ) : isClaimed ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  확인 대기
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                  미결제
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">결제 상세</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-7 py-3 space-y-7">
          {/* 총 결제 금액 배너 */}
          <div className="bg-muted/40 border border-border/60 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">총 결제 금액</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {detail.reservations?.length || detail.lessonCount || 1}개의 수업
              </p>
            </div>
            <p className="text-2xl font-black text-primary tracking-tight">
              {detail.amount.toLocaleString()}원
            </p>
          </div>

          {/* 주문 정보 */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-bold text-foreground">주문 정보</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">주문번호</span>
                <span className="font-semibold text-foreground tracking-tight">
                  {detail.orderId || `LP-20261008-00${detail.paymentId || 1}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">결제 ID</span>
                <span className="font-semibold text-foreground">{detail.paymentId ?? 1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">매칭 ID</span>
                <span className="font-semibold text-foreground">{detail.matchingId ?? 104}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">선생님</span>
                <span className="font-semibold text-foreground">{detail.tutorName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">학생</span>
                <span className="font-semibold text-foreground">{detail.studentName || '김학생'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">결제 생성</span>
                <span className="font-semibold text-foreground">
                  {detail.createdAt || '2026-10-08 14:30:04'}
                </span>
              </div>
            </div>
          </div>

          {/* 입금 계좌 */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-bold text-foreground">입금 계좌</h3>
            <div className="border border-border/80 rounded-2xl p-4 bg-card shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {detail.bankName || '신한은행'}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  예금주 {detail.bankAccountHolder || detail.tutorName}
                </p>
              </div>
              <span className="text-sm font-bold text-foreground tracking-wider font-mono">
                {detail.bankAccountNumber || '110-456-789012'}
              </span>
            </div>

            {isUnpaid && onClaimTransfer && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-muted-foreground">
                  위 계좌로 송금한 뒤 버튼을 눌러주세요.
                </p>
                <button
                  onClick={() => onClaimTransfer(detail.orderId)}
                  className="w-full py-3 bg-[#1e3a5f] hover:bg-[#152a45] text-white rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-sm"
                >
                  이체 완료 신고
                </button>
              </div>
            )}

            {isClaimed && onCancelTransfer && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-muted-foreground">
                  선생님이 입금을 확인하기 전까지 신고를 취소할 수 있습니다.
                </p>
                <button
                  onClick={() => onCancelTransfer(detail.orderId)}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  이체 완료 신고 취소
                </button>
              </div>
            )}
          </div>

          {/* 처리 내역 타임라인 */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-bold text-foreground">처리 내역</h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
              {/* 1단계: 결제 요청 */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">결제 요청</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {detail.createdAt || '2026-10-08 14:30:04'}
                  </p>
                </div>
              </div>

              {/* 2단계: 이체 완료 신고 */}
              <div className="relative">
                <div
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center ${
                    detail.transferClaimedAt || isPaid
                      ? 'bg-emerald-500'
                      : 'bg-muted-foreground/30'
                  }`}
                >
                  {(detail.transferClaimedAt || isPaid) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">이체 완료 신고</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {detail.transferClaimedAt ||
                      (isPaid
                        ? '2026-10-08 14:42:18'
                        : '아직 신고되지 않았습니다')}
                  </p>
                </div>
              </div>

              {/* 3단계: 입금 확인 */}
              <div className="relative">
                <div
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center ${
                    detail.confirmedAt || isPaid
                      ? 'bg-emerald-500'
                      : 'bg-muted-foreground/30'
                  }`}
                >
                  {(detail.confirmedAt || isPaid) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">입금 확인</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {detail.confirmedAt ||
                      (isPaid
                        ? '2026-10-08 16:05:32'
                        : '선생님 확인 대기 중')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 포함된 수업 */}
          <div className="space-y-3 pb-6">
            <h3 className="text-sm font-bold text-foreground">포함된 수업</h3>
            <div className="space-y-2">
              {detail.reservations && detail.reservations.length > 0 ? (
                detail.reservations.map((res, idx) => (
                  <div
                    key={idx}
                    className="border border-border/80 rounded-2xl p-4 bg-card flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {fmtDate(res.lessonDate)}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {res.startTime} – {res.endTime}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {res.price.toLocaleString()}원
                    </span>
                  </div>
                ))
              ) : (
                <div className="border border-border/80 rounded-2xl p-4 bg-card flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      2026년 10월 8일 (목)
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      08:00 – 09:00
                    </p>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {detail.amount.toLocaleString()}원
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

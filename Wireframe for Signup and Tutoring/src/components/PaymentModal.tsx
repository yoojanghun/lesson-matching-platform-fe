import { useState } from "react";
import { X, CreditCard, Lock, CheckCircle2, ChevronDown } from "lucide-react";
import type { PaymentItem } from "../types";

interface Props {
  item: PaymentItem;
  onClose: () => void;
  onPaid: (id: number) => void;
}

const CARD_BRANDS = ["카카오페이", "토스페이", "삼성카드", "신한카드", "현대카드", "국민카드"];

function formatDate(dateStr: string, day: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일 (${day})`;
}

function fmtCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function fmtExpiry(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
}

export default function PaymentModal({ item, onClose, onPaid }: Props) {
  const [step, setStep] = useState<"form" | "confirm" | "done">("form");
  const [method, setMethod] = useState<"card" | "simple">("card");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [selectedSimple, setSelectedSimple] = useState(CARD_BRANDS[0]);
  const [loading, setLoading] = useState(false);

  const canProceed =
    method === "simple" ||
    (cardNum.replace(/\s/g, "").length === 16 && expiry.length === 5 && cvc.length >= 3 && cardHolder.trim().length > 0);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("done");
      onPaid(item.id);
    }, 1400);
  };

  // 완료 화면
  if (step === "done") {
    return (
      <Overlay onClose={onClose}>
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">결제 완료!</p>
            <p className="text-sm text-muted-foreground mt-1">
              {item.price.toLocaleString()}원이 정상적으로 결제되었습니다.
            </p>
          </div>
          <div className="w-full bg-muted/50 rounded-xl px-4 py-3 text-left space-y-1">
            <Row label="튜터" value={`${item.tutor} (${item.subject})`} />
            <Row label="레슨일" value={formatDate(item.lessonDate, item.lessonDay)} />
            <Row label="시간" value={`${item.startTime} – ${item.endTime}`} />
            <Row label="결제금액" value={`${item.price.toLocaleString()}원`} bold />
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            확인
          </button>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-base font-bold text-foreground">결제하기</p>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground">
          <X size={18} />
        </button>
      </div>

      {/* 수업 요약 */}
      <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3 mb-5">
        <img src={item.avatar} alt={item.tutor} className="w-10 h-10 rounded-full object-cover shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">{item.tutor} <span className="font-normal text-muted-foreground text-xs">· {item.subject}</span></p>
          <p className="text-xs text-muted-foreground">{formatDate(item.lessonDate, item.lessonDay)} · {item.startTime}–{item.endTime}</p>
        </div>
        <p className="text-base font-bold text-primary shrink-0">{item.price.toLocaleString()}원</p>
      </div>

      {/* 결제 방법 탭 */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl mb-4">
        {(["card", "simple"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              method === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {m === "card" ? "카드 직접 입력" : "간편 결제"}
          </button>
        ))}
      </div>

      {/* 카드 직접 입력 */}
      {method === "card" && (
        <div className="space-y-3">
          <Field label="카드 번호">
            <input
              placeholder="0000 0000 0000 0000"
              value={cardNum}
              maxLength={19}
              onChange={(e) => setCardNum(fmtCard(e.target.value))}
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="유효기간">
              <input
                placeholder="MM/YY"
                value={expiry}
                maxLength={5}
                onChange={(e) => setExpiry(fmtExpiry(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="CVC">
              <input
                placeholder="000"
                value={cvc}
                maxLength={4}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className={inputCls}
                type="password"
              />
            </Field>
          </div>
          <Field label="카드 소유자명">
            <input
              placeholder="홍길동"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      )}

      {/* 간편 결제 */}
      {method === "simple" && (
        <div className="relative">
          <label className="block text-xs font-semibold text-foreground mb-1.5">결제 수단 선택</label>
          <div className="relative">
            <select
              value={selectedSimple}
              onChange={(e) => setSelectedSimple(e.target.value)}
              className={`${inputCls} appearance-none pr-8 cursor-pointer`}
            >
              {CARD_BRANDS.map((b) => <option key={b}>{b}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground text-center">
            선택한 간편 결제 수단으로 즉시 결제됩니다.
          </p>
        </div>
      )}

      {/* 안전 결제 안내 */}
      <div className="flex items-center gap-1.5 mt-4 text-[11px] text-muted-foreground">
        <Lock size={11} /> 결제 정보는 암호화되어 안전하게 처리됩니다.
      </div>

      {/* 결제 버튼 */}
      <button
        disabled={!canProceed || loading}
        onClick={handleConfirm}
        className={`w-full mt-5 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
          canProceed && !loading
            ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
            </svg>
            결제 처리 중...
          </span>
        ) : (
          <>
            <CreditCard size={15} /> {item.price.toLocaleString()}원 결제하기
          </>
        )}
      </button>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold text-primary" : "font-medium text-foreground"}>{value}</span>
    </div>
  );
}

const inputCls =
  "w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors";

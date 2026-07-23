import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    pending:  { label: "대기 중", cls: "bg-amber-100 text-amber-700",   icon: <Clock size={11} /> },
    accepted: { label: "승인됨",  cls: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={11} /> },
    rejected: { label: "거절됨",  cls: "bg-red-100 text-red-600",        icon: <XCircle size={11} /> },
  };
  const { label, cls, icon } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {icon} {label}
    </span>
  );
}

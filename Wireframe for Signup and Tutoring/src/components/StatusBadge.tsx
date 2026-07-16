import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    pending: { label: "대기 중", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock size={12} /> },
    accepted: { label: "승인됨", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={12} /> },
    rejected: { label: "거절됨", cls: "bg-red-50 text-red-600 border-red-200", icon: <XCircle size={12} /> },
  };
  const { label, cls, icon } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cls}`}>
      {icon} {label}
    </span>
  );
}

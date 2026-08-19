'use client';

import { CheckCircle2 } from "lucide-react";
import { useUser } from "./UserContext";

export default function GlobalToast() {
  const { toast } = useUser();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-card px-5 py-3 rounded-xl text-sm font-medium shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
      <span>{toast}</span>
    </div>
  );
}

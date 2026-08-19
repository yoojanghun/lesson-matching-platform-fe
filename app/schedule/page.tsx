"use client";

import SchedulePlanner from "../components/SchedulePlanner";

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">스케줄 관리</h2>
        <p className="text-sm text-muted-foreground">
          정기적으로 레슨이 가능한 시간대를 요일별로 설정하세요
        </p>
      </div>

      <SchedulePlanner />
    </div>
  );
}

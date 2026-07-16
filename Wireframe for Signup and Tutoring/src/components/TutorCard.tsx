import type { Tutor } from "../types";
import StarRow from "./StarRow";

interface Props {
  tutor: Tutor;
  onClick: () => void;
}

export default function TutorCard({ tutor, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <img
            src={tutor.avatar}
            alt={tutor.name}
            className="w-14 h-14 rounded-full object-cover bg-muted"
          />
          {tutor.available && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground text-sm">{tutor.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{tutor.subject}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-primary">{tutor.price.toLocaleString()}원</p>
              <p className="text-xs text-muted-foreground">/시간</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <StarRow rating={tutor.rating} size={12} />
            <span className="text-xs font-medium text-foreground">{tutor.rating}</span>
            <span className="text-xs text-muted-foreground">({tutor.reviews}개 리뷰)</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{tutor.intro}</p>
          <div className="flex flex-wrap gap-1 mt-3">
            {tutor.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

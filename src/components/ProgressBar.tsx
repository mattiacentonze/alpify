interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="space-y-1">
      {label ? (
        <div className="flex items-center justify-between text-xs font-semibold text-navy/70">
          <span>{label}</span>
          <span>
            {value} / {max}
          </span>
        </div>
      ) : null}
      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-fresh to-sky transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

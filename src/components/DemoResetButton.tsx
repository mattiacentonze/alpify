import { RotateCcw } from "lucide-react";

interface DemoResetButtonProps {
  onReset: () => void;
}

export function DemoResetButton({ onReset }: DemoResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-navy shadow-sm transition hover:border-alpine hover:text-alpine"
    >
      <RotateCcw size={16} />
      Reset demo
    </button>
  );
}

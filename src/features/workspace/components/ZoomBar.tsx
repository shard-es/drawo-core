import { Minus, Plus } from "lucide-react";

interface ZoomBarProps {
  zoomPercent: number;
  canZoomOut: boolean;
  canZoomIn: boolean;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onZoomReset: () => void;
}

export function ZoomBar({
  zoomPercent,
  canZoomOut,
  canZoomIn,
  onZoomOut,
  onZoomIn,
  onZoomReset,
}: ZoomBarProps) {
  const displayedZoomPercent = Math.max(0, Math.min(200, zoomPercent));

  return (
    <div className="zoom-bar flex overflow-hidden gap-0 rounded-xl border border-(--panel-border) bg-white text-[rgb(var(--text-rgb))] shadow-(--panel-shadow) [corner-shape:squircle] transition-[0.2s_ease-in-out] dark:bg-(--popover-dark,#1f1f1f) dark:backdrop-blur-3xl [&_button]:flex [&_button]:size-9 [&_button]:items-center [&_button]:justify-center [&_button]:border-none [&_button]:bg-transparent [&_button]:p-2 [&_button]:transition-[0.1s] [&_button:hover:not([disabled])]:bg-[rgba(var(--text-rgb),0.06)] [&_button:active:not([disabled])_svg]:scale-90 [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-50 [&_svg]:size-[18px] [&_svg]:transition-[0.1s]">
      <button
        type="button"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        aria-label="Zoom out"
      >
        <Minus strokeWidth={1} />
      </button>
      <div className="my-auto flex h-[70%] w-px border-l border-[rgba(var(--text-rgb),0.1)]" />
      <button type="button" onClick={onZoomReset} aria-label="Reset zoom">
        <span>{displayedZoomPercent}%</span>
      </button>
      <div className="my-auto flex h-[70%] w-px border-l border-[rgba(var(--text-rgb),0.1)]" />
      <button
        type="button"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        aria-label="Zoom in"
      >
        <Plus strokeWidth={1} />
      </button>
    </div>
  );
}

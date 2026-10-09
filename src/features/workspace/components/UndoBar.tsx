import { ArrowUturnCcwLeft, ArrowUturnCwRight } from "@gravity-ui/icons";

interface UndoBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function UndoBar({ canUndo, canRedo, onUndo, onRedo }: UndoBarProps) {
  return (
    <div className="undo-bar flex overflow-hidden gap-0 rounded-xl border border-(--panel-border) bg-white text-[rgb(var(--text-rgb))] shadow-(--panel-shadow) [corner-shape:squircle] transition-[0.4s_ease-in-out] dark:bg-(--popover-dark,#1f1f1f) dark:backdrop-blur-3xl [&_button]:flex [&_button]:size-9 [&_button]:items-center [&_button]:justify-center [&_button]:border-none [&_button]:bg-transparent [&_button]:p-2 [&_button]:transition-[0.1s] [&_button:hover:not([disabled])]:bg-[rgba(var(--text-rgb),0.06)] [&_button:active:not([disabled])_svg]:scale-90 [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-50 [&_button:disabled]:backdrop-blur-[brightness(0.8)] [&_svg]:size-[18px] [&_svg]:transition-[0.1s]">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo"
      >
        <ArrowUturnCcwLeft />
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Redo"
      >
        <ArrowUturnCwRight />
      </button>
    </div>
  );
}

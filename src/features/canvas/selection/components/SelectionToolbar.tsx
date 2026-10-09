import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

interface SelectionToolbarProps {
  left: number;
  top: number;
  toolbarKey: string;
  viewportWidth: number;
  children: ReactNode;
}

export const SelectionToolbar = ({
  left,
  top,
  toolbarKey,
  viewportWidth,
  children,
}: SelectionToolbarProps) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarWidth, setToolbarWidth] = useState(0);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? toolbar.offsetWidth;
      setToolbarWidth(nextWidth);
    });

    resizeObserver.observe(toolbar);
    setToolbarWidth(toolbar.offsetWidth);

    return () => {
      resizeObserver.disconnect();
    };
  }, [toolbarKey]);

  const clampedLeft = useMemo(() => {
    const halfWidth = toolbarWidth / 2;
    const padding = 8;
    const minLeft = halfWidth + padding;
    const maxLeft = Math.max(minLeft, viewportWidth - halfWidth - padding);

    return Math.min(Math.max(left, minLeft), maxLeft);
  }, [left, toolbarWidth, viewportWidth]);

  return (
    <div
      ref={toolbarRef}
      key={toolbarKey}
      data-selection-toolbar=""
      className="pointer-events-auto absolute z-20 flex h-[43px] -translate-x-1/2 -translate-y-2 animate-[selection-toolbar-in_180ms_ease-out] overflow-hidden rounded-xl border border-(--panel-border) bg-(--popover-dark) text-[13px] font-semibold tracking-[0.02em] text-white shadow-[var(--panel-shadow)] backdrop-blur-[24px] [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[24px] dark:bg-(--popover-dark) dark:shadow-[var(--panel-shadow)] dark:backdrop-blur-[24px] [.drawo-presentation-mode_&]:hidden"
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
      style={{ left: clampedLeft, top }}
    >
      {children}
    </div>
  );
};

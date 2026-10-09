"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

const TOOLTIP_CONTENT_CLASS =
  "z-50 w-fit max-w-80 rounded-lg bg-[rgb(var(--text-rgb))] px-3 py-[7px] text-xs text-[rgb(var(--background-rgb))] font-[Inter,sans-serif] shadow-[var(--panel-shadow)] [transform-origin:var(--radix-tooltip-content-transform-origin)] [will-change:transform,opacity] opacity-0 [transform:scale(0.96)] [&_p]:m-0 [&[data-state=delayed-open]]:opacity-100 [&[data-state=instant-open]]:opacity-100 [&[data-state=delayed-open]]:[transform:scale(1)] [&[data-state=instant-open]]:[transform:scale(1)] [&[data-state=delayed-open][data-side=top]]:animate-[drawo-tooltip-in-top_180ms_cubic-bezier(0.16,1,0.3,1)] [&[data-state=instant-open][data-side=top]]:animate-[drawo-tooltip-in-top_180ms_cubic-bezier(0.16,1,0.3,1)] [&[data-state=delayed-open][data-side=bottom]]:animate-[drawo-tooltip-in-bottom_180ms_cubic-bezier(0.16,1,0.3,1)] [&[data-state=instant-open][data-side=bottom]]:animate-[drawo-tooltip-in-bottom_180ms_cubic-bezier(0.16,1,0.3,1)] [&[data-state=delayed-open][data-side=left]]:animate-[drawo-tooltip-in-left_180ms_cubic-bezier(0.16,1,0.3,1)] [&[data-state=instant-open][data-side=left]]:animate-[drawo-tooltip-in-left_180ms_cubic-bezier(0.16,1,0.3,1)] [&[data-state=delayed-open][data-side=right]]:animate-[drawo-tooltip-in-right_180ms_cubic-bezier(0.16,1,0.3,1)] [&[data-state=instant-open][data-side=right]]:animate-[drawo-tooltip-in-right_180ms_cubic-bezier(0.16,1,0.3,1)]";

const TOOLTIP_ARROW_CLASS =
  "hidden! size-2.5 rounded-[2.7px] bg-[rgb(var(--text-rgb))] fill-[rgb(var(--text-rgb))] [transform-origin:center_center] [transform:rotate(45deg)_translateY(-5px)_translateX(-5px)]";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger(
  props: React.ComponentProps<typeof TooltipPrimitive.Trigger>,
) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={TOOLTIP_CONTENT_CLASS + (className ? " " + className : "")}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className={TOOLTIP_ARROW_CLASS} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };

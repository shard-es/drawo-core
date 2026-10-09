"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

const SWITCH_ROOT_CLASS =
  "group relative inline-flex h-5 w-[40.8px] cursor-pointer items-center rounded-full border border-transparent outline-none transition-all duration-[120ms] ease data-[state=checked]:bg-[rgb(var(--accent-rgb,99,102,241))] data-[state=unchecked]:bg-[rgb(var(--input-rgb,229,231,235))] dark:data-[state=unchecked]:bg-[rgba(255,255,255,0.12)] [&[aria-invalid=true]]:border-[#ef4444] [&[aria-invalid=true]]:shadow-[0_0_0_3px_rgba(239,68,68,0.2)] dark:[&[aria-invalid=true]]:shadow-[0_0_0_3px_rgba(239,68,68,0.3)] [&[data-disabled]]:cursor-not-allowed [&[data-disabled]]:opacity-50 after:absolute after:inset-[-8px_-12px] after:content-['']";

/* `opacity-100!` reproduces the old `.dark .drawo-switch .drawo-switch-thumb`
   rule and keeps the thumb opaque: the settings rows in the app still style
   their labels with `[&_span:not(.drawo-switch_*):not(.drawo-switch)]:opacity-80`,
   a hook that used to exclude the thumb through the root's old class. */
const SWITCH_THUMB_CLASS =
  "block h-4 w-6 rounded-full bg-[var(--background,#fff)] opacity-100! transition-transform duration-[120ms] ease dark:bg-white group-data-[state=checked]:[transform:translateX(14px)] group-data-[state=unchecked]:[transform:translateX(0px)]";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={SWITCH_ROOT_CLASS + (className ? " " + className : "")}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={SWITCH_THUMB_CLASS}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

"use client";

import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { CheckIcon } from "lucide-react";
import { Check, ChevronRight } from "@gravity-ui/icons";

const DROPDOWN_CONTENT_CLASS =
  "z-50 w-[250px]! min-w-32 mt-1 rounded-xl border border-(--panel-border) bg-[var(--popover,#fff)] p-1 text-[var(--popover-foreground,#111)] shadow-[var(--panel-shadow)] backdrop-blur-[24px] font-[Inter,sans-serif] [transform-origin:var(--radix-dropdown-menu-content-transform-origin)] [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[24px] dark:bg-[var(--popover-dark,#1f1f1f)] dark:text-[var(--popover-foreground-dark,#eee)]";

const DROPDOWN_SUBCONTENT_CLASS =
  "z-50 min-w-56 rounded-xl border border-(--panel-border) bg-[var(--popover,#fff)] p-1 text-[var(--popover-foreground,#111)] shadow-[var(--panel-shadow)] backdrop-blur-[24px] font-[Inter,sans-serif] [transform-origin:var(--radix-dropdown-menu-content-transform-origin)] [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[24px] dark:bg-[var(--popover-dark,#1f1f1f)] dark:text-[var(--popover-foreground-dark,#eee)]";

const DROPDOWN_ITEM_CLASS =
  "relative flex cursor-pointer select-none items-center gap-1.5 rounded-xl px-4 py-2.5 pr-9 text-sm whitespace-nowrap outline-none [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[24px] focus:bg-[rgba(var(--text-rgb),0.1)] data-[highlighted]:bg-[rgba(var(--text-rgb),0.1)] [&_svg]:size-4 [&_svg]:min-w-4 [&_svg]:min-h-4 [&_svg_*]:stroke-[1.5]";

const DROPDOWN_ITEM_VARIANT_CLASS =
  "data-[variant=accent]:text-[rgb(var(--accent-rgb))]! data-[variant=accent]:[filter:brightness(0.5)] data-[variant=accent]:hover:bg-[rgba(var(--accent-rgb),0.179)]! data-[variant=destructive]:text-[rgb(255,4,4)]! data-[variant=destructive]:hover:bg-[rgba(255,0,0,0.179)]! dark:data-[variant=destructive]:text-[rgb(255,126,126)]! dark:data-[variant=destructive]:hover:bg-[rgba(255,126,126,0.1)]!";

const DROPDOWN_ITEM_DISABLED_CLASS =
  "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50";

/* Radix renders `data-disabled` (empty value) and `aria-disabled="true"` on the
   sub trigger itself, so the state is matched by attribute presence there. */
const DROPDOWN_SUBTRIGGER_DISABLED_CLASS =
  "[&[data-disabled],&[aria-disabled=true]]:cursor-not-allowed [&[data-disabled],&[aria-disabled=true]]:opacity-50";

const DROPDOWN_INDICATOR_CLASS =
  "absolute right-3 top-1/2 [transform:translateY(-40%)] pointer-events-none";

const DROPDOWN_LABEL_CLASS = "px-1.5 py-1 text-xs font-medium text-[#666]";

const DROPDOWN_SEPARATOR_CLASS =
  "my-1 h-px bg-[rgba(var(--text-rgb),0.1)]";

const DROPDOWN_SHORTCUT_CLASS =
  "ml-auto text-xs text-[#777] tracking-[0.05em]";

const DROPDOWN_CHEVRON_CLASS = "absolute right-3 ml-auto opacity-50";

function DropdownMenu(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>,
) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>,
) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>,
) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={
          DROPDOWN_CONTENT_CLASS + (className ? " " + className : "")
        }
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>,
) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  disabled = false,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive" | "accent";
  disabled?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      data-disabled={disabled}
      className={
        DROPDOWN_ITEM_CLASS +
        " " +
        DROPDOWN_ITEM_VARIANT_CLASS +
        " " +
        DROPDOWN_ITEM_DISABLED_CLASS +
        (className ? " " + className : "")
      }
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={
        DROPDOWN_ITEM_CLASS + (className ? " " + className : "")
      }
      checked={checked}
      {...props}
    >
      <span className={DROPDOWN_INDICATOR_CLASS}>
        <DropdownMenuPrimitive.ItemIndicator>
          <Check />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>,
) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={
        DROPDOWN_ITEM_CLASS + (className ? " " + className : "")
      }
      {...props}
    >
      <span className={DROPDOWN_INDICATOR_CLASS}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={DROPDOWN_LABEL_CLASS + (className ? " " + className : "")}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={
        DROPDOWN_SEPARATOR_CLASS + (className ? " " + className : "")
      }
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={DROPDOWN_SHORTCUT_CLASS + (className ? " " + className : "")}
      {...props}
    />
  );
}

function DropdownMenuSub(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>,
) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={
        DROPDOWN_ITEM_CLASS +
        " " +
        DROPDOWN_SUBTRIGGER_DISABLED_CLASS +
        (className ? " " + className : "")
      }
      {...props}
    >
      {children}
      <ChevronRight className={DROPDOWN_CHEVRON_CLASS} />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={
        DROPDOWN_SUBCONTENT_CLASS + (className ? " " + className : "")
      }
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

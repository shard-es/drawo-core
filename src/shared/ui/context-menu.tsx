"use client";

import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "radix-ui";
import { ChevronRightIcon, CheckIcon } from "lucide-react";

const CONTEXT_MENU_CONTENT_CLASS =
  "z-50 min-w-48 rounded-xl border border-(--panel-border) bg-[var(--panel-bg,#fff)] p-1 text-[rgb(var(--text-rgb))] shadow-[var(--panel-shadow)] backdrop-blur-[24px] font-[Inter] [transform-origin:var(--radix-context-menu-content-transform-origin)] [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[24px] dark:bg-[var(--popover-dark,#1f1f1f)]!";

const CONTEXT_MENU_SUBCONTENT_CLASS =
  "z-50 min-w-48 rounded-xl border border-(--panel-border) bg-[var(--panel-bg,#fff)] p-1 text-[rgb(var(--text-rgb))] shadow-[var(--panel-shadow)] font-[Inter] [transform-origin:var(--radix-context-menu-content-transform-origin)] [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[24px] dark:backdrop-blur-[24px] dark:bg-[var(--popover-dark,#1f1f1f)]!";

const CONTEXT_MENU_ITEM_CLASS =
  "flex cursor-pointer select-none items-center gap-1.5 rounded-xl px-3 py-2 text-base outline-none [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[24px] not-data-[disabled=true]:focus:bg-[rgba(var(--text-rgb),0.1)] not-data-[disabled=true]:data-[highlighted]:bg-[rgba(var(--text-rgb),0.1)] data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50";

const CONTEXT_MENU_VARIANT_CLASS =
  "data-[variant=accent]:text-[rgb(var(--accent-rgb))]! data-[variant=accent]:[filter:brightness(0.5)] data-[variant=accent]:hover:bg-[rgba(var(--accent-rgb),0.179)]! data-[variant=destructive]:text-[rgb(255,4,4)]! data-[variant=destructive]:hover:bg-[rgba(255,0,0,0.179)]! dark:data-[variant=destructive]:text-[rgb(255,126,126)]! dark:data-[variant=destructive]:hover:bg-[rgba(255,126,126,0.1)]!";

const CONTEXT_MENU_INDICATOR_CLASS = "absolute right-2 pointer-events-none";

const CONTEXT_MENU_CHEVRON_CLASS =
  "ml-auto scale-90 stroke-[1.4]";

const CONTEXT_MENU_LABEL_CLASS = "px-1.5 py-1 text-xs font-medium text-[#666]";

const CONTEXT_MENU_SEPARATOR_CLASS =
  "my-[3px] mx-2 h-px bg-[rgba(var(--text-rgb),0.1)]";

const CONTEXT_MENU_SHORTCUT_CLASS =
  "ml-auto text-xs text-[#777] tracking-[0.05em]";

function ContextMenu(
  props: React.ComponentProps<typeof ContextMenuPrimitive.Root>,
) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={"select-none" + (className ? " " + className : "")}
      {...props}
    />
  );
}

function ContextMenuGroup(
  props: React.ComponentProps<typeof ContextMenuPrimitive.Group>,
) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

function ContextMenuPortal(
  props: React.ComponentProps<typeof ContextMenuPrimitive.Portal>,
) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

function ContextMenuSub(
  props: React.ComponentProps<typeof ContextMenuPrimitive.Sub>,
) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup(
  props: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>,
) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={
          CONTEXT_MENU_CONTENT_CLASS +
          " max-h-[var(--radix-context-menu-content-available-height)]" +
          (className ? " " + className : "")
        }
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  inset,
  disabled = false,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
  disabled?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-disabled={disabled}
      data-variant={variant}
      className={
        CONTEXT_MENU_ITEM_CLASS +
        " " +
        CONTEXT_MENU_VARIANT_CLASS +
        (className ? " " + className : "")
      }
      {...props}
    />
  );
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={CONTEXT_MENU_ITEM_CLASS + (className ? " " + className : "")}
      {...props}
    >
      {children}
      <ChevronRightIcon className={CONTEXT_MENU_CHEVRON_CLASS} />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={
        CONTEXT_MENU_SUBCONTENT_CLASS + (className ? " " + className : "")
      }
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      data-inset={inset}
      className={CONTEXT_MENU_ITEM_CLASS + (className ? " " + className : "")}
      checked={checked}
      {...props}
    >
      <span className={CONTEXT_MENU_INDICATOR_CLASS}>
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      data-inset={inset}
      className={CONTEXT_MENU_ITEM_CLASS + (className ? " " + className : "")}
      {...props}
    >
      <span className={CONTEXT_MENU_INDICATOR_CLASS}>
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={CONTEXT_MENU_LABEL_CLASS + (className ? " " + className : "")}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={
        CONTEXT_MENU_SEPARATOR_CLASS + (className ? " " + className : "")
      }
      {...props}
    />
  );
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={
        CONTEXT_MENU_SHORTCUT_CLASS + (className ? " " + className : "")
      }
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};

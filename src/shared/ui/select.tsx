"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDownWide, ChevronUpWide } from "@gravity-ui/icons";

const SELECT_CONTENT_CLASS =
  "relative top-0 [transform:translateY(0px)] z-[500] min-w-[120px] max-h-[var(--radix-select-content-available-height)] overflow-x-hidden overflow-y-auto rounded-xl border border-(--panel-border) bg-[var(--popover-dark,#232323)] p-1 text-[var(--popover-dark-text,#f3f4f6)] shadow-[0_12px_28px_rgba(0,0,0,0.35)] backdrop-blur-[24px] [transform-origin:var(--radix-select-content-transform-origin)] [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[20px] duration-[0.1s]";

const SELECT_VIEWPORT_CLASS = "h-[var(--radix-select-trigger-height)] p-1.5";

const SELECT_ITEM_CLASS =
  "relative flex cursor-pointer select-none items-center rounded-lg px-[19px] py-2 text-[13px] font-medium font-[Inter,sans-serif] outline-none [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[12px] duration-[0.1s] data-[highlighted]:bg-[rgba(255,255,255,0.1)] active:scale-[0.98]";

const SELECT_ITEM_INDICATOR_CLASS =
  "absolute right-2.5 flex size-3.5 items-center justify-center pointer-events-none [&>span]:flex";

const SELECT_SEPARATOR_CLASS =
  "mx-auto my-2 block h-px w-[90%] bg-[rgba(var(--text-rgb),0.1)]";

const SELECT_SCROLL_BUTTON_CLASS =
  "flex h-[22px] items-center justify-center text-[#c9c9c9]";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={className}
      {...props}
    />
  );
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  noArrow = false,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
  noArrow?: boolean;
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={className}
      {...props}
    >
      {children}
      {!noArrow && (
        <SelectPrimitive.Icon asChild>
          <ChevronDownWide />
        </SelectPrimitive.Icon>
      )}
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-align-trigger={position === "item-aligned"}
        className={
          SELECT_CONTENT_CLASS + (className ? " " + className : "")
        }
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className={SELECT_VIEWPORT_CLASS}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={className}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  check = true,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & {
  check?: boolean;
}) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={SELECT_ITEM_CLASS + (className ? " " + className : "")}
      {...props}
    >
      {check && (
        <span className={SELECT_ITEM_INDICATOR_CLASS}>
          <SelectPrimitive.ItemIndicator>
            <Check className="size-[13px]" />
          </SelectPrimitive.ItemIndicator>
        </span>
      )}
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={
        SELECT_SEPARATOR_CLASS + (className ? " " + className : "")
      }
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={
        SELECT_SCROLL_BUTTON_CLASS + (className ? " " + className : "")
      }
      {...props}
    >
      <ChevronUpWide />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={
        SELECT_SCROLL_BUTTON_CLASS + (className ? " " + className : "")
      }
      {...props}
    >
      <ChevronDownWide />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

const DIALOG_OVERLAY_CLASS =
  "fixed inset-0 z-[5000] animate-[drawo-fade-in_120ms_ease] bg-[rgba(0,0,0,0.1)] backdrop-blur-[2px] dark:bg-[rgba(0,0,0,0.4)]";

const DIALOG_CONTENT_CLASS =
  "fixed top-1/2 left-1/2 z-[50000] grid max-h-[90vh] w-full max-w-[32rem] [transform:translate(-50%,-50%)] gap-3 overflow-y-scroll [scrollbar-width:thin] rounded-xl border border-(--panel-border) bg-[var(--background,#fff)] p-4 px-7 text-sm shadow-[var(--panel-shadow)] backdrop-blur-[30px] font-[Inter,sans-serif] animate-[drawo-dialog-in_160ms_cubic-bezier(0.16,1,0.3,1)] [&_*]:duration-[0.1s] [&_p]:m-0 [&_h1:nth-of-type(1)]:mt-0 dark:bg-[var(--popover-dark,#1c1c1f)] dark:text-white";

const DIALOG_HEADER_CLASS =
  "flex flex-col gap-1.5 [&_p]:text-sm [&_p]:[transform:translateY(-10px)] [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-[-1px]";

const DIALOG_FOOTER_CLASS = "-mx-4 -mb-4 flex flex-col-reverse gap-2 p-4";

const DIALOG_TITLE_CLASS =
  "flex items-center gap-1.5 text-base font-medium leading-none";

const DIALOG_DESCRIPTION_CLASS =
  "text-sm text-[#6b7280] dark:text-[#9ca3af]";

const DIALOG_CLOSE_BUTTON_CLASS =
  "absolute top-7 right-7 flex rounded-3xl border-none bg-transparent p-1 text-current duration-[0.1s] hover:bg-[rgba(var(--text-rgb),0.1)] [&_svg]:scale-90 [&_svg_*]:stroke-1";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(
  props: React.ComponentProps<typeof DialogPrimitive.Trigger>,
) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(
  props: React.ComponentProps<typeof DialogPrimitive.Portal>,
) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose(
  props: React.ComponentProps<typeof DialogPrimitive.Close>,
) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={
        DIALOG_OVERLAY_CLASS + (className ? " " + className : "")
      }
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={DIALOG_CONTENT_CLASS + (className ? " " + className : "")}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <button className={DIALOG_CLOSE_BUTTON_CLASS}>
              <XIcon />
              <span className="sr-only">Close</span>
            </button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={DIALOG_HEADER_CLASS + (className ? " " + className : "")}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={DIALOG_FOOTER_CLASS + (className ? " " + className : "")}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <button className={DIALOG_CLOSE_BUTTON_CLASS}>Close</button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={DIALOG_TITLE_CLASS + (className ? " " + className : "")}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={
        DIALOG_DESCRIPTION_CLASS + (className ? " " + className : "")
      }
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};

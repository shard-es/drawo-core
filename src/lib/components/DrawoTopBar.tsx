import { type ReactNode } from "react";
import { useDrawo } from "../context";
import { MenuBar } from "@features/workspace/components/MenuBar";
import type { MenuBarProps } from "@features/workspace/components/MenuBar";
import { SidebarMinimalistic } from "@solar-icons/react";

// ---------------------------------------------------------------------------
// Reusable default sub-components
// ---------------------------------------------------------------------------

/**
 * Renders the default MenuBar wired to the Drawo context.
 * Accepts the same extra props as MenuBar (extraMenuSections, etc).
 */
export function DefaultMenuBar(
  props: Omit<
    MenuBarProps,
    | "scene"
    | "locale"
    | "messages"
    | "setLocale"
    | "setScene"
    | "setSceneWithoutHistory"
    | "onExportProject"
    | "onExportImage"
    | "onOpenProject"
  >,
) {
  const ctx = useDrawo();
  const {
    scene,
    locale,
    messages,
    setLocale,
    setScene,
    setSceneWithoutHistory,
    handlers,
  } = ctx;

  return (
    <MenuBar
      scene={scene}
      locale={locale}
      messages={messages}
      setLocale={setLocale}
      setScene={setScene}
      setSceneWithoutHistory={setSceneWithoutHistory}
      onExportProject={handlers.handleExportProject as () => void}
      onExportImage={
        handlers.handleExportImage as (options: {
          format: "png" | "jpg" | "svg" | "pdf";
          qualityScale: number;
          transparentBackground: boolean;
          padding: number;
        }) => Promise<void>
      }
      onOpenProject={
        handlers.handleOpenProject as (file: File) => Promise<void>
      }
      {...props}
    />
  );
}

DefaultMenuBar.displayName = "DefaultMenuBar";

/**
 * Renders the default Sidebar launcher button wired to the Drawo context.
 */
export function DefaultSidebarLauncher() {
  const { openTopbarPanel, setOpenTopbarPanel } = useDrawo();
  const isSidebarOpen = openTopbarPanel === "sidebar";

  return (
    <div className={`relative ${isSidebarOpen ? "active" : ""} [&::after]:hidden`}>
      <button
        type="button"
        className="relative flex h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-xl border border-(--panel-border) bg-(--panel-bg) text-[rgb(var(--text-rgb))] shadow-(--panel-shadow) backdrop-blur-lg transition-all duration-200 hover:brightness-95 dark:hover:brightness-130 dark:[.active_&]:border-transparent dark:[.active_&]:bg-(--accent) dark:[.active_&]:text-white [&>*]:scale-[1.3]"
        onClick={() =>
          setOpenTopbarPanel((current) =>
            current === "sidebar" ? null : "sidebar",
          )
        }
        aria-expanded={isSidebarOpen}
        aria-controls="search-library-sidebar"
        title="Abrir sidebar"
      >
        <SidebarMinimalistic weight="Bold" />
      </button>
    </div>
  );
}

DefaultSidebarLauncher.displayName = "DefaultSidebarLauncher";

/**
 * Renders all default right-side items: SidebarLauncher.
 * Use this when you want the full default right section as a single component.
 */
export function DefaultTopBarRight() {
  return (
    <>
      <DefaultSidebarLauncher />
    </>
  );
}

DefaultTopBarRight.displayName = "DefaultTopBarRight";

// ---------------------------------------------------------------------------
// DrawoTopBar
// ---------------------------------------------------------------------------

export interface DrawoTopBarProps {
  children?: ReactNode;
  /** Content to render before MenuBar (left side) */
  left?: ReactNode;
  /**
   * Fully replace the right section content.
   * When set, `rightBefore` and `rightAfter` are ignored.
   */
  right?: ReactNode;
  /** Content inserted *before* the default right items (SidebarLauncher). */
  rightBefore?: ReactNode;
  /** Content inserted *after* the default right items (SidebarLauncher). */
  rightAfter?: ReactNode;
  /** Show/hide the default MenuBar. Default: true */
  showMenuBar?: boolean;
  /** Show/hide the default Sidebar launcher in the right section. Default: true */
  showSidebarLauncher?: boolean;
  /** Extra props forwarded to the built-in MenuBar (only when showMenuBar=true) */
  menuBarProps?: Omit<
    MenuBarProps,
    | "scene"
    | "locale"
    | "messages"
    | "setLocale"
    | "setScene"
    | "setSceneWithoutHistory"
    | "onExportProject"
    | "onExportImage"
    | "onOpenProject"
  >;
}

export function DrawoTopBar({
  children,
  left,
  right,
  rightBefore,
  rightAfter,
  showMenuBar = true,
  showSidebarLauncher = true,
  menuBarProps,
}: DrawoTopBarProps) {
  const rightContent =
    right !== undefined ? (
      right
    ) : (
      <>
        {rightBefore}
        {showSidebarLauncher && <DefaultSidebarLauncher />}
        {rightAfter}
      </>
    );

  return (
    <div className="absolute inset-x-0 top-0 z-20 flex w-full items-start justify-between overflow-visible p-3">
      <div className="flex gap-2">
        {children}
        {showMenuBar && <DefaultMenuBar {...menuBarProps} />}
        {left}
      </div>
      <div className="flex items-center gap-2 [&>div]:relative [&>div]:z-[1000] [&>div]:transition-[translate_0.2s_ease-in-out] [&>div:last-child]:duration-[0.4s] [&>div::before]:absolute [&>div::before]:bottom-full [&>div::before]:left-0 [&>div::before]:z-100 [&>div::before]:h-[200%] [&>div::before]:w-full [&>div::before]:cursor-pointer [&>div::before]:content-[''] [&>div::after]:absolute [&>div::after]:top-full [&>div::after]:left-0 [&>div::after]:z-100 [&>div::after]:h-[200%] [&>div::after]:w-full [&>div::after]:content-[''] [.drawo-presentation-mode_&>div:not(:hover):not(.active)]:-translate-y-[200%] [.drawo-zen-mode_&>div::after]:pointer-events-auto">
        {rightContent}
      </div>
    </div>
  );
}

DrawoTopBar.displayName = "DrawoTopBar";

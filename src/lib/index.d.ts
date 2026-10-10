import type { ComponentProps, ReactNode, JSX } from "react";

export interface DrawoProps {
  theme?: string;
  colorScheme?: "light" | "dark";
  locale?: "en_US" | "es_ES";
  initialScene?: Scene;
  onSceneChange?: (scene: Scene) => void;
  tools?: Array<"select" | "pan" | "text" | "rectangle" | "circle" | "line" | "draw" | "image" | "laser">;
  initialOpenTopbarPanel?: "sidebar" | null;
  disablePersistence?: boolean;
  disableKeyboardShortcuts?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onExportProject?: () => void;
  onExportImage?: (options: {
    format: "png" | "jpg" | "svg" | "pdf";
    qualityScale: number;
    transparentBackground: boolean;
    padding: number;
  }) => Promise<void>;
  onOpenProject?: (file: File) => Promise<void>;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onInteractionModeChange?: (mode: "select" | "pan") => void;
  onDrawingToolChange?: (tool: NewElementType | "laser" | null) => void;
  onLocaleChange?: (locale: "en_US" | "es_ES") => void;
  onThemeChange?: (theme: string, colorScheme: "light" | "dark") => void;
  /** Current project name; surfaced in the built-in MenuBar rename dialog. */
  projectName?: string | null;
  /** When provided, the MenuBar shows a "go to home" entry that calls this. */
  onGoHome?: () => void;
  /** When provided, the MenuBar shows a "rename project" entry that calls this. */
  onRenameProject?: (name: string) => void | Promise<void>;
  children?: ReactNode;
}

export interface DrawoEmptyStateConfig {
  enabled?: boolean;
  render?: (params: {
    messages: LocaleMessages;
    onInsertImage: () => void;
  }) => ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export interface DrawoTopBarProps {
  children?: ReactNode;
  /** Content to render before MenuBar (left side) */
  left?: ReactNode;
  /** Fully replace the right section content. When set, rightBefore/rightAfter are ignored. */
  right?: ReactNode;
  /** Content inserted before the default right items (SidebarLauncher). */
  rightBefore?: ReactNode;
  /** Content inserted after the default right items (SidebarLauncher). */
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

export interface DrawoCanvasProps {
  showDefaultEmptyState?: boolean;
}

export interface DrawoEmptyStateProps {
  children?: ReactNode;
  config?: DrawoEmptyStateConfig;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface SceneSettings {
  showGrid: boolean;
  gridStyle: "dots" | "squares";
  snapToGrid: boolean;
  smartGuides: boolean;
  quillDrawOptimizations: boolean;
  gridSize: number;
  theme: "light" | "dark" | "system";
  colorScheme: string;
  zenMode: boolean;
  presentationMode: boolean;
  drawDefaults: {
    canvas: string;
    drawStroke: string;
    markerStroke: string;
    quillStroke: string;
    drawStrokeWidth: number;
    markerStrokeWidth: number;
    quillStrokeWidth: number;
  };
  shapeDefaults: {
    fill: string;
    stroke: string;
    textColor: string;
    lineStroke: string;
  };
  laserSettings: {
    lifetime: number;
    baseWidth: number;
    minWidth: number;
    shadow: boolean;
    color: string;
  };
}

export interface SceneElement {
  id: string;
  type: string;
  [key: string]: unknown;
}

export interface Scene {
  elements: SceneElement[];
  selectedId: string | null;
  selectedIds: string[];
  camera: Camera;
  settings: SceneSettings;
}

export type NewElementType = "rectangle" | "circle" | "text" | "image" | "quill" | "draw" | "marker" | "line";

export interface LocaleMessages {
  [key: string]: unknown;
}

export interface ResolvedTheme {
  preset: {
    strokeColors: readonly string[];
    shapeColors: readonly [readonly string[], readonly string[]];
  };
  dataTheme: string;
  isDark: boolean;
}

export interface DrawoContextValue {
  scene: Scene;
  resolvedTheme: ResolvedTheme;
  isDarkMode: boolean;
  isPresentationMode: boolean;
  isZenMode: boolean;
  locale: "en_US" | "es_ES";
  messages: LocaleMessages;
  interactionMode: "select" | "pan";
  drawingTool: NewElementType | "laser" | null;
  openTopbarPanel: "sidebar" | null;
  canUndo: boolean;
  canRedo: boolean;
  props: DrawoProps;
  setScene: (updater: React.SetStateAction<Scene>) => void;
  setSceneWithoutHistory: (updater: React.SetStateAction<Scene>) => void;
  commitInteractionHistory: (before: Scene) => void;
  dispatch: (action: { type: string;[key: string]: unknown }) => void;
  setInteractionMode: (mode: "select" | "pan") => void;
  setDrawingTool: (tool: NewElementType | "laser" | null) => void;
  setOpenTopbarPanel: (panel: "sidebar" | null | ((prev: "sidebar" | null) => "sidebar" | null)) => void;
  setLocale: (locale: "en_US" | "es_ES") => void;
  undo: () => void;
  redo: () => void;
  onExportProject: () => Promise<void>;
  onExportImage: (options: {
    format: ExportImageFormat;
    qualityScale: number;
    transparentBackground: boolean;
    padding: number;
  }) => Promise<void>;
  onOpenProject: (file: File) => Promise<void>;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onCopySelection: () => void;
  onCutSelection: () => void;
  onPasteAt: (x: number, y: number) => void;
  onDuplicateSelection: () => void;
  onDeleteSelection: () => void;
  onReorderSelection: (direction: "forward" | "backward" | "front" | "back") => void;
  onGroupSelection: () => void;
  onUngroupSelection: () => void;
  onFlipSelection: (axis: "horizontal" | "vertical") => void;
  onSelectGroupForElement: (id: string) => void;
  onFocusElement: (id: string) => void;
  onInsertImageFiles: (files: File[], anchor?: { x: number; y: number }) => Promise<void>;
  onInsertLibrarySvg: (asset: LibrarySvgAsset) => void;
  onSetRectangleBorderRadius: (ids: string[], borderRadius: number) => void;
  handlers: Record<string, (...args: unknown[]) => void>;
}

export type ExportImageFormat = "png" | "jpg" | "svg" | "pdf";
export interface ScenePreviewOptions {
  scene: Scene;
  /** Longest edge of the generated preview, in px. Default 960. */
  maxEdge?: number;
  /** Padding around the drawn content, in scene units. Default 64. */
  padding?: number;
  /** Keep the background transparent? Default true. */
  transparentBackground?: boolean;
  systemPrefersDark?: boolean;
}
/**
 * Renders a whole scene with the same canvas engine the editor uses and
 * returns a PNG data URL (or `null` for empty scenes). Ignores selection.
 */
export function generateScenePreviewDataUrl(
  options: ScenePreviewOptions,
): Promise<string | null>;
export type LibrarySvgAsset = { defaultWidth: number; defaultHeight: number;[key: string]: unknown };
export type LibraryCategoryId = string;

export interface MenuBarProps {
  scene: Scene;
  locale: "en_US" | "es_ES";
  messages: LocaleMessages;
  setLocale: (locale: "en_US" | "es_ES") => void;
  setScene: (updater: React.SetStateAction<Scene>) => void;
  setSceneWithoutHistory: (updater: React.SetStateAction<Scene>) => void;
  onExportProject: () => void;
  onExportImage: (options: {
    format: ExportImageFormat;
    qualityScale: number;
    transparentBackground: boolean;
    padding: number;
  }) => Promise<void>;
  onOpenProject: (file: File) => Promise<void>;
  /** Extra items appended inside the File submenu (before the separator + Clear). */
  extraFileItems?: ReactNode;
  /** Extra items appended inside the View submenu. */
  extraViewItems?: ReactNode;
  /** Extra items appended inside the Settings submenu. */
  extraSettingsItems?: ReactNode;
  /** Custom top-level submenus inserted between Organize and the links section. */
  extraMenuSections?: ReactNode;
  /** Content rendered right before the links section (Github, Discord, Donate). */
  beforeLinks?: ReactNode;
  /** Content rendered after Settings (at the very end of the menu). */
  afterSettings?: ReactNode;
  /** Current project name, shown in the rename dialog. */
  projectName?: string | null;
  /** Called when the user asks to go back to the home/studio screen. */
  onGoHome?: () => void;
  /** Called when the user confirms a new project name. */
  onRenameProject?: (name: string) => void | Promise<void>;
}

export function useDrawo(): DrawoContextValue;
export function DrawoProvider(props: DrawoProps & { children: ReactNode }): JSX.Element;

export const Drawo: React.FC<DrawoProps> & {
  TopBar: React.FC<DrawoTopBarProps>;
  Canvas: React.FC<DrawoCanvasProps>;
  ToolBar: React.FC;
  UndoBar: React.FC;
  ZoomBar: React.FC;
  EmptyState: React.FC<DrawoEmptyStateProps>;
};

export function DrawoTopBar(props: DrawoTopBarProps): JSX.Element;
export function DrawoCanvas(props: DrawoCanvasProps): JSX.Element;
export function DrawoToolBar(): JSX.Element;
export function DrawoUndoBar(): JSX.Element;
export function DrawoZoomBar(): JSX.Element;
export function DrawoEmptyState(props: DrawoEmptyStateProps): JSX.Element;

/** Default right-side content: SidebarLauncher. */
export function DefaultTopBarRight(): JSX.Element;
/** Default MenuBar wired to Drawo context. Accepts MenuBar slot props. */
export function DefaultMenuBar(props?: Omit<
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
>): JSX.Element;
/** Default Sidebar launcher button wired to Drawo context. */
export function DefaultSidebarLauncher(): JSX.Element;

export function MenuBar(props: MenuBarProps): JSX.Element;
export function ToolBar(props: Record<string, unknown>): JSX.Element;
export function UndoBar(props: { canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void }): JSX.Element;
export function ZoomBar(props: { zoomPercent: number; canZoomOut: boolean; canZoomIn: boolean; onZoomOut: () => void; onZoomIn: () => void; onZoomReset: () => void }): JSX.Element;
export function CanvasView(props: Record<string, unknown>): JSX.Element;
export function CanvasContextMenu(props: Record<string, unknown>): JSX.Element;
export function CanvasEmptyState(props: Record<string, unknown>): JSX.Element;
/** The library's own watermark logotype used as the default empty-state content. */
export function DefaultCanvasEmptyState(props: Record<string, unknown>): JSX.Element;
export function SelectionToolbar(props: Record<string, unknown>): JSX.Element;
export function SelectionTextControls(props: Record<string, unknown>): JSX.Element;
export function SelectionShapeControls(props: Record<string, unknown>): JSX.Element;
export function SelectionStrokeControls(props: Record<string, unknown>): JSX.Element;
export function SelectionImageControls(props: Record<string, unknown>): JSX.Element;
export function TextEditorOverlay(props: Record<string, unknown>): JSX.Element;
export function SearchLibrarySidebar(props: Record<string, unknown>): JSX.Element;

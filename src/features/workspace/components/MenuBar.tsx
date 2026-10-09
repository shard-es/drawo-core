import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { LocaleCode, LocaleMessages } from "@shared/i18n";
import { isLocaleCode, LANG_NAMES } from "@shared/i18n";
import {
  alignSelectedElements,
  type Scene,
  updateSceneSettings,
} from "@core/scene";
import { MenuIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@shared/ui/dropdown-menu";
import {
  ArrowDownToSquare,
  BroomMotion,
  ChevronsExpandUpRight,
  CrownDiamond,
  Cup,
  Dots9,
  Eye,
  File,
  FolderOpen,
  Gear,
  Globe,
  LayoutCells,
  LayoutHeaderCursor,
  LogoGithub,
  Molecule,
  ObjectsAlignBottom,
  ObjectsAlignCenterHorizontal,
  ObjectsAlignCenterVertical,
  ObjectsAlignLeft,
  ObjectsAlignRight,
  ObjectsAlignTop,

  PencilToSquare,
  Picture,
  Rectangles4,
  Route,
  SquareDashedCircle,
  Text,
  Thunderbolt,
  VectorSquare,
  Shapes3,
} from "@gravity-ui/icons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";
import { Alt } from "@shared/lib/platform/macShortcuts";
import { DiscordIcon, LaserPointerStylusIcon } from "@shared/ui/icons";
import { ColorSwatchPicker } from "@shared/ui/ColorSwatchPicker";
import { Slider } from "@shared/ui/slider";
import { Switch } from "@shared/ui/switch";
import { ThemeMenuSub } from "@app/theme/ThemeMenuSub";
import type { ExportImageFormat } from "@features/workspace/exportImage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

export interface MenuBarProps {
  scene: Scene;
  locale: LocaleCode;
  messages: LocaleMessages;
  setLocale: Dispatch<SetStateAction<LocaleCode>>;
  setScene: Dispatch<SetStateAction<Scene>>;
  setSceneWithoutHistory: Dispatch<SetStateAction<Scene>>;
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
}

/** Shared button visuals for dialog actions (Tailwind). */
const DIALOG_BTN_BASE =
  "cursor-pointer rounded-xl border-none px-[14px] py-[10px] text-[13px] font-semibold shadow-none outline-none transition-[0.1s]";
const DIALOG_BTN_PRIMARY = `${DIALOG_BTN_BASE} bg-(--accent) text-white shadow-[0_10px_20px_rgba(var(--accent-rgb),0.25)] hover:brightness-95 dark:brightness-110`;
const DIALOG_BTN_SECONDARY = `${DIALOG_BTN_BASE} bg-black/[0.08] text-[#111827] hover:bg-black/[0.12] dark:bg-white/[0.08] dark:text-[#f3f4f6] dark:hover:bg-white/[0.12]`;
const DIALOG_BTN_DANGER = `${DIALOG_BTN_BASE} bg-[#ef4444] text-white shadow-[0_10px_20px_rgba(239,68,68,0.25)] hover:bg-[#dc2626] dark:shadow-[0_12px_24px_rgba(239,68,68,0.35)]`;

export const MenuBar = ({
  scene,
  locale,
  messages,
  setLocale,
  setScene,
  setSceneWithoutHistory,
  onExportProject,
  onExportImage,
  onOpenProject,
  extraFileItems,
  extraViewItems,
  extraSettingsItems,
  extraMenuSections,
  beforeLinks,
  afterSettings,
}: MenuBarProps) => {
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportImageFormat>("png");
  const [exportQuality, setExportQuality] = useState(2);
  const [exportPadding, setExportPadding] = useState(24);
  const [exportTransparentBackground, setExportTransparentBackground] =
    useState(false);
  const [isLaserPointerOpen, setIsLaserPointerOpen] = useState(false);
  const [isOpenProjectConfirmOpen, setIsOpenProjectConfirmOpen] =
    useState(false);
  const [pendingProjectFile, setPendingProjectFile] = useState<File | null>(
    null,
  );
  const [laserSettings, setLaserSettings] = useState(
    scene.settings.laserSettings,
  );
  const projectInputRef = useRef<HTMLInputElement | null>(null);
  const hasElements = scene.elements.length > 0;
  const selectedCount =
    scene.selectedIds.length > 0
      ? scene.selectedIds.length
      : scene.selectedId
        ? 1
        : 0;
  const hasSelection = selectedCount > 0;

  const handleLaserDialogOpen = (open: boolean) => {
    setIsLaserPointerOpen(open);
    if (open) {
      setLaserSettings(scene.settings.laserSettings);
    }
  };

  const handleLaserSave = () => {
    setSceneWithoutHistory((currentScene) =>
      updateSceneSettings(currentScene, {
        laserSettings: laserSettings,
      }),
    );
    setIsLaserPointerOpen(false);
  };

  const handleLaserReset = () => {
    setLaserSettings({
      lifetime: 600,
      baseWidth: 11,
      shadow: false,
      minWidth: 0.3,
      color: "#FF1A28",
    });
  };

  const handleClearCanvas = useCallback(() => {
    setScene((currentScene) => {
      if (currentScene.elements.length === 0) {
        return currentScene;
      }

      return {
        ...currentScene,
        elements: [],
        selectedId: null,
        selectedIds: [],
      };
    });
    setIsClearDialogOpen(false);
  }, [setScene]);

  const applyOpenProject = useCallback(
    async (file: File) => {
      try {
        await onOpenProject(file);
      } catch {
        window.alert(messages.dialogs.openProject.invalidFile);
      }
    },
    [messages.dialogs.openProject.invalidFile, onOpenProject],
  );

  const handleOpenProjectFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      event.currentTarget.value = "";
      if (!file) {
        return;
      }

      if (!file.name.toLowerCase().endsWith(".drawo")) {
        window.alert(messages.dialogs.openProject.invalidExtension);
        return;
      }

      if (hasElements) {
        setPendingProjectFile(file);
        setIsOpenProjectConfirmOpen(true);
        return;
      }

      void applyOpenProject(file);
    },
    [
      applyOpenProject,
      hasElements,
      messages.dialogs.openProject.invalidExtension,
    ],
  );

  const handleConfirmOpenProject = useCallback(() => {
    if (!pendingProjectFile) {
      setIsOpenProjectConfirmOpen(false);
      return;
    }

    const nextFile = pendingProjectFile;
    setPendingProjectFile(null);
    setIsOpenProjectConfirmOpen(false);
    void applyOpenProject(nextFile);
  }, [applyOpenProject, pendingProjectFile]);

  const handleExportImage = useCallback(async () => {
    if (isExportingImage) {
      return;
    }

    setIsExportingImage(true);

    try {
      await onExportImage({
        format: exportFormat,
        qualityScale: exportQuality,
        transparentBackground: exportTransparentBackground,
        padding: exportPadding,
      });
      setIsExportDialogOpen(false);
    } catch {
      window.alert(messages.dialogs.exportImage.genericError);
    } finally {
      setIsExportingImage(false);
    }
  }, [
    exportFormat,
    exportPadding,
    exportQuality,
    exportTransparentBackground,
    isExportingImage,
    messages.dialogs.exportImage.genericError,
    onExportImage,
  ]);

  return (
    <div className="z-10 flex w-fit select-none items-center justify-center gap-px rounded-xl border border-(--panel-border) bg-(--panel-bg) p-0.5 shadow-(--panel-shadow) backdrop-blur-3xl">
      <input
        ref={projectInputRef}
        type="file"
        accept=".drawo"
        hidden
        onChange={handleOpenProjectFileChange}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="flex size-10 items-center justify-center rounded-xl border-none bg-transparent p-[10px] text-black shadow-none outline-none transition-[0.1s] hover:bg-[rgba(var(--text-rgb),0.1)] active:scale-95 dark:text-[#e5e7eb] [&_svg]:size-5" onClick={() => { }}>
            <MenuIcon />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="drawo-menu-stagger">
          <DropdownMenuItem disabled variant="accent">
            <Thunderbolt /> {messages.menu.quickActions}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <File />
              {messages.menu.file}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => {
                  projectInputRef.current?.click();
                }}
              >
                <FolderOpen /> {messages.menu.openProject}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportProject}>
                <ArrowDownToSquare /> {messages.menu.saveProject}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsExportDialogOpen(true)}
                disabled={!hasElements}
              >
                <Picture /> {messages.menu.exportProject}
              </DropdownMenuItem>
              {extraFileItems}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsClearDialogOpen(true)}
                disabled={!hasElements}
              >
                <BroomMotion /> {messages.menu.clearCanvas}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled>
              <PencilToSquare />
              {messages.menu.edit}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent></DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Eye />
              {messages.menu.view}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuCheckboxItem
                checked={scene.settings.showGrid}
                onClick={() => {
                  setSceneWithoutHistory((currentScene) =>
                    updateSceneSettings(currentScene, {
                      showGrid: !currentScene.settings.showGrid,
                    }),
                  );
                }}
              >
                <LayoutCells /> {messages.menu.showGrid}{" "}
              </DropdownMenuCheckboxItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <LayoutHeaderCursor />
                  {messages.menu.gridStyle}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={scene.settings.gridStyle}
                    onValueChange={(value) => {
                      if (value !== "dots" && value !== "squares") {
                        return;
                      }

                      setSceneWithoutHistory((currentScene) =>
                        updateSceneSettings(currentScene, {
                          gridStyle: value,
                        }),
                      );
                    }}
                  >
                    <DropdownMenuRadioItem value="dots">
                      <Dots9 />
                      {messages.menu.gridStyleDots}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="squares">
                      <Rectangles4 />
                      {messages.menu.gridStyleSquares}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />

              <DropdownMenuCheckboxItem
                checked={scene.settings.zenMode}
                onClick={() => {
                  setSceneWithoutHistory((currentScene) =>
                    updateSceneSettings(currentScene, {
                      zenMode: !currentScene.settings.zenMode,
                    }),
                  );
                }}
              >
                <Cup /> {messages.menu.zenMode}
                <div className="[.drawo-zen-mode_&]:hidden">
                  <span>{Alt()}</span>+ <span>Z</span>
                </div>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={scene.settings.presentationMode}
                onClick={() => {
                  setSceneWithoutHistory((currentScene) =>
                    updateSceneSettings(currentScene, {
                      presentationMode: !currentScene.settings.presentationMode,
                    }),
                  );
                }}
              >
                <ChevronsExpandUpRight /> {messages.menu.presentationMode}
                <div className="[.drawo-zen-mode_&]:hidden">
                  <span>{Alt()}</span>+ <span>R</span>
                </div>
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={scene.settings.quillDrawOptimizations}
                onClick={() => {
                  setSceneWithoutHistory((currentScene) =>
                    updateSceneSettings(currentScene, {
                      quillDrawOptimizations:
                        !currentScene.settings.quillDrawOptimizations,
                    }),
                  );
                }}
              >
                <Molecule /> {messages.menu.quillDrawOptimizations}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={scene.settings.shapeRecognition}
                onClick={() => {
                  setSceneWithoutHistory((currentScene) =>
                    updateSceneSettings(currentScene, {
                      shapeRecognition:
                        !currentScene.settings.shapeRecognition,
                    }),
                  );
                }}
              >
                <Shapes3 /> {messages.menu.shapeRecognition}
              </DropdownMenuCheckboxItem>
              {extraViewItems}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled>
              <VectorSquare />
              {messages.menu.object}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent></DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled>
              <Text />
              {messages.menu.text}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent></DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ObjectsAlignBottom />
              {messages.menu.organize}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                disabled={selectedCount < 2}
                onClick={() => {
                  setScene((currentScene) =>
                    alignSelectedElements(currentScene, "left"),
                  );
                }}
              >
                <ObjectsAlignLeft />
                {messages.menu.organizeActions.alignLeft}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={selectedCount < 2}
                onClick={() => {
                  setScene((currentScene) =>
                    alignSelectedElements(currentScene, "center"),
                  );
                }}
              >
                <ObjectsAlignCenterHorizontal />
                {messages.menu.organizeActions.alignCenter}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={selectedCount < 2}
                onClick={() => {
                  setScene((currentScene) =>
                    alignSelectedElements(currentScene, "right"),
                  );
                }}
              >
                <ObjectsAlignRight />
                {messages.menu.organizeActions.alignRight}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={selectedCount < 2}
                onClick={() => {
                  setScene((currentScene) =>
                    alignSelectedElements(currentScene, "top"),
                  );
                }}
              >
                <ObjectsAlignTop />
                {messages.menu.organizeActions.alignTop}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={selectedCount < 2}
                onClick={() => {
                  setScene((currentScene) =>
                    alignSelectedElements(currentScene, "middle"),
                  );
                }}
              >
                <ObjectsAlignCenterVertical />
                {messages.menu.organizeActions.alignMiddle}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={selectedCount < 2}
                onClick={() => {
                  setScene((currentScene) =>
                    alignSelectedElements(currentScene, "bottom"),
                  );
                }}
              >
                <ObjectsAlignBottom />
                {messages.menu.organizeActions.alignBottom}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {extraMenuSections}

          <DropdownMenuSeparator />
          {beforeLinks}
          <DropdownMenuItem
            onClick={() => {
              window.open("https://github.com/drawo-app/drawo", "_blank");
            }}
          >
            <LogoGithub /> Github
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              window.open("https://discord.gg/gKvwzZHav7", "_blank");
            }}
          >
            <DiscordIcon /> Discord
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              window.open("https://buymeacoffee.com/pico190_", "_blank");
            }}
          >
            <CrownDiamond /> {messages.menu.donate}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ThemeMenuSub
            messages={messages}
            currentTheme={`${scene.settings.colorScheme}-${scene.settings.theme === "dark" ? "dark" : "light"}`}
            setTheme={(theme) => {
              const separatorIndex = theme.lastIndexOf("-");
              if (separatorIndex === -1) {
                return;
              }

              const colorScheme = theme.slice(
                0,
                separatorIndex,
              ) as Scene["settings"]["colorScheme"];
              const mode = theme.slice(separatorIndex + 1);
              if (mode !== "light" && mode !== "dark") {
                return;
              }

              setSceneWithoutHistory((currentScene) =>
                updateSceneSettings(currentScene, {
                  colorScheme,
                  theme: mode,
                }),
              );
            }}
          />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Gear />
              {messages.menu.settings}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuCheckboxItem
                checked={scene.settings.snapToGrid}
                onClick={() => {
                  setSceneWithoutHistory((currentScene) =>
                    updateSceneSettings(currentScene, {
                      snapToGrid: !currentScene.settings.snapToGrid,
                    }),
                  );
                }}
              >
                <SquareDashedCircle /> {messages.menu.snapToGrid}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={scene.settings.smartGuides}
                onClick={() => {
                  setSceneWithoutHistory((currentScene) =>
                    updateSceneSettings(currentScene, {
                      smartGuides: !currentScene.settings.smartGuides,
                    }),
                  );
                }}
              >
                <Route /> {messages.menu.smartGuides}
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe />
                  {messages.menu.language}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={locale}
                    onValueChange={(value) => {
                      if (isLocaleCode(value)) {
                        setLocale(value);
                      }
                    }}
                  >
                    {Object.entries(LANG_NAMES).map(([code, name]) => {
                      return (
                        <DropdownMenuRadioItem value={code}>
                          {name}
                        </DropdownMenuRadioItem>
                      );
                    })}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem
                onClick={() => {
                  handleLaserDialogOpen(true);
                }}
              >
                <LaserPointerStylusIcon /> {messages.dialogs.laserCanvas.label}
              </DropdownMenuItem>
              {extraSettingsItems}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {afterSettings}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isLaserPointerOpen} onOpenChange={handleLaserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messages.dialogs.laserCanvas.title}</DialogTitle>
            <DialogDescription>
              {messages.dialogs.laserCanvas.description}
            </DialogDescription>
          </DialogHeader>
          <p className="label">{messages.dialogs.laserCanvas.color}</p>
          <div className="[&_*]:[--size:32px] [&_[data-slot=color-swatch-container]]:size-[42px]">
            <ColorSwatchPicker
              colors={[
                "#FF1A28",
                "#FF7A00",
                "#FFD400",
                "#00E05A",
                "#008CFF",
                "#7c5cff",
                "#FF2BD6",
                "#00E5FF",
              ]}
              currentColor={laserSettings.color}
              uniColor={(color) => color}
              renderItem={({ color, swatch }) => (
                <div
                  key={color}
                  className="float-left w-fit shrink-0 rounded-full bg-transparent p-[4px_1px]! transition-[0.1s] hover:scale-105"
                  onPointerDown={() => {
                    setLaserSettings((prev) => ({ ...prev, color }));
                  }}
                >
                  {swatch}
                </div>
              )}
            />
          </div>
          <p className="label">{messages.dialogs.laserCanvas.lifetime}</p>
          <Slider
            value={[laserSettings.lifetime]}
            onValueChange={(val) => {
              setLaserSettings((prev) => ({ ...prev, lifetime: val[0] }));
            }}
            max={2000}
            min={100}
            step={10}
          />
          <p className="label">{messages.dialogs.laserCanvas.baseWidth}</p>
          <Slider
            value={[laserSettings.baseWidth]}
            onValueChange={(val) => {
              setLaserSettings((prev) => ({ ...prev, baseWidth: val[0] }));
            }}
            max={30}
            min={1}
            step={0.5}
          />
          <p className="label">{messages.dialogs.laserCanvas.minWidth}</p>
          <Slider
            value={[laserSettings.minWidth]}
            onValueChange={(val) => {
              setLaserSettings((prev) => ({ ...prev, minWidth: val[0] }));
            }}
            max={5}
            min={0.1}
            step={0.1}
          />
          <div className="mt-2 flex items-center gap-2.5 [&_span:not([data-slot=switch]_*):not([data-slot=switch])]:opacity-80">
            <Switch
              checked={laserSettings.shadow}
              onCheckedChange={(e) => {
                setLaserSettings((prev) => ({
                  ...prev,
                  shadow: e,
                }));
              }}
            />
            <span className="flex items-center gap-3">
              {messages.dialogs.laserCanvas.enableShadows}{" "}
              <span className="ml-auto flex items-center gap-0.5 pl-6 text-xs opacity-70 [&_span]:rounded-md [&_span]:bg-[rgba(var(--accent-rgb),0.5)] [&_span]:px-1 [&_span]:py-0.5 [&_span]:font-medium [&_span]:text-[rgb(var(--accent-rgb))]">
                <span>BETA</span>
              </span>
            </span>
          </div>

          <DialogFooter>
            <div className="flex w-full flex-col-reverse justify-between gap-2 md:flex-row md:justify-between">
              <div className="flex gap-2.5">
                <button
                  type="button"
                  className={DIALOG_BTN_SECONDARY}
                  onClick={handleLaserReset}
                >
                  {messages.dialogs.laserCanvas.reset}
                </button>
              </div>
              <div className="flex gap-2.5">
                <DialogClose asChild>
                  <button type="button" className={DIALOG_BTN_SECONDARY}>
                    {messages.dialogs.laserCanvas.cancel}
                  </button>
                </DialogClose>
                <button
                  type="button"
                  className={DIALOG_BTN_PRIMARY}
                  onClick={handleLaserSave}
                >
                  {messages.dialogs.laserCanvas.save}
                </button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messages.dialogs.exportImage.title}</DialogTitle>
            <DialogDescription>
              {hasSelection
                ? messages.dialogs.exportImage.descriptionSelection
                : messages.dialogs.exportImage.descriptionAll}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <p className="label">{messages.dialogs.exportImage.format}</p>
              <Select
                value={exportFormat}
                onValueChange={(nextValue) => {
                  if (
                    nextValue === "png" ||
                    nextValue === "jpg" ||
                    nextValue === "svg" ||
                    nextValue === "pdf"
                  ) {
                    setExportFormat(nextValue);
                  }
                }}
              >
                <SelectTrigger className="inline-flex h-(--selectiontoolbar-height) items-center justify-between gap-0 rounded-2xl border-none bg-[rgba(var(--text-rgb),0.1)] px-5 py-5 shadow-none outline-none">
                  <SelectValue
                    placeholder={messages.dialogs.exportImage.format}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="svg">SVG</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <p className="label">
                {messages.dialogs.exportImage.quality} ({exportQuality}x)
              </p>
              <Slider
                value={[exportQuality]}
                min={1}
                max={4}
                step={1}
                onValueChange={(value) => {
                  setExportQuality(value[0]);
                }}
              />
            </div>

            <div className="grid gap-2">
              <p className="label">
                {messages.dialogs.exportImage.padding} ({exportPadding}px)
              </p>
              <Slider
                value={[exportPadding]}
                min={0}
                max={96}
                step={2}
                onValueChange={(value) => {
                  setExportPadding(value[0]);
                }}
              />
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2.5 [&_span:not([data-slot=switch]_*):not([data-slot=switch])]:opacity-80">
            <Switch
              disabled={exportFormat === "jpg"}
              checked={
                exportFormat === "jpg" ? false : exportTransparentBackground
              }
              onCheckedChange={(value) => {
                setExportTransparentBackground(value);
              }}
            />
            <span className="flex items-center gap-3">
              {messages.dialogs.exportImage.transparentBackground}
            </span>
          </div>

          {exportFormat === "jpg" && (
            <p className="label mt-2.5">
              {messages.dialogs.exportImage.jpgNoTransparency}
            </p>
          )}

          <DialogFooter>
            <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
              <DialogClose asChild>
                <button type="button" className={DIALOG_BTN_SECONDARY}>
                  {messages.dialogs.exportImage.cancel}
                </button>
              </DialogClose>
              <button
                type="button"
                className={DIALOG_BTN_PRIMARY}
                onClick={() => {
                  void handleExportImage();
                }}
                disabled={isExportingImage}
              >
                {isExportingImage
                  ? messages.dialogs.exportImage.exporting
                  : messages.dialogs.exportImage.export}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messages.dialogs.clearCanvas.title}</DialogTitle>
            <DialogDescription>
              {messages.dialogs.clearCanvas.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
              <DialogClose asChild>
                <button type="button" className={DIALOG_BTN_SECONDARY}>
                  {messages.dialogs.clearCanvas.cancel}
                </button>
              </DialogClose>
              <button
                type="button"
                className={DIALOG_BTN_DANGER}
                onClick={handleClearCanvas}
              >
                {messages.dialogs.clearCanvas.confirm}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isOpenProjectConfirmOpen}
        onOpenChange={setIsOpenProjectConfirmOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messages.dialogs.openProject.title}</DialogTitle>
            <DialogDescription>
              {messages.dialogs.openProject.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
              <DialogClose asChild>
                <button
                  type="button"
                  className={DIALOG_BTN_SECONDARY}
                  onClick={() => {
                    setPendingProjectFile(null);
                  }}
                >
                  {messages.dialogs.openProject.cancel}
                </button>
              </DialogClose>
              <button
                type="button"
                className={DIALOG_BTN_DANGER}
                onClick={handleConfirmOpenProject}
              >
                {messages.dialogs.openProject.confirm}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

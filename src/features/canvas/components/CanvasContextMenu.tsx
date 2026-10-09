import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Circles5Random,
  Copy,
  CopyPlus,
  Cubes3,
  Droplet,
  Layers,
  Scissors,
  Sticker,
  TrapezoidLeftLineHorizontal,
  TrapezoidUpLineVertical,
  TrashBin,
  VectorSquare,
} from "@gravity-ui/icons";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@shared/ui/context-menu";
import type { LocaleMessages } from "@shared/i18n";
import { Ctrl, Shift } from "@shared/lib/platform/macShortcuts";
import {
  LayerBringForward,
  LayerBringToFront,
  LayerSendBackward,
  LayerSendToBack,
} from "@shared/ui/icons";
import { Slider } from "@shared/ui/slider";

/* Shows the keyboard shortcut chips at the right edge of a context-menu row.
 * Hidden while zen mode is active (the app toggles `drawo-zen-mode` on <html>). */
const KEYBIND =
  "ml-auto flex items-center gap-0.5 pl-6 text-xs opacity-70 " +
  "[.drawo-zen-mode_&]:hidden " +
  "[&>span]:rounded-[5px] [&>span]:bg-[rgba(var(--text-rgb),0.1)] " +
  "[&>span]:px-1 [&>span]:py-0.5 [&>span]:font-medium " +
  "[&>span]:text-[rgba(var(--text-rgb),0.6)] [&>span]:[corner-shape:squircle] " +
  "[&>span]:supports-[corner-shape:squircle]:rounded-[12px]";

export type CanvasContextMenuSelectionType = "draw" | "image" | "multiple";

interface CanvasContextMenuProps {
  children: ReactNode;
  hasSelection: boolean;
  canFlipSelection: boolean;
  selectionType: CanvasContextMenuSelectionType;
  selectionOpacity: number | null;
  localeMessages: LocaleMessages;
  hasElements: boolean;
  canUngroupSelection: boolean;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onSelectAll: () => void;
  onMoveForward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onMoveBackward: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onSelectionOpacityChange: (opacity: number) => void;
}

export const CanvasContextMenu = ({
  children,
  hasSelection,
  canFlipSelection,
  selectionType,
  selectionOpacity,
  hasElements,
  localeMessages,
  canUngroupSelection,
  onCut,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onGroup,
  onUngroup,
  onSelectAll,
  onMoveForward,
  onBringToFront,
  onSendToBack,
  onMoveBackward,
  onFlipHorizontal,
  onFlipVertical,
  onSelectionOpacityChange,
}: CanvasContextMenuProps) => {
  const hasMultipleSelection = hasSelection && selectionType === "multiple";
  const normalizedSelectionOpacity = useMemo(() => {
    if (typeof selectionOpacity !== "number" || !Number.isFinite(selectionOpacity)) {
      return 100;
    }

    return Math.max(0, Math.min(100, Math.round(selectionOpacity)));
  }, [selectionOpacity]);
  const [opacityValue, setOpacityValue] = useState(normalizedSelectionOpacity);
  const [opacityInput, setOpacityInput] = useState(
    String(normalizedSelectionOpacity),
  );

  useEffect(() => {
    setOpacityValue(normalizedSelectionOpacity);
    setOpacityInput(String(normalizedSelectionOpacity));
  }, [normalizedSelectionOpacity, hasSelection]);

  const applyOpacity = (nextOpacity: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(nextOpacity)));
    setOpacityValue(clamped);
    setOpacityInput(String(clamped));
    onSelectionOpacityChange(clamped);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {hasSelection && (
          <>
            <ContextMenuItem onClick={onCut}>
              <Scissors />
              {localeMessages.contextMenu.cut}
              <span className={KEYBIND}>
                <span>{Ctrl()}</span> + <span>X</span>
              </span>
            </ContextMenuItem>
            <ContextMenuItem onClick={onCopy}>
              <Copy />
              {localeMessages.contextMenu.copy}
              <span className={KEYBIND}>
                <span>{Ctrl()}</span> + <span>C</span>
              </span>
            </ContextMenuItem>
          </>
        )}
        <ContextMenuItem onClick={onPaste}>
          <Sticker />
          {localeMessages.contextMenu.paste}
          <span className={KEYBIND}>
            <span>{Ctrl()}</span> + <span>V</span>
          </span>
        </ContextMenuItem>

        {hasSelection && (
          <>
            <ContextMenuItem onClick={onDuplicate}>
              <CopyPlus />
              {localeMessages.contextMenu.duplicate}
              <span className={KEYBIND}>
                <span>{Ctrl()}</span>+<span>D</span>
              </span>
            </ContextMenuItem>
            <ContextMenuItem onClick={onDelete} variant="destructive">
              <TrashBin />
              {localeMessages.contextMenu.delete}
              <span className={KEYBIND}>
                <span>Del</span>
              </span>
            </ContextMenuItem>
          </>
        )}

        {(hasMultipleSelection || canUngroupSelection || hasSelection) && (
          <ContextMenuSeparator />
        )}
        {(hasMultipleSelection || canUngroupSelection) && (
          <>
            {hasMultipleSelection && (
              <ContextMenuItem onClick={onGroup}>
                <VectorSquare />
                {localeMessages.contextMenu.group}
                <span className={KEYBIND}>
                  <span>{Ctrl()}</span>+<span>G</span>
                </span>
              </ContextMenuItem>
            )}
            {canUngroupSelection && (
              <ContextMenuItem onClick={onUngroup}>
                <Circles5Random />
                {localeMessages.contextMenu.ungroup}
                <span className={KEYBIND}>
                  <span>{Ctrl()}</span>+<span>{Shift()}</span>+<span>G</span>
                </span>
              </ContextMenuItem>
            )}
          </>
        )}

        {hasSelection && (
          <>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Layers />
                {localeMessages.contextMenu.layers.text}
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onClick={onBringToFront}>
                  <LayerBringToFront />
                  {localeMessages.contextMenu.layers.bringToFront}
                </ContextMenuItem>
                <ContextMenuItem onClick={onMoveForward}>
                  <LayerBringForward />
                  {localeMessages.contextMenu.layers.bringForward}
                </ContextMenuItem>
                <ContextMenuItem onClick={onSendToBack}>
                  <LayerSendToBack />
                  {localeMessages.contextMenu.layers.sendToBack}
                </ContextMenuItem>
                <ContextMenuItem onClick={onMoveBackward}>
                  <LayerSendBackward />
                  {localeMessages.contextMenu.layers.sendBackward}
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Droplet />
                {localeMessages.selectionBar.opacity}...
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="min-w-[230px] p-1.5">
                <div
                  className="flex flex-col gap-2.5 rounded-[10px] p-1.5 [corner-shape:squircle]"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-center justify-between gap-2 text-[15px]">
                    <span>{localeMessages.selectionBar.opacity}</span>
                    <div className="inline-flex items-center gap-1">
                      <input
                        className="h-4 w-[54px] min-w-[54px] rounded-lg border border-(--panel-border) bg-[rgba(var(--text-rgb),0.1)] px-2 py-1 text-xs text-right [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[16px] transition-[border-color,box-shadow,background] duration-[120ms] [appearance:textfield] [&::-webkit-inner-spin-button]:[-webkit-appearance:none] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:[-webkit-appearance:none] [&::-webkit-outer-spin-button]:m-0"
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={opacityInput}
                        onChange={(event) => {
                          const sanitized = event.target.value.replace(
                            /[^0-9]/g,
                            "",
                          );
                          setOpacityInput(sanitized);
                        }}
                        onBlur={() => {
                          const parsed = Number.parseInt(opacityInput, 10);
                          applyOpacity(Number.isFinite(parsed) ? parsed : opacityValue);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            const parsed = Number.parseInt(opacityInput, 10);
                            applyOpacity(
                              Number.isFinite(parsed) ? parsed : opacityValue,
                            );
                            event.currentTarget.blur();
                            return;
                          }

                          if (event.key === "Escape") {
                            setOpacityInput(String(opacityValue));
                            event.currentTarget.blur();
                          }
                        }}
                      />
                      <span className="text-xs opacity-65">%</span>
                    </div>
                  </div>

                  <Slider
                    className="drawo-contextmenu-opacity-slider"
                    value={[opacityValue]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      const next = value[0] ?? opacityValue;
                      setOpacityValue(next);
                      setOpacityInput(String(Math.round(next)));
                    }}
                    onValueCommit={(value) => {
                      applyOpacity(value[0] ?? opacityValue);
                    }}
                  />

                </div>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem
              disabled={!canFlipSelection}
              onClick={onFlipHorizontal}
            >
              <TrapezoidUpLineVertical />
              Voltear horizontalmente
              <span className={KEYBIND}>
                <span>{Shift()}</span>+<span>H</span>
              </span>
            </ContextMenuItem>
            <ContextMenuItem
              disabled={!canFlipSelection}
              onClick={onFlipVertical}
            >
              <TrapezoidLeftLineHorizontal />
              Voltear verticalmente
              <span className={KEYBIND}>
                <span>{Shift()}</span>+<span>V</span>
              </span>
            </ContextMenuItem>
          </>
        )}

        <ContextMenuSeparator />
        <ContextMenuItem disabled={!hasElements} onClick={onSelectAll}>
          <Cubes3 />
          {localeMessages.contextMenu.selectEverything}
          <span className={KEYBIND}>
            <span>{Ctrl()}</span> + <span>A</span>
          </span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

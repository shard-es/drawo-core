import { type Dispatch, type RefObject, type SetStateAction } from "react";
import Chrome from "@uiw/react-color-chrome";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";
import { ColorSwatchPicker } from "@shared/ui/ColorSwatchPicker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/tooltip";
import type { LineCap } from "@core/elements";
import type { NewElementType, Scene } from "@core/scene";
import type { LocaleMessages } from "@shared/i18n";
import {
  DRAW_STROKE_OPTIONS,
  DRAW_STROKE_PREVIEWS,
  getClosestDrawStrokeOption,
  getClosestMarkerStrokeOption,
  LINE_STROKELINECAPS,
  LINE_STROKELINECAPS_PREVIEWS,
  MARKER_STROKE_OPTIONS,
  MARKER_STROKE_PREVIEWS,
} from "@features/canvas/rendering/constants";
import { parseColorForPicker } from "@features/canvas/rendering/color";
import {
  getSelectedDrawElements,
  getSelectedLineElements,
  getSharedValue,
} from "@features/canvas/selection/selectionState";

/* The selection toolbar renders inside `.selection-toolbar`, which used to give
 * every `select-trigger` descendant these dimensions. Reproduced per-trigger. */
const SELECT_TRIGGER =
  "inline-flex h-(--selectiontoolbar-height) items-center justify-between gap-0 " +
  "rounded-none border-none bg-transparent px-2.5 text-sm font-medium " +
  "text-[color:var(--popover-dark-text,#f3f4f6)] shadow-none outline-none " +
  "transition-colors duration-150 hover:bg-[rgba(255,255,255,0.05)] " +
  /* The trailing chevron svg (radix renders it via SelectPrimitive.Icon). */
  "[&>svg:last-child]:size-[14px] [&>svg:last-child]:ml-2 " +
  "[&>svg:last-child]:pointer-events-none " +
  "[&>svg:last-child]:text-[color:var(--popover-dark-text,#b8b8b8)]";

/* Stroke-width trigger: inherits SELECT_TRIGGER and is centred at a fixed width.
 * (`.tool-bar .draw-stroke-trigger` is scoped to `features/workspace`, so it does
 * not reach this toolbar — the pointer cursor from SELECT_TRIGGER applies.) */
const DRAW_STROKE_TRIGGER =
  `${SELECT_TRIGGER} w-[78px] justify-center px-3`;

/* Swatch rows inside the colour `SelectContent` were laid out by
 * `.drawo-colorselect-content` (fit-to-content, children forced into a row). */
const COLORSELECT_CONTENT = "w-fit! min-w-fit! [&_*]:flex-row!";

/* One colour swatch button. */
const COLORSELECT_ITEM =
  "float-left w-fit shrink-0 cursor-pointer rounded-full bg-transparent " +
  "p-[4px_1px]! transition-all duration-[0.1s] hover:scale-105";

/* Vertical hairline between toolbar groups. */
const SELECTIONBAR_SEPARATOR =
  "my-auto ml-[5px] mr-1 h-5 w-px bg-[rgba(var(--darkborder-rgb,255,255,255),1)] opacity-20";

/* One stroke-width option in the stroke `SelectContent`. */
const DRAW_STROKE_SELECT_ITEM = "flex p-[7px_8px] [&_*]:w-full";

/* The live stroke preview drawn inside a stroke-width trigger/option. */
const DRAW_STROKE_OPTION_LINE_WRAP =
  "flex items-center justify-center [&_svg]:h-auto [&_svg]:w-[180px]";

/* The custom colour picker is hosted in a tooltip, so it must drop the tooltip's
 * shadow and shift down clear of the toolbar. Both rules were `!important`
 * because they compete with `.drawo-tooltip-content` on the same element. */
const CONTENT_COLOR = "[box-shadow:none]! [transform:translateY(60px)]!";

interface SelectionStrokeControlsProps {
  scene: Scene;
  strokeColors: readonly string[];
  selectedIds: string[];
  drawingTool: NewElementType | "laser" | null;
  localeMessages: LocaleMessages;
  customDrawColorPickerWrapRef: RefObject<HTMLDivElement | null>;
  customDrawColorPickerContentRef: RefObject<HTMLDivElement | null>;
  isCustomDrawColorPickerOpen: boolean;
  setIsCustomDrawColorPickerOpen: Dispatch<SetStateAction<boolean>>;
  customDrawColorPickerColor: string;
  setCustomDrawColorPickerColor: Dispatch<SetStateAction<string>>;
  onDrawStrokeWidthChange: (ids: string[], strokeWidth: number) => void;
  onDrawStrokeColorChange: (ids: string[], strokeColor: string) => void;
  onDrawDefaultStrokeColorChange: (
    drawMode: "draw" | "marker" | "quill",
    strokeColor: string,
  ) => void;
  onLineStartCapChange: (ids: string[], startCap: LineCap) => void;
  onLineEndCapChange: (ids: string[], endCap: LineCap) => void;
  uniColor: (color: string) => string;
  activeSelectId: string | null;
  setActiveSelectId: (id: string | null) => void;
}

const renderDrawStrokePreview = (
  previews: typeof DRAW_STROKE_PREVIEWS,
  index: number,
) => {
  const preview = previews[index] ?? previews[0];
  if (!preview) {
    return null;
  }

  return (
    <svg
      width={preview.width}
      height={preview.height}
      viewBox={preview.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={preview.path}
        stroke={preview.strokeWidth ? "currentColor" : undefined}
        strokeWidth={preview.strokeWidth}
        strokeLinecap={preview.strokeWidth ? "round" : undefined}
        fill={preview.fill}
      />
    </svg>
  );
};

export const SelectionStrokeControls = ({
  scene,
  strokeColors,
  selectedIds,
  drawingTool,
  localeMessages,
  customDrawColorPickerWrapRef,
  customDrawColorPickerContentRef,
  isCustomDrawColorPickerOpen,
  setIsCustomDrawColorPickerOpen,
  customDrawColorPickerColor,
  setCustomDrawColorPickerColor,
  onDrawStrokeWidthChange,
  onDrawStrokeColorChange,
  onDrawDefaultStrokeColorChange,
  onLineStartCapChange,
  onLineEndCapChange,
  uniColor,
  activeSelectId,
  setActiveSelectId,
}: SelectionStrokeControlsProps) => {
  const selectedDrawElements = getSelectedDrawElements(
    scene.elements,
    selectedIds,
  );
  const selectedLineElements = getSelectedLineElements(
    scene.elements,
    selectedIds,
  );
  const selectedDrawMode =
    getSharedValue(
      selectedDrawElements,
      (element) => element.drawMode ?? "draw",
    ) ?? "draw";
  const strokeOptions =
    selectedDrawMode === "marker" ? MARKER_STROKE_OPTIONS : DRAW_STROKE_OPTIONS;
  const strokePreviews =
    selectedDrawMode === "marker"
      ? MARKER_STROKE_PREVIEWS
      : DRAW_STROKE_PREVIEWS;
  const selectedDrawStrokeWidth =
    selectedDrawMode === "marker"
      ? getClosestMarkerStrokeOption(
          getSharedValue(
            selectedDrawElements,
            (element) => element.strokeWidth,
          ) ?? MARKER_STROKE_OPTIONS[0],
        )
      : getClosestDrawStrokeOption(
          getSharedValue(
            selectedDrawElements,
            (element) => element.strokeWidth,
          ) ?? DRAW_STROKE_OPTIONS[1],
        );
  const defaultDrawStrokeColor =
    selectedDrawMode === "marker"
      ? scene.settings.drawDefaults.markerStroke
      : selectedDrawMode === "quill"
        ? scene.settings.drawDefaults.quillStroke
        : scene.settings.drawDefaults.drawStroke;
  const selectedDrawStrokeColor =
    selectedDrawElements[0]?.stroke || defaultDrawStrokeColor;
  const drawStrokeColorSelectValue = strokeColors.some(
    (color) =>
      color !== "multi" &&
      color.toLowerCase() === selectedDrawStrokeColor.toLowerCase(),
  )
    ? selectedDrawStrokeColor
    : "multi";

  const selectedLineStrokeColor =
    getSharedValue(selectedLineElements, (element) => element.stroke) ??
    "multi";
  const selectedLineStrokePreviewColor =
    selectedLineStrokeColor === "multi"
      ? (selectedLineElements[0]?.stroke ?? scene.settings.shapeDefaults.lineStroke)
      : selectedLineStrokeColor;
  const lineStrokeColorSelectValue = strokeColors.some(
    (color) =>
      color !== "multi" &&
      color.toLowerCase() === selectedLineStrokeColor.toLowerCase(),
  )
    ? selectedLineStrokeColor
    : "multi";
  const selectedLineStrokeWidth = getClosestDrawStrokeOption(
    getSharedValue(selectedLineElements, (element) => element.strokeWidth) ??
      DRAW_STROKE_OPTIONS[1],
  );

  const openCustomDrawColorPicker = (initialColor: string) => {
    setCustomDrawColorPickerColor(parseColorForPicker(initialColor));
    setIsCustomDrawColorPickerOpen(true);
  };

  const renderDrawStrokeSelector = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <div
        ref={customDrawColorPickerWrapRef}
        style={{ position: "relative", display: "inline-flex" }}
      >
        <Select
          open={
            activeSelectId === "draw-stroke-color" ||
            isCustomDrawColorPickerOpen ||
            undefined
          }
          onOpenChange={(isOpen) => {
            if (isOpen) {
              setActiveSelectId("draw-stroke-color");
            } else if (activeSelectId === "draw-stroke-color") {
              setActiveSelectId(null);
            }
          }}
          value={String(drawStrokeColorSelectValue)}
          onValueChange={(value) => {
            if (value === "multi") {
              openCustomDrawColorPicker(selectedDrawStrokeColor);
              return;
            }

            setIsCustomDrawColorPickerOpen(false);
            setActiveSelectId(null);

            if (selectedDrawElements.length === 0) {
              onDrawDefaultStrokeColorChange(selectedDrawMode, value);
              return;
            }

            onDrawStrokeColorChange(
              selectedDrawElements.map((element) => element.id),
              value,
            );
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <SelectTrigger
                onPointerDown={(event) => {
                  if (drawStrokeColorSelectValue !== "multi") {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();
                  openCustomDrawColorPicker(selectedDrawStrokeColor);
                }}
                style={{ gap: "0px", width: "fit-content" }}
              >
                <span style={{ width: "0px", overflow: "hidden" }}>
                  <SelectValue
                    placeholder={localeMessages.selectionBar.strokeColor}
                  />
                </span>
                <div
                  style={{
                    width: "20px",
                    borderRadius: "100%",
                    border: "1px solid #ffffff20",
                    height: "20px",
                    background: uniColor(
                      selectedDrawStrokeColor || defaultDrawStrokeColor,
                    ),
                  }}
                />
              </SelectTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{localeMessages.selectionBar.strokeColor}</p>
            </TooltipContent>
          </Tooltip>
          <SelectContent
            position="popper"
            className={COLORSELECT_CONTENT}
          >
            <ColorSwatchPicker
              colors={strokeColors}
              currentColor={selectedDrawStrokeColor}
              uniColor={uniColor}
              renderItem={({ color, isMulti, swatch }) => (
                <SelectItem
                  key={color}
                  value={color}
                  className={COLORSELECT_ITEM}
                  check={false}
                  onPointerDown={
                    isMulti
                      ? (event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          openCustomDrawColorPicker(selectedDrawStrokeColor);
                        }
                      : undefined
                  }
                  onSelect={
                    isMulti
                      ? (event) => {
                          event.preventDefault();
                          openCustomDrawColorPicker(selectedDrawStrokeColor);
                        }
                      : undefined
                  }
                >
                  {swatch}
                </SelectItem>
              )}
            />
          </SelectContent>
        </Select>
      </div>

      <Tooltip open={isCustomDrawColorPickerOpen}>
        <TooltipTrigger asChild>
          <div className={SELECTIONBAR_SEPARATOR} />
        </TooltipTrigger>
        <TooltipContent
          className={CONTENT_COLOR}
          side="bottom"
          style={{ background: "transparent" }}
        >
          <div
            ref={customDrawColorPickerContentRef}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Chrome
              color={customDrawColorPickerColor}
              onChange={(color) => {
                const next = color.hexa || color.hex;
                if (next) {
                  setCustomDrawColorPickerColor(next);

                  if (selectedDrawElements.length === 0) {
                    onDrawDefaultStrokeColorChange(selectedDrawMode, next);
                    return;
                  }

                  onDrawStrokeColorChange(
                    selectedDrawElements.map((element) => element.id),
                    next,
                  );
                }
              }}
            />
          </div>
        </TooltipContent>
      </Tooltip>
      <Select
        open={activeSelectId === "draw-stroke-width"}
        onOpenChange={(isOpen) => {
          if (isOpen) {
            setActiveSelectId("draw-stroke-width");
          } else if (activeSelectId === "draw-stroke-width") {
            setActiveSelectId(null);
          }
        }}
        value={String(selectedDrawStrokeWidth)}
        onValueChange={(value) => {
          setActiveSelectId(null);
          onDrawStrokeWidthChange(
            selectedDrawElements.map((element) => element.id),
            Number(value),
          );
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <SelectTrigger
              className={DRAW_STROKE_TRIGGER}
              style={{ gap: "0px", width: "fit-content" }}
            >
              <span style={{ width: "0px", overflow: "hidden" }}>
                <SelectValue
                  placeholder={localeMessages.selectionBar.strokeWidth}
                />
              </span>
              <span className={DRAW_STROKE_OPTION_LINE_WRAP}>
                {renderDrawStrokePreview(
                  strokePreviews,
                  Math.max(
                    0,
                    strokeOptions.findIndex(
                      (option) => option === selectedDrawStrokeWidth,
                    ),
                  ),
                )}
              </span>
            </SelectTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{localeMessages.selectionBar.strokeWidth}</p>
          </TooltipContent>
        </Tooltip>
        <SelectContent position="popper">
          {strokeOptions.map((strokeWidth, index) => (
            <SelectItem
              key={strokeWidth}
              check={false}
              value={String(strokeWidth)}
              className={DRAW_STROKE_SELECT_ITEM}
            >
              <span className={DRAW_STROKE_OPTION_LINE_WRAP}>
                {renderDrawStrokePreview(strokePreviews, index)}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderLineStrokeColorSelector = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <div
        ref={customDrawColorPickerWrapRef}
        style={{ position: "relative", display: "inline-flex" }}
      >
        <Select
          open={
            activeSelectId === "line-stroke-color" ||
            isCustomDrawColorPickerOpen
          }
          onOpenChange={(isOpen) => {
            if (isOpen) {
              setActiveSelectId("line-stroke-color");
            } else if (activeSelectId === "line-stroke-color") {
              setActiveSelectId(null);
            }
          }}
          value={String(lineStrokeColorSelectValue)}
          onValueChange={(value) => {
            if (value === "multi") {
              openCustomDrawColorPicker(selectedLineStrokePreviewColor);
              return;
            }

            setIsCustomDrawColorPickerOpen(false);
            setActiveSelectId(null);
            onDrawStrokeColorChange(
              selectedLineElements.map((element) => element.id),
              value,
            );
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <SelectTrigger
                onPointerDown={(event) => {
                  if (lineStrokeColorSelectValue !== "multi") {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();
                  openCustomDrawColorPicker(selectedLineStrokePreviewColor);
                }}
                style={{ gap: "0px", width: "fit-content" }}
              >
                <span style={{ width: "0px", overflow: "hidden" }}>
                  <SelectValue
                    placeholder={localeMessages.selectionBar.strokeColor}
                  />
                </span>
                <div
                  style={{
                    width: "20px",
                    borderRadius: "100%",
                    border: "1px solid #ffffff20",
                    height: "20px",
                    background: uniColor(selectedLineStrokePreviewColor),
                  }}
                />
              </SelectTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{localeMessages.selectionBar.strokeColor}</p>
            </TooltipContent>
          </Tooltip>
          <SelectContent
            position="popper"
            className={COLORSELECT_CONTENT}
          >
            <ColorSwatchPicker
              colors={strokeColors}
              currentColor={selectedLineStrokePreviewColor}
              uniColor={uniColor}
              renderItem={({ color, isMulti, swatch }) => (
                <SelectItem
                  key={color}
                  value={color}
                  className={COLORSELECT_ITEM}
                  check={false}
                  onPointerDown={
                    isMulti
                      ? (event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          openCustomDrawColorPicker(
                            selectedLineStrokePreviewColor,
                          );
                        }
                      : undefined
                  }
                  onSelect={
                    isMulti
                      ? (event) => {
                          event.preventDefault();
                          openCustomDrawColorPicker(
                            selectedLineStrokePreviewColor,
                          );
                        }
                      : undefined
                  }
                >
                  {swatch}
                </SelectItem>
              )}
            />
          </SelectContent>
        </Select>
      </div>

      <Tooltip open={isCustomDrawColorPickerOpen}>
        <TooltipTrigger asChild>
          <div className={SELECTIONBAR_SEPARATOR} />
        </TooltipTrigger>
        <TooltipContent
          className={CONTENT_COLOR}
          side="bottom"
          style={{ background: "transparent" }}
        >
          <div
            ref={customDrawColorPickerContentRef}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Chrome
              color={customDrawColorPickerColor}
              onChange={(color) => {
                const next = color.hexa || color.hex;
                if (next) {
                  setCustomDrawColorPickerColor(next);
                  onDrawStrokeColorChange(
                    selectedLineElements.map((element) => element.id),
                    next,
                  );
                }
              }}
            />
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  const renderLineCapSelector = () => {
    const selectedStartCap = getSharedValue(
      selectedLineElements,
      (element) => element.startCap,
    );
    const selectedEndCap = getSharedValue(
      selectedLineElements,
      (element) => element.endCap,
    );

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Select
          open={activeSelectId === "line-start-cap"}
          onOpenChange={(isOpen) => {
            if (isOpen) {
              setActiveSelectId("line-start-cap");
            } else if (activeSelectId === "line-start-cap") {
              setActiveSelectId(null);
            }
          }}
          value={selectedStartCap || ""}
          onValueChange={(value) => {
            setActiveSelectId(null);
            onLineStartCapChange(
              selectedLineElements.map((element) => element.id),
              value as LineCap,
            );
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <SelectTrigger>
                <SelectValue placeholder="Start cap" />
              </SelectTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Line start cap</p>
            </TooltipContent>
          </Tooltip>
          <SelectContent position="popper">
            {LINE_STROKELINECAPS.map((name, i) => {
              const prev = LINE_STROKELINECAPS_PREVIEWS[i];
              return (
                <SelectItem
                  key={`${name}-${i}-start`}
                  className="flex w-fit! items-center! justify-center! py-2!"
                  check={false}
                  value={name}
                >
                  <svg
                    width={prev.width / 2}
                    viewBox={prev.viewBox}
                    fill="none"
                    className="scale-[0.8] -scale-x-100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d={prev.path}
                      strokeWidth={prev.strokeWidth}
                      strokeLinecap={prev.strokeLinecap}
                      fill={prev.fill}
                      stroke={prev.stroke}
                    />
                  </svg>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <div className={SELECTIONBAR_SEPARATOR} />

        <Select
          open={activeSelectId === "line-end-cap"}
          onOpenChange={(isOpen) => {
            if (isOpen) {
              setActiveSelectId("line-end-cap");
            } else if (activeSelectId === "line-end-cap") {
              setActiveSelectId(null);
            }
          }}
          value={selectedEndCap || ""}
          onValueChange={(value) => {
            setActiveSelectId(null);
            onLineEndCapChange(
              selectedLineElements.map((element) => element.id),
              value as LineCap,
            );
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <SelectTrigger>
                <SelectValue placeholder="End cap" />
              </SelectTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Line end cap</p>
            </TooltipContent>
          </Tooltip>
          <SelectContent position="popper">
            {LINE_STROKELINECAPS.map((name, i) => {
              const prev = LINE_STROKELINECAPS_PREVIEWS[i];
              return (
                <SelectItem
                  key={`${name}-${i}-end`}
                  className="flex w-fit! items-center! justify-center! py-2!"
                  check={false}
                  value={name}
                >
                  <svg
                    width={prev.width / 2}
                    viewBox={prev.viewBox}
                    fill="none"
                    className="scale-[0.8]"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d={prev.path}
                      strokeWidth={prev.strokeWidth}
                      strokeLinecap={prev.strokeLinecap}
                      fill={prev.fill}
                      stroke={prev.stroke}
                    />
                  </svg>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const renderLineStrokeWidthSelector = () => (
    <Select
      open={activeSelectId === "line-stroke-width"}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          setActiveSelectId("line-stroke-width");
        } else if (activeSelectId === "line-stroke-width") {
          setActiveSelectId(null);
        }
      }}
      value={String(selectedLineStrokeWidth)}
      onValueChange={(value) => {
        setActiveSelectId(null);
        onDrawStrokeWidthChange(
          selectedLineElements.map((element) => element.id),
          Number(value),
        );
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <SelectTrigger
            className={DRAW_STROKE_TRIGGER}
            style={{ gap: "0px", width: "fit-content" }}
          >
            <span style={{ width: "0px", overflow: "hidden" }}>
              <SelectValue
                placeholder={localeMessages.selectionBar.strokeWidth}
              />
            </span>
            <span className={DRAW_STROKE_OPTION_LINE_WRAP}>
              {renderDrawStrokePreview(
                DRAW_STROKE_PREVIEWS,
                Math.max(
                  0,
                  DRAW_STROKE_OPTIONS.findIndex(
                    (option) => option === selectedLineStrokeWidth,
                  ),
                ),
              )}
            </span>
          </SelectTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{localeMessages.selectionBar.strokeWidth}</p>
        </TooltipContent>
      </Tooltip>
      <SelectContent position="popper">
        {DRAW_STROKE_OPTIONS.map((strokeWidth, index) => (
          <SelectItem
            key={strokeWidth}
            check={false}
            value={String(strokeWidth)}
            className={DRAW_STROKE_SELECT_ITEM}
          >
            <span className={DRAW_STROKE_OPTION_LINE_WRAP}>
              {renderDrawStrokePreview(DRAW_STROKE_PREVIEWS, index)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (selectedIds.length > 1) {
    if (selectedDrawElements.length === selectedIds.length) {
      return renderDrawStrokeSelector();
    }

    return <></>;
  }

  if (selectedDrawElements.length > 0) {
    return renderDrawStrokeSelector();
  }

  if (selectedLineElements.length > 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {renderLineStrokeColorSelector()}
        {renderLineStrokeWidthSelector()}
        <div className={SELECTIONBAR_SEPARATOR} />
        {renderLineCapSelector()}
      </div>
    );
  }

  if (
    drawingTool === "draw" ||
    drawingTool === "marker" ||
    drawingTool === "quill"
  ) {
    return renderDrawStrokeSelector();
  }

  return <></>;
};

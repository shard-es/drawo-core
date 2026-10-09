import {
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import Chrome from "@uiw/react-color-chrome";
import { ColorSwatchPicker } from "@shared/ui/ColorSwatchPicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/tooltip";
import type { CircleElement, RectangleElement, SvgElement } from "@core/elements";
import type { Scene } from "@core/scene";
import type { LocaleMessages } from "@shared/i18n";
import { parseColorForPicker } from "@features/canvas/rendering/color";
import {
  getSelectedShapeElements,
  getSharedValue,
} from "@features/canvas/selection/selectionState";
import {
  DashedLine01Icon,
  HachureIcon,
  OctagonXIcon,
  SolidLine01Icon,
  SquareFilledIcon,
  SquareUnfilledIcon,
} from "@shared/ui/icons";

interface SelectionShapeControlsProps {
  scene: Scene;
  shapeColors: readonly [readonly string[], readonly string[]];
  selectedIds: string[];
  localeMessages: LocaleMessages;
  customDrawColorPickerWrapRef: RefObject<HTMLDivElement | null>;
  customDrawColorPickerContentRef: RefObject<HTMLDivElement | null>;
  customDrawColorPickerColor: string;
  setCustomDrawColorPickerColor: Dispatch<SetStateAction<string>>;
  onShapeFillColorChange: (ids: string[], fillColor: string) => void;
  onShapeFillStyleChange: (ids: string[], fillStyle: string) => void;
  onShapeStrokeColorChange: (ids: string[], strokeColor: string) => void;
  onShapeStrokeWidthChange: (ids: string[], strokeWidth: number) => void;
  onShapeStrokeStyleChange: (
    ids: string[],
    strokeStyle: "solid" | "dashed" | "none",
  ) => void;
  uniColor: (color: string) => string;
  activeSelectId: string | null;
  setActiveSelectId: (id: string | null) => void;
}

type PickerMode = "fill" | "stroke" | null;

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

/* The fill/stroke-style radio row that heads each colour dropdown. */
const COLORSTYLE_CONTAINER = "flex";

/* One fill/stroke-style option. Selected state is applied as a background via
 * the `bg-[rgba(var(--accent-rgb),0.5)]` utility in the JSX below, matching the
 * accent tint of `.drawo-colorstyle-optionitem.active`. The inner span (radix
 * `ItemText`, plus the check indicator) was laid out by
 * `.drawo-colorstyle-container .drawo-colorstyle-optionitem span`. */
const COLORSTYLE_OPTION_ITEM = "[&_span]:flex [&_span]:items-center [&_span]:gap-1.5";

/* Hairline under the style row inside a colour dropdown. */
const COLORSTYLE_SEPARATOR =
  "mx-auto my-0.5 mt-2 h-px w-[95%] border-none bg-[rgba(var(--text-rgb),0.2)]";

/* The swatch grid that heads the fill dropdown. `.drawo-bigcolorpicker` used to
 * be `padding: 12px 8px 8px` + flex column, centered both ways. */
const BIGCOLORPICKER = "flex flex-col items-center justify-center px-2 pb-2 pt-3";
/* Each row div inside it was `display:flex; align-items:center;
 * justify-content:center`, and every descendant had its padding zeroed
 * (`padding: 0 !important`) — reproduced with a descendant selector. */
const BIGCOLORPICKER_ROW = "flex items-center justify-center [&_*]:p-0!";

/* The fill/stroke colour pickers are hosted in tooltips, so they must drop the
 * tooltip shadow and shift down clear of the toolbar. Both rules were
 * `!important` because they compete with `.drawo-tooltip-content` on the same
 * element; the two slots sit at different offsets. */
const CONTENT_COLOR_ULTRA_1 =
  "[box-shadow:none]! [transform:translateY(138px)_translateX(18px)]!";
const CONTENT_COLOR_ULTRA_2 =
  "[box-shadow:none]! [transform:translateY(145px)_translateX(26px)]!";

export const SelectionShapeControls = ({
  scene,
  shapeColors,
  selectedIds,
  localeMessages,
  customDrawColorPickerWrapRef,
  customDrawColorPickerContentRef,
  customDrawColorPickerColor,
  setCustomDrawColorPickerColor,
  onShapeFillColorChange,
  onShapeFillStyleChange,
  onShapeStrokeColorChange,
  onShapeStrokeWidthChange: _onShapeStrokeWidthChange,
  onShapeStrokeStyleChange,
  uniColor,
  activeSelectId,
  setActiveSelectId,
}: SelectionShapeControlsProps) => {
  const selectedShapeElements = getSelectedShapeElements(
    scene.elements,
    selectedIds,
  ) as Array<RectangleElement | CircleElement | SvgElement>;
  const selectedShapeIds = selectedShapeElements.map((element) => element.id);

  const sharedFillColor =
    getSharedValue(selectedShapeElements, (element) => element.fill) ?? "multi";
  const selectedFillPreviewColor =
    sharedFillColor === "multi"
      ? (selectedShapeElements[0]?.fill ?? scene.settings.shapeDefaults.fill)
      : sharedFillColor;
  const fillStyleSelectValue =
    getSharedValue(selectedShapeElements, (element) => element.fillStyle) ??
    "solid";
  const fillPalette = [...shapeColors[0], ...shapeColors[1]];
  const fillColorSelectValue = fillPalette.some(
    (color) =>
      color !== "multi" &&
      color.toLowerCase() === selectedFillPreviewColor.toLowerCase(),
  )
    ? selectedFillPreviewColor
    : "multi";
  const isSharedFillPresetColor = fillPalette.some(
    (color) =>
      color !== "multi" &&
      color.toLowerCase() === selectedFillPreviewColor.toLowerCase(),
  );

  const sharedStrokeColor =
    getSharedValue(selectedShapeElements, (element) => element.stroke) ??
    "multi";
  const selectedStrokePreviewColor =
    sharedStrokeColor === "multi"
      ? (selectedShapeElements[0]?.stroke ??
        scene.settings.shapeDefaults.stroke)
      : sharedStrokeColor;
  const strokeColorSelectValue = fillPalette.some(
    (color) =>
      color !== "multi" &&
      color.toLowerCase() === selectedStrokePreviewColor.toLowerCase(),
  )
    ? selectedStrokePreviewColor
    : "multi";
  const sharedStrokeStyle = getSharedValue(
    selectedShapeElements,
    (element) => element.strokeStyle,
  );
  const strokeStyleSelectValue =
    sharedStrokeStyle === "solid" ||
    sharedStrokeStyle === "dashed" ||
    sharedStrokeStyle === "none"
      ? sharedStrokeStyle
      : "solid";
  const isSharedStrokePresetColor = fillPalette.some(
    (color) =>
      color !== "multi" &&
      color.toLowerCase() === selectedStrokePreviewColor.toLowerCase(),
  );

  const keepFillSelectOpenOnNextCloseRef = useRef(false);
  const keepStrokeSelectOpenOnNextCloseRef = useRef(false);
  const [forcedCustomPickerMode, setForcedCustomPickerMode] =
    useState<PickerMode>(null);

  const openCustomColorPicker = (mode: Exclude<PickerMode, null>) => {
    const initialColor =
      mode === "fill" ? selectedFillPreviewColor : selectedStrokePreviewColor;

    setForcedCustomPickerMode(mode);
    setActiveSelectId(
      mode === "fill" ? "shape-fill-color" : "shape-stroke-color",
    );
    setCustomDrawColorPickerColor(parseColorForPicker(initialColor));
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <div
        ref={customDrawColorPickerWrapRef}
        style={{ position: "relative", display: "inline-flex" }}
      >
        <Select
          open={activeSelectId === "shape-fill-color"}
          onOpenChange={(isOpen) => {
            if (isOpen) {
              setForcedCustomPickerMode(null);
              setActiveSelectId("shape-fill-color");
              return;
            }

            if (keepFillSelectOpenOnNextCloseRef.current) {
              keepFillSelectOpenOnNextCloseRef.current = false;
              return;
            }

            if (forcedCustomPickerMode === "fill") {
              setForcedCustomPickerMode(null);
            }

            setActiveSelectId(null);
          }}
          value={String(fillColorSelectValue)}
          onValueChange={(value) => {
            if (["solid", "hachure", "none"].includes(value)) {
              onShapeFillStyleChange(selectedShapeIds, value);
              return;
            }

            if (value === "multi") {
              openCustomColorPicker("fill");
              return;
            }

            setActiveSelectId(null);
            onShapeFillColorChange(selectedShapeIds, value);
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <SelectTrigger
                className={SELECT_TRIGGER}
                onPointerDown={(event) => {
                  if (fillColorSelectValue !== "multi") {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();
                  openCustomColorPicker("fill");
                }}
                style={{ gap: "0px", width: "fit-content" }}
              >
                <span style={{ width: "0px", overflow: "hidden" }}>
                  <SelectValue
                    placeholder={localeMessages.selectionBar.fillColor}
                  />
                </span>
                <div
                  style={{
                    width: "20px",
                    borderRadius: "100%",
                    border: "1px solid #ffffff20",
                    height: "20px",
                    background: uniColor(selectedFillPreviewColor),
                  }}
                />
              </SelectTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{localeMessages.selectionBar.fillColor}</p>
            </TooltipContent>
          </Tooltip>
          <SelectContent
            position="popper"
            className={COLORSELECT_CONTENT}
          >
            <div className={COLORSTYLE_CONTAINER}>
              <SelectItem
                className={
                  COLORSTYLE_OPTION_ITEM +
                  (fillStyleSelectValue === "solid" ? " bg-[rgba(var(--accent-rgb),0.5)]" : "")
                }
                value="solid"
              >
                <SquareFilledIcon /> Relleno
              </SelectItem>
              <SelectItem
                className={
                  COLORSTYLE_OPTION_ITEM +
                  (fillStyleSelectValue === "hachure" ? " bg-[rgba(var(--accent-rgb),0.5)]" : "")
                }
                value="hachure"
              >
                <HachureIcon /> Hachure
              </SelectItem>
              <SelectItem
                className={
                  COLORSTYLE_OPTION_ITEM +
                  (fillStyleSelectValue === "none" ? " bg-[rgba(var(--accent-rgb),0.5)]" : "")
                }
                value="none"
              >
                <SquareUnfilledIcon /> Sin relleno
              </SelectItem>
            </div>
            <hr className={COLORSTYLE_SEPARATOR} />
            <div
              className={BIGCOLORPICKER}
              data-disabled={fillStyleSelectValue === "none" ? "" : undefined}
            >
              <div className={BIGCOLORPICKER_ROW}>
                <ColorSwatchPicker
                  colors={shapeColors[0]}
                  currentColor={selectedFillPreviewColor}
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
                              keepFillSelectOpenOnNextCloseRef.current = true;
                              openCustomColorPicker("fill");
                            }
                          : undefined
                      }
                      onSelect={
                        isMulti
                          ? (event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              keepFillSelectOpenOnNextCloseRef.current = true;
                              openCustomColorPicker("fill");
                            }
                          : undefined
                      }
                    >
                      {swatch}
                    </SelectItem>
                  )}
                />
              </div>
              <div className={BIGCOLORPICKER_ROW}>
                <ColorSwatchPicker
                  colors={shapeColors[1]}
                  realTotalColors={fillPalette}
                  currentColor={selectedFillPreviewColor}
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
                              keepFillSelectOpenOnNextCloseRef.current = true;
                              openCustomColorPicker("fill");
                            }
                          : undefined
                      }
                      onSelect={
                        isMulti
                          ? (event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              keepFillSelectOpenOnNextCloseRef.current = true;
                              openCustomColorPicker("fill");
                            }
                          : undefined
                      }
                    >
                      {swatch}
                    </SelectItem>
                  )}
                />
              </div>
            </div>
          </SelectContent>
        </Select>
      </div>

      <Tooltip
        open={
          activeSelectId === "shape-fill-color" &&
          (forcedCustomPickerMode === "fill" || !isSharedFillPresetColor)
        }
      >
        <TooltipTrigger asChild>
          <div className={SELECTIONBAR_SEPARATOR} />
        </TooltipTrigger>
        <TooltipContent
          className={CONTENT_COLOR_ULTRA_1}
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
                if (!next) {
                  return;
                }

                setCustomDrawColorPickerColor(next);
                onShapeFillColorChange(selectedShapeIds, next);
              }}
            />
          </div>
        </TooltipContent>
      </Tooltip>

      <Select
        open={activeSelectId === "shape-stroke-color"}
        onOpenChange={(isOpen) => {
          if (isOpen) {
            setForcedCustomPickerMode(null);
            setActiveSelectId("shape-stroke-color");
            return;
          }

          if (keepStrokeSelectOpenOnNextCloseRef.current) {
            keepStrokeSelectOpenOnNextCloseRef.current = false;
            return;
          }

          if (forcedCustomPickerMode === "stroke") {
            setForcedCustomPickerMode(null);
          }

          setActiveSelectId(null);
        }}
        value={String(strokeColorSelectValue)}
        onValueChange={(value) => {
          if (["solid", "dashed", "none"].includes(value)) {
            onShapeStrokeStyleChange(
              selectedShapeIds,
              value as "solid" | "dashed" | "none",
            );
            return;
          }

          if (value === "multi") {
            openCustomColorPicker("stroke");
            return;
          }

          setActiveSelectId(null);
          onShapeStrokeColorChange(selectedShapeIds, value);
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <SelectTrigger
              className={SELECT_TRIGGER}
              onPointerDown={(event) => {
                if (strokeColorSelectValue !== "multi") {
                  return;
                }

                event.preventDefault();
                event.stopPropagation();
                openCustomColorPicker("stroke");
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
                  borderRadius: "3px",
                  border: "2px solid " + uniColor(selectedStrokePreviewColor),
                  height: "20px",
                  background: "transparent",
                }}
              />
            </SelectTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{localeMessages.selectionBar.strokeColor}</p>
          </TooltipContent>
        </Tooltip>
        <SelectContent position="popper" className={COLORSELECT_CONTENT}>
          <div className={COLORSTYLE_CONTAINER}>
            <SelectItem
              className={
                COLORSTYLE_OPTION_ITEM +
                (strokeStyleSelectValue === "solid" ? " bg-[rgba(var(--accent-rgb),0.5)]" : "")
              }
              value="solid"
            >
              <SolidLine01Icon /> Sólido
            </SelectItem>
            <SelectItem
              className={
                COLORSTYLE_OPTION_ITEM +
                (strokeStyleSelectValue === "dashed" ? " bg-[rgba(var(--accent-rgb),0.5)]" : "")
              }
              value="dashed"
            >
              <DashedLine01Icon /> Discontinuo
            </SelectItem>
            <SelectItem
              className={
                COLORSTYLE_OPTION_ITEM +
                (strokeStyleSelectValue === "none" ? " bg-[rgba(var(--accent-rgb),0.5)]" : "")
              }
              value="none"
            >
              <OctagonXIcon /> Ninguno
            </SelectItem>
          </div>
          <hr className={COLORSTYLE_SEPARATOR} />
          <div>
            <ColorSwatchPicker
              colors={shapeColors[0]}
              currentColor={selectedStrokePreviewColor}
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
                          keepStrokeSelectOpenOnNextCloseRef.current = true;
                          openCustomColorPicker("stroke");
                        }
                      : undefined
                  }
                  onSelect={
                    isMulti
                      ? (event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          keepStrokeSelectOpenOnNextCloseRef.current = true;
                          openCustomColorPicker("stroke");
                        }
                      : undefined
                  }
                >
                  {swatch}
                </SelectItem>
              )}
            />
          </div>
          <div>
            <ColorSwatchPicker
              colors={shapeColors[1]}
              realTotalColors={fillPalette}
              currentColor={selectedStrokePreviewColor}
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
                          keepStrokeSelectOpenOnNextCloseRef.current = true;
                          openCustomColorPicker("stroke");
                        }
                      : undefined
                  }
                  onSelect={
                    isMulti
                      ? (event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          keepStrokeSelectOpenOnNextCloseRef.current = true;
                          openCustomColorPicker("stroke");
                        }
                      : undefined
                  }
                >
                  {swatch}
                </SelectItem>
              )}
            />
          </div>
        </SelectContent>
      </Select>

      <Tooltip
        open={
          activeSelectId === "shape-stroke-color" &&
          (forcedCustomPickerMode === "stroke" || !isSharedStrokePresetColor)
        }
      >
        <TooltipTrigger asChild>
          <div />
        </TooltipTrigger>
        <TooltipContent
          className={CONTENT_COLOR_ULTRA_2}
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
                if (!next) {
                  return;
                }

                setCustomDrawColorPickerColor(next);
                onShapeStrokeColorChange(selectedShapeIds, next);
              }}
            />
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

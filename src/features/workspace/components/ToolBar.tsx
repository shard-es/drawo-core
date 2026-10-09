import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { NewElementType } from "@core/scene";
import type { LocaleMessages } from "@shared/i18n";
import { MapArrowUp, Pen, Text } from "@solar-icons/react";
import {
  ArrowRightLinear,
  GalleryLinear,
  GrabHandLinear,
  LaserIcon,
  SquareLinear,
} from "@shared/ui/icons";
import { Circle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/tooltip";
import { MarkerIcon, PenIcon, QuillIcon } from "./Draw/icons";
import { invertLightnessPreservingHue } from "@features/canvas/rendering/color";
import Chrome from "@uiw/react-color-chrome";
import {
  DRAW_STROKE_OPTIONS,
  DRAW_STROKE_PREVIEWS,
  MARKER_STROKE_OPTIONS,
  MARKER_STROKE_PREVIEWS,
} from "@features/canvas/rendering/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@shared/ui/select";
import { ColorSwatchPicker } from "@shared/ui/ColorSwatchPicker";

interface ToolBarProps {
  interactionMode: "select" | "pan";
  drawingTool: NewElementType | "laser" | null;
  isPresentationMode: boolean;
  messages: LocaleMessages;
  setInteractionMode: Dispatch<SetStateAction<"select" | "pan">>;
  setDrawingTool: Dispatch<SetStateAction<NewElementType | "laser" | null>>;
  drawDefaults: {
    drawStroke: string;
    markerStroke: string;
    quillStroke: string;
    drawStrokeWidth: number;
    markerStrokeWidth: number;
    quillStrokeWidth: number;
  };
  invertPaletteInDarkMode: boolean;
  strokeColors: readonly string[];
  onDrawDefaultStrokeColorChange: (
    drawMode: "draw" | "marker" | "quill",
    strokeColor: string,
  ) => void;
  onDrawDefaultStrokeWidthChange: (
    drawMode: "draw" | "marker" | "quill",
    strokeWidth: number,
  ) => void;
  onSelectImageFiles: (files: File[]) => void;
}

const TOOL_ITEM_BASE_CLASS =
  "flex h-10 w-10 cursor-[var(--drawo-cursor-pointer),auto] items-center justify-center rounded-[10px] border-none bg-transparent p-[10px] text-[13px] font-medium text-black shadow-none outline-none transition-[0.1s] hover:bg-[rgba(var(--text-rgb),0.1)] dark:text-[#e5e7eb] [&_svg]:size-5";

const TOOL_ITEM_ACTIVE_CLASS =
  "bg-(--accent) text-white dark:bg-(--accent-dark)";

const toolItemClass = (active: boolean) =>
  TOOL_ITEM_BASE_CLASS + (active ? " " + TOOL_ITEM_ACTIVE_CLASS : "");

const TOOL_SEPARATOR_CLASS =
  "mx-1 my-auto h-5 w-px border-l border-[rgb(var(--text-rgb))] opacity-30";

const STROKE_PREVIEW_WRAP_CLASS =
  "flex items-center justify-center [&_svg]:h-auto [&_svg]:w-[180px]";

export const ToolBar = ({
  interactionMode,
  drawingTool,
  isPresentationMode,
  messages,
  setInteractionMode,
  setDrawingTool,
  drawDefaults,
  invertPaletteInDarkMode,
  strokeColors,
  onDrawDefaultStrokeColorChange,
  onDrawDefaultStrokeWidthChange,
  onSelectImageFiles,
}: ToolBarProps) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const setInteractionModeSafely = (mode: "select" | "pan") => {
    if (isPresentationMode && mode !== "pan") {
      return;
    }

    setInteractionMode(mode);
  };
  const setDrawingToolSafely = (tool: NewElementType | "laser" | null) => {
    if (isPresentationMode) {
      return;
    }

    setDrawingTool(tool);
  };
  const getActiveDrawMode = () =>
    drawingTool === "marker"
      ? "marker"
      : drawingTool === "quill"
        ? "quill"
        : "draw";

  const [colorPickerColor, setColorPickerColor] = useState(
    drawingTool === "marker"
      ? drawDefaults.markerStroke
      : drawingTool === "quill"
        ? drawDefaults.quillStroke
        : drawDefaults.drawStroke,
  );

  const strokeOptions =
    drawingTool === "marker" ? MARKER_STROKE_OPTIONS : DRAW_STROKE_OPTIONS;
  const strokePreviews =
    drawingTool === "marker" ? MARKER_STROKE_PREVIEWS : DRAW_STROKE_PREVIEWS;

  const uniColor = (color: string) =>
    invertPaletteInDarkMode
      ? invertLightnessPreservingHue(color)
      : color;

  const currentColor =
    drawingTool === "marker"
      ? drawDefaults.markerStroke
      : drawingTool === "quill"
        ? drawDefaults.quillStroke
        : drawDefaults.drawStroke;

  useEffect(() => {
    setColorPickerColor(currentColor);
  }, [currentColor]);

  const handleColorChange = (color: { hexa?: string; hex?: string }) => {
    const next = color.hexa || color.hex;
    if (next) {
      setColorPickerColor(next);
      const drawMode = getActiveDrawMode();
      onDrawDefaultStrokeColorChange(drawMode, next);
    }
  };

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

  const drawTools = ["draw", "marker", "quill"];
  return (
    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-px rounded-[15px] border border-(--panel-border) bg-(--panel-bg) p-2 shadow-(--panel-shadow) backdrop-blur-3xl [corner-shape:squircle] [.drawo-presentation-mode_&]:translate-y-[200%]">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []).filter((file) =>
            file.type.startsWith("image/"),
          );

          if (files.length > 0) {
            onSelectImageFiles(files);
          }

          event.currentTarget.value = "";
        }}
      />
      {drawTools.includes(drawingTool) ? (
        <div className="absolute bottom-full left-1/2 z-10 flex -translate-x-1/2 -translate-y-2 items-center gap-px rounded-[15px] border border-(--panel-border) bg-(--panel-bg) p-1 shadow-(--panel-shadow) backdrop-blur-3xl [corner-shape:squircle]">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={`${toolItemClass(drawingTool === "draw")} group overflow-hidden`}
                onClick={() => {
                  setInteractionModeSafely("select");
                  setDrawingToolSafely("draw");
                  setIsColorPickerOpen(false);
                }}
              >
                <PenIcon
                  color={uniColor(drawDefaults.drawStroke)}
                  className="scale-[2] translate-y-[2px] transition-[0.1s] group-hover:translate-y-0"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{messages.toolNames.pen}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={`${toolItemClass(drawingTool === "quill")} group overflow-hidden`}
                onClick={() => {
                  setInteractionModeSafely("select");
                  setDrawingToolSafely("quill");
                  setIsColorPickerOpen(false);
                }}
              >
                <QuillIcon
                  color={uniColor(drawDefaults.quillStroke)}
                  className="scale-[2] translate-y-[2px] transition-[0.1s] group-hover:translate-y-0"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{messages.toolNames.quill}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={`${toolItemClass(drawingTool === "marker")} group overflow-hidden`}
                onClick={() => {
                  setInteractionModeSafely("select");
                  setDrawingToolSafely("marker");
                  setIsColorPickerOpen(false);
                }}
              >
                <MarkerIcon
                  color={uniColor(drawDefaults.markerStroke)}
                  className="scale-[2] translate-y-[2px] transition-[0.1s] group-hover:translate-y-0"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{messages.toolNames.marker}</p>
            </TooltipContent>
          </Tooltip>
          <div className={TOOL_SEPARATOR_CLASS} />
          <ColorSwatchPicker
            colors={strokeColors}
            currentColor={currentColor}
            uniColor={uniColor}
            renderItem={({ color, swatch }) => (
              <div
                key={color}
                className="float-left w-fit shrink-0 rounded-full bg-transparent p-[4px_1px]! transition-[0.1s] hover:scale-105"
                onClick={() => {
                  if (color === "multi") {
                    setIsColorPickerOpen((current) => !current);
                    return;
                  }

                  setIsColorPickerOpen(false);
                  handleColorChange({
                    hex: color,
                  });
                }}
              >
                {swatch}
              </div>
            )}
          />

          <Tooltip open={isColorPickerOpen}>
            <TooltipTrigger asChild>
              <span style={{ opacity: 0 }}>.</span>
            </TooltipTrigger>
            <TooltipContent
              className="drawo-content-color inferior shadow-none ![transform:translateY(-20px)]"
              side="bottom"
              style={{ background: "transparent", padding: 0 }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <Chrome color={colorPickerColor} onChange={handleColorChange} />
            </TooltipContent>
          </Tooltip>

          <div className={TOOL_SEPARATOR_CLASS} />

          <Select
            value={String(
              drawingTool === "marker"
                ? drawDefaults.markerStrokeWidth
                : drawingTool === "quill"
                  ? drawDefaults.quillStrokeWidth
                  : drawDefaults.drawStrokeWidth,
            )}
            onValueChange={(value) => {
              const drawMode = getActiveDrawMode();
              onDrawDefaultStrokeWidthChange(drawMode, Number(value));
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <SelectTrigger
                  noArrow
                  className="flex h-10 w-[94.7px] cursor-[var(--drawo-cursor-pointer),auto] items-center justify-center gap-0 rounded-[24px] border-none bg-transparent p-3 text-current shadow-none outline-none transition-[0.1s] hover:bg-[rgba(var(--text-rgb),0.1)] [corner-shape:squircle]"
                >
                  <span className={`${STROKE_PREVIEW_WRAP_CLASS} [&_svg]:[transform:scaleX(0.4)_translateX(-76%)]`}>
                    {(() => {
                      const currentWidth =
                        drawingTool === "marker"
                          ? drawDefaults.markerStrokeWidth
                          : drawingTool === "quill"
                            ? drawDefaults.quillStrokeWidth
                            : drawDefaults.drawStrokeWidth;
                      const index = Math.max(
                        0,
                        strokeOptions.findIndex(
                          (option) => option === currentWidth,
                        ),
                      );
                      return renderDrawStrokePreview(strokePreviews, index);
                    })()}
                  </span>
                </SelectTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{messages.selectionBar?.strokeWidth || "Stroke Width"}</p>
              </TooltipContent>
            </Tooltip>
            <SelectContent position="popper">
              {strokeOptions.map((strokeWidth, index) => (
                <SelectItem
                  key={strokeWidth}
                  check={false}
                  value={String(strokeWidth)}
                  className="flex p-[7px_8px]! [&_*]:w-full"
                >
                  <span className={STROKE_PREVIEW_WRAP_CLASS}>
                    {renderDrawStrokePreview(strokePreviews, index)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <></>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={toolItemClass(interactionMode === "select" && !drawingTool)}
            onClick={() => {
              setInteractionModeSafely("select");
              setDrawingToolSafely(null);
            }}
          >
            <MapArrowUp
              style={{
                transform: "translateY(-2px) translateX(-3px) rotate(-46deg)",
              }}
              strokeWidth={0.1}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{messages.toolNames.selection}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={toolItemClass(interactionMode === "pan")}
            onClick={() => {
              setInteractionModeSafely("pan");
              setDrawingToolSafely(null);
            }}
          >
            <GrabHandLinear />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{messages.toolNames.pan}</p>
        </TooltipContent>
      </Tooltip>

      <div className={TOOL_SEPARATOR_CLASS} />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={toolItemClass(drawingTool === "text")}
            onClick={() => {
              setInteractionModeSafely("select");
              setDrawingToolSafely("text");
            }}
          >
            <Text strokeWidth={0.1} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{messages.toolNames.text}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={toolItemClass(drawingTool === "rectangle")}
            onClick={() => {
              setInteractionModeSafely("select");
              setDrawingToolSafely("rectangle");
            }}
          >
            <SquareLinear />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{messages.toolNames.rectangle}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={toolItemClass(drawingTool === "circle")}
            onClick={() => {
              setInteractionModeSafely("select");
              setDrawingToolSafely("circle");
            }}
          >
            <Circle strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{messages.toolNames.ellipse}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={toolItemClass(drawingTool === "line")}
            onClick={() => {
              setInteractionModeSafely("select");
              setDrawingToolSafely("line");
            }}
          >
            <ArrowRightLinear style={{ scale: "1.2" }} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{messages.toolNames.line}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={toolItemClass(drawTools.includes(drawingTool))}
            onClick={() => {
              setInteractionModeSafely("select");
              setDrawingToolSafely("draw");
            }}
          >
            <Pen strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{messages.toolNames.draw}</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={TOOL_ITEM_BASE_CLASS}
            onClick={() => {
              setInteractionModeSafely("select");
              setDrawingToolSafely(null);
              imageInputRef.current?.click();
            }}
          >
            <GalleryLinear />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{messages.toolNames.image}</p>
        </TooltipContent>
      </Tooltip>

      <div className={TOOL_SEPARATOR_CLASS} />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={toolItemClass(drawingTool === "laser")}
            onClick={() => {
              setInteractionModeSafely("select");
              setDrawingToolSafely("laser");
            }}
          >
            <LaserIcon strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{messages.toolNames.laser}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

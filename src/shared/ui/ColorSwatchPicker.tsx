import type { ReactNode } from "react";
import { Check } from "lucide-react";
import {
  MultiColorGradient,
  isDark,
  parseColor,
} from "@features/canvas/rendering/color";

const SWATCH_CONTAINER_CLASS =
  "flex size-7 items-center justify-center rounded-full border-0 border-solid p-0 duration-[0.1s] data-[current=true]:border-2";

/* The swatch dot falls back to 18px but honours a `--size` coming from an
   ancestor: the laser pointer dialog sets `--size: 32px` on every descendant
   (which is what used to drive `.colorswatch-dialog * { --size: 32px }`).
   A multi swatch is always 20px, `!important` included, as before. */
const SWATCH_CHILD_CLASS =
  "flex size-[var(--size,18px)] min-w-[var(--size,18px)] max-w-[var(--size,18px)] min-h-[var(--size,18px)] max-h-[var(--size,18px)] items-center justify-center rounded-full border border-(--panel-border) shadow-[var(--panel-shadow)] data-[multi=true]:[--size:20px]! data-[multi=true]:border-none! data-[dark=false]:border-[rgba(0,0,0,0.2)] data-[dark=true]:border-[rgba(255,255,255,0.1)] [&_svg]:scale-0 [&_svg]:duration-[0.1s] [&_svg_*]:stroke-[5] [&[data-current=true]:not([data-multi=true]):not([data-dark=true])_svg]:[scale:0.45] [&[data-current=true]:not([data-multi=true]):not([data-dark=true])_svg]:text-black [&[data-current=true][data-dark=true]_svg]:text-white";

interface RenderColorSwatchItemArgs {
  color: string;
  isCurrent: boolean;
  isMulti: boolean;
  swatch: ReactNode;
}

interface ColorSwatchPickerProps {
  colors: readonly string[];
  currentColor: string;
  uniColor: (color: string) => string;
  realTotalColors?: readonly string[];
  renderItem: (args: RenderColorSwatchItemArgs) => ReactNode;
}

export const ColorSwatchPicker = ({
  colors,
  currentColor,
  uniColor,
  realTotalColors = undefined,
  renderItem,
}: ColorSwatchPickerProps) => {
  const normalizedCurrentColor = currentColor.toLowerCase();
  const isPresetCurrentColor = (realTotalColors || colors).some(
    (color) =>
      color !== "multi" && color.toLowerCase() === normalizedCurrentColor,
  );

  return (
    <>
      {colors.map((color) => {
        const isMulti = color === "multi";
        const isCurrent =
          color.toLowerCase() === normalizedCurrentColor ||
          (isMulti && !isPresetCurrentColor);
        const resolvedColor = uniColor(isMulti ? currentColor : color);
        const parsedColor = parseColor(resolvedColor ?? "#000000");

        return renderItem({
          color,
          isCurrent,
          isMulti,
          swatch: (
            <div
              className={SWATCH_CONTAINER_CLASS}
              data-slot="color-swatch-container"
              data-multi={isMulti ? "true" : "false"}
              data-current={isCurrent ? "true" : "false"}
              style={{ borderColor: resolvedColor }}
            >
              <div
                className={SWATCH_CHILD_CLASS}
                data-slot="color-swatch-dot"
                data-multi={isMulti ? "true" : "false"}
                data-current={isCurrent ? "true" : "false"}
                data-dark={
                  parsedColor && isDark(parsedColor) ? "true" : "false"
                }
                style={{
                  background: isMulti ? MultiColorGradient : resolvedColor,
                }}
              >
                <Check />
              </div>
            </div>
          ),
        });
      })}
    </>
  );
};

"use client";
import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";

/* `.drawo-contextmenu-opacity-slider` is applied by consumers (the canvas
   context menu opacity control) on the root, so the track/thumb sizing it used
   to get from App.css is preserved here through ancestor variants. */
const SLIDER_TRACK_OPACITY_SLIDER_CLASS =
  "[.drawo-contextmenu-opacity-slider_&]:h-4!";

const SLIDER_THUMB_OPACITY_SLIDER_CLASS =
  "[.drawo-contextmenu-opacity-slider_&]:w-5 [.drawo-contextmenu-opacity-slider_&]:h-4 [.drawo-contextmenu-opacity-slider_&]:before:w-4 [.drawo-contextmenu-opacity-slider_&]:before:h-2.5";

const SLIDER_ROOT_CLASS =
  "group relative flex w-full items-center touch-none select-none duration-[0s]! [&_*]:duration-[0s]! data-[disabled]:opacity-50 data-[orientation=vertical]:flex-col data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto";

const SLIDER_TRACK_CLASS =
  "relative h-5 w-full grow overflow-hidden rounded-full bg-[rgb(var(--muted-rgb,229,231,235))] dark:bg-[rgba(255,255,255,0.08)] group-data-[orientation=vertical]:h-full group-data-[orientation=vertical]:w-5";

const SLIDER_RANGE_CLASS =
  "absolute bg-(--accent) group-data-[orientation=horizontal]:h-full group-data-[orientation=vertical]:w-full data-[right=true]:[transform:translateX(-2%)] data-[left=true]:[transform:translateX(5px)] data-[left=true]:after:absolute data-[left=true]:after:left-[-6px] data-[left=true]:after:top-0 data-[left=true]:after:h-full data-[left=true]:after:w-6 data-[left=true]:after:bg-(--accent)";

const SLIDER_THUMB_CLASS =
  "relative block h-5 w-7 cursor-grab rounded-full border-2 border-(--accent) bg-(--accent) outline-none dark:bg-white disabled:pointer-events-none disabled:opacity-50 active:cursor-grabbing active:scale-90 active:shadow-[0_0_0_1px_var(--accent)] before:absolute before:left-1/2 before:top-1/2 before:h-4 before:w-6 before:rounded-full before:bg-white before:[transform:translate(-50%,-50%)] before:[transform-origin:center_center] before:z-[500] before:transition-all! before:duration-[0.1s]! after:absolute after:inset-[-8px]";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={SLIDER_ROOT_CLASS + (className ? " " + className : "")}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={
          SLIDER_TRACK_CLASS + " " + SLIDER_TRACK_OPACITY_SLIDER_CLASS
        }
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          data-left={(value || defaultValue || [0])[0] < max / 2}
          data-right={(value || defaultValue || [0])[0] > max / 2}
          className={SLIDER_RANGE_CLASS}
        />
      </SliderPrimitive.Track>

      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={
            SLIDER_THUMB_CLASS + " " + SLIDER_THUMB_OPACITY_SLIDER_CLASS
          }
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };

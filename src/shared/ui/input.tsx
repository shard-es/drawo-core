import { Minus, Plus } from "lucide-react";
import * as React from "react";

const INPUT_CLASS =
  "w-full min-w-0 rounded-lg border border-(--panel-border) bg-[rgba(var(--text-rgb),0.1)] px-2.5 py-2 text-sm text-current outline-none transition-[border-color,box-shadow,background] duration-[120ms] ease placeholder:text-[rgba(var(--text-rgb),0.5)] [&[aria-invalid=true]]:border-[#ef4444] [&[aria-invalid=true]]:shadow-[0_0_0_3px_rgba(239,68,68,0.15)] dark:[&[aria-invalid=true]]:shadow-[0_0_0_3px_rgba(239,68,68,0.25)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:disabled:bg-[rgba(255,255,255,0.06)] file:mr-2 file:h-6 file:border-none file:bg-transparent file:text-[13px] file:font-medium file:cursor-pointer";

const NUMBERINPUT_CONTAINER_CLASS =
  "flex h-[var(--size)] items-center overflow-hidden rounded-lg border border-(--panel-border) [--size:32px] [&_svg]:size-3! [&_svg_*]:stroke-2";

const NUMBERINPUT_BUTTON_CLASS =
  "flex size-[var(--size)] cursor-pointer items-center justify-center border-none bg-[rgba(var(--background-rgb),0.5)] text-[rgba(var(--text-rgb))] hover:brightness-125";

const NUMBERINPUT_INPUT_CLASS =
  "h-full w-[150px] border-x border-y-0 border-(--panel-border) bg-[rgba(var(--background-rgb),0.5)] pl-3 text-xs text-[rgba(var(--text-rgb))] font-[Inter,sans-serif] [appearance:textfield] [&::-webkit-inner-spin-button]:[-webkit-appearance:none] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:[-webkit-appearance:none] [&::-webkit-outer-spin-button]:m-0";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={INPUT_CLASS + (className ? " " + className : "")}
      {...props}
    />
  );
}
function NumberInput({
  className,
  type,
  value,
  onValueChange,
  ...props
}: React.ComponentProps<"input"> & {
  value: number | undefined;
  onValueChange: (value: number) => void;
}) {
  const [v, setV] = React.useState<number>(
    typeof value === "number" && Number.isFinite(value) ? value : 10,
  );

  React.useEffect(() => {
    if (typeof value === "number" && Number.isFinite(value)) {
      setV(value);
    }
  }, [value]);

  const applyValue = (next: number) => {
    if (!Number.isFinite(next)) {
      return;
    }

    setV(next);
    onValueChange(next);
  };

  return (
    <div className={NUMBERINPUT_CONTAINER_CLASS}>
      <button
        className={NUMBERINPUT_BUTTON_CLASS}
        onClick={() => {
          applyValue((Number.isFinite(v) ? v : 10) - 1);
        }}
      >
        <Minus />
      </button>
      <input
        type={type}
        data-slot="input"
        className={
          NUMBERINPUT_INPUT_CLASS + (className ? " " + className : "")
        }
        {...props}
        value={v}
        onChange={(e) => {
          const newValue = Number.parseInt(e.target.value, 10);

          if (Number.isFinite(newValue)) {
            applyValue(newValue);
          }
        }}
      />
      <button
        className={NUMBERINPUT_BUTTON_CLASS}
        onClick={() => {
          applyValue((Number.isFinite(v) ? v : 10) + 1);
        }}
      >
        <Plus />
      </button>
    </div>
  );
}

export { Input, NumberInput };

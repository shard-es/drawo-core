import { Fragment } from "react";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@shared/ui/dropdown-menu";
import { Palette } from "@gravity-ui/icons";
import type { LocaleMessages } from "@shared/i18n";
import type { ColorScheme } from "./themes";
import { SCHEME_PRESETS, THEME_LABELS } from "./themes";

const MODE_SECTIONS: Array<"light" | "dark"> = ["light", "dark"];

/**
 * Theme picker rendered inline as a submenu of the top-left MenuBar dropdown.
 * Each mode section ("light"/"dark") lists every color scheme with a small
 * swatch previewing that scheme's canvas + accent colors.
 */
export function ThemeMenuSub({
  messages,
  currentTheme,
  setTheme,
}: {
  messages: LocaleMessages;
  /** Active theme id, e.g. "drawo-light". */
  currentTheme: string;
  setTheme: (theme: string) => void;
}) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Palette />
        {messages.menu.themes}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="max-h-[min(70vh,26rem)] w-56 overflow-y-auto p-1">
        {MODE_SECTIONS.map((mode, sectionIndex) => (
          <Fragment key={mode}>
            {sectionIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-60">
              {messages.canvas.themes[mode]}
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={currentTheme}
              onValueChange={setTheme}
            >
              {(Object.keys(THEME_LABELS) as ColorScheme[]).map(
                (schemeKey) => {
                  const variant = `${schemeKey}-${mode}`;
                  const preset = SCHEME_PRESETS[schemeKey][mode];
                  const accentColor = preset.strokeColors[0];
                  return (
                    <DropdownMenuRadioItem
                      key={variant}
                      value={variant}
                      className="rounded-lg"
                    >
                      <span className="flex w-full items-center gap-2.5">
                        <span
                          aria-hidden
                          className="relative h-5 w-5 shrink-0 overflow-hidden rounded-md shadow-sm ring-1 ring-(--panel-border)"
                          style={{
                            backgroundColor: preset.drawDefaults.canvas,
                          }}
                        >
                          <span
                            className="absolute inset-x-0 bottom-0 h-1.5"
                            style={{ backgroundColor: accentColor }}
                          />
                        </span>
                        <span className="truncate text-[13px]">
                          {THEME_LABELS[schemeKey]}
                        </span>
                      </span>
                    </DropdownMenuRadioItem>
                  );
                },
              )}
            </DropdownMenuRadioGroup>
          </Fragment>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

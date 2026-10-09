import { useMemo, useState, type KeyboardEvent } from "react";
import type { Scene } from "@core/scene";
import { parseRichText, type SceneElement } from "@core/elements";
import {
  LIBRARY_CATALOG,
  searchLibraryAssets,
  type LibraryCategoryId,
  type LibrarySvgAsset,
} from "@features/library/catalog";
import { toSvgDataUri } from "@features/library/svgAsset";
import {
  BoxMinimalistic,
  Ghost,
  Library,
  Magnifier,
  NotesMinimalistic,
  Text,
} from "@solar-icons/react";
import { ChevronLeft, ChevronRight, Xmark } from "@gravity-ui/icons";

type SidebarTab = "search" | "library";

interface SearchResult {
  id: string;
  label: string;
  typeLabel: string;
  text: string;
}

interface SearchLibrarySidebarProps {
  scene: Scene;
  isOpen: boolean;
  onOpenChange: (nextIsOpen: boolean) => void;
  onFocusElement: (id: string) => void;
  onInsertLibraryAsset: (asset: LibrarySvgAsset) => void;
}

const normalizeSearchText = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
};

const toPlainText = (value: string) =>
  parseRichText(value)
    .map((line) => line.runs.map((run) => run.text).join(""))
    .join("\n")
    .trim();

const getElementSearchPayload = (
  element: SceneElement,
): SearchResult | null => {
  if (element.type === "text") {
    const text = toPlainText(element.text);
    if (!text) {
      return null;
    }

    return {
      id: element.id,
      label: "Text",
      typeLabel: "Text",
      text,
    };
  }

  if (element.type === "rectangle" || element.type === "circle") {
    const text = toPlainText(element.text);
    if (!text) {
      return null;
    }

    return {
      id: element.id,
      label: element.type === "rectangle" ? "Rectángulo" : "Círculo",
      typeLabel: "Shape",
      text,
    };
  }

  return null;
};

const getSearchSnippet = (text: string, query: string): string => {
  if (!query) {
    return text;
  }

  const normalizedText = normalizeSearchText(text);
  const index = normalizedText.indexOf(query);
  if (index < 0) {
    return text;
  }

  const start = Math.max(0, index - 28);
  const end = Math.min(text.length, index + query.length + 48);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";

  return `${prefix}${text.slice(start, end)}${suffix}`;
};

/**
 * Entry animation for the panel.
 *
 * It used to live as `@keyframes sidebar-page-in` in the component's plain CSS
 * file. Tailwind cannot declare keyframes inline (they have to be registered
 * through `@theme`, which lives outside this feature), so the keyframes ship
 * with the component instead. React 19 hoists the tag into `<head>` and dedupes
 * it across instances, so the animation behaves like the old CSS rule.
 */
const SIDEBAR_PAGE_IN_KEYFRAMES = `@keyframes drawo-sidebar-page-in {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}`;

const PANEL_CLASS =
  "z-10 flex h-[calc(100%-16px)] w-[min(390px,34vw)] min-w-[320px] max-w-[460px] mr-2 mt-2 flex-col rounded-2xl border border-(--panel-border) bg-(--panel-bg) font-[Inter,sans-serif] shadow-[var(--panel-shadow)] backdrop-blur-[12px] [corner-shape:squircle] animate-[drawo-sidebar-page-in_220ms_ease] max-[980px]:w-[min(92vw,420px)] max-[980px]:min-w-[280px]";

const TABS_CLASS =
  "flex w-full items-center gap-1.5 border-b border-b-[rgba(var(--text-rgb),0.12)] p-2.5";

const TAB_CLASS =
  "inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[18px] bg-[rgba(var(--text-rgb),0.07)] p-[9px_10px] text-xs font-semibold [corner-shape:squircle] transition duration-150";

const TAB_IDLE_CLASS = "hover:bg-[rgba(var(--text-rgb),0.12)]";

const TAB_ACTIVE_CLASS =
  "bg-[rgba(var(--accent-rgb),0.22)] text-[rgba(var(--accent-rgb),1)]";

const CLOSE_BUTTON_CLASS =
  "inline-flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[9px] border border-[rgba(var(--text-rgb),0.01)] bg-[rgba(var(--text-rgb),0.06)] transition-colors duration-150 hover:bg-[rgba(var(--text-rgb),0.12)]";

const SECTION_CLASS = "flex min-h-0 flex-1 flex-col gap-2.5 p-3";

const SEARCH_ICON_CLASS =
  "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-[0.68]";

const SEARCH_INPUT_CLASS =
  "w-full rounded-3xl border border-[rgba(var(--text-rgb),0)] bg-[rgba(var(--text-rgb),0.06)] p-[10px_12px_10px_38px] text-[13px] font-medium outline-none transition-colors duration-150 focus:border-[rgba(var(--accent-rgb),0.7)]";

const SEARCH_TOOLBAR_CLASS = "flex items-center justify-between";

const SEARCH_COUNT_CLASS = "text-xs font-medium opacity-75";

const SEARCH_ACTIONS_CLASS = "inline-flex gap-1.5";

const MINI_BUTTON_CLASS =
  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[18px] border-0 bg-[rgba(var(--text-rgb),0.06)] [corner-shape:squircle] transition-colors duration-150 enabled:hover:bg-[rgba(var(--text-rgb),0.12)] disabled:cursor-not-allowed disabled:opacity-45";

const SEARCH_RESULTS_CLASS =
  "flex h-full flex-col gap-2 overflow-auto pr-0.5 pb-3";

const EMPTY_STATE_CLASS =
  "flex h-full flex-col items-center justify-center gap-2 text-center [&_svg]:h-auto [&_svg]:w-[40%]";

const EMPTY_STATE_TEXT_CLASS = "m-0 text-base font-medium tracking-[-0.4px]";

const RESULT_ITEM_CLASS =
  "flex cursor-pointer flex-col gap-1 rounded-3xl border border-[rgba(var(--text-rgb),0.15)] bg-[rgba(var(--text-rgb),0.05)] p-[12px_18px] text-left [corner-shape:squircle] transition duration-150";

const RESULT_ITEM_IDLE_CLASS = "hover:bg-[rgba(var(--text-rgb),0.1)]";

const RESULT_ITEM_ACTIVE_CLASS =
  "border-[rgba(var(--accent-rgb),0.9)] bg-[rgba(var(--accent-rgb),0.16)]";

const RESULT_META_CLASS = "flex items-center gap-0.5";

const RESULT_TYPE_CLASS =
  "text-sm font-bold uppercase tracking-[0.06em] translate-y-px scale-90";

const RESULT_LABEL_CLASS = "text-[15px] font-semibold";

const RESULT_TEXT_CLASS =
  "text-xs font-medium leading-[1.45] opacity-90";

const LIBRARY_NOTE_CLASS = "m-0 text-xs font-medium opacity-80";

const CATEGORIES_CLASS = "flex shrink-0 gap-1.5 overflow-x-auto pb-1";

const CATEGORY_PILL_CLASS =
  "inline-flex min-h-7 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(var(--text-rgb),0.08)] bg-[rgba(var(--text-rgb),0.05)] px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150";

const CATEGORY_PILL_ACTIVE_CLASS =
  "border-[rgba(var(--accent-rgb),0.5)] bg-[rgba(var(--accent-rgb),0.2)] text-[rgba(var(--accent-rgb),1)]";

const CATEGORY_PILL_COUNT_CLASS = "opacity-[0.68]";

const LIBRARY_GRID_CLASS =
  "grid h-full min-h-0 w-full grid-cols-2 gap-2 overflow-auto pr-0.5 pb-2";

const ASSET_CLASS =
  "flex cursor-pointer flex-col gap-2 rounded-[14px] border border-[rgba(var(--text-rgb),0.08)] bg-[rgba(var(--text-rgb),0.05)] p-2 text-left [corner-shape:squircle] transition duration-150 active:translate-y-px";

const ASSET_IDLE_CLASS = "hover:bg-[rgba(var(--text-rgb),0.08)]";

const ASSET_SELECTED_CLASS =
  "border-[rgba(var(--accent-rgb),0.8)] bg-[rgba(var(--accent-rgb),0.14)]";

const ASSET_PREVIEW_CLASS =
  "flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[10px] border border-[rgba(var(--text-rgb),0.08)] bg-[rgba(var(--text-rgb),0.04)]";

const ASSET_PREVIEW_IMAGE_CLASS = "h-[86%] w-[86%] object-contain";

const ASSET_META_CLASS = "flex flex-col gap-0.5";

const ASSET_NAME_CLASS = "text-xs font-semibold";

const ASSET_TAGS_CLASS = "text-[10px] font-medium opacity-65";

const tabClassName = (isActive: boolean) =>
  `${TAB_CLASS} ${isActive ? TAB_ACTIVE_CLASS : TAB_IDLE_CLASS}`;

const resultItemClassName = (isActive: boolean) =>
  `${RESULT_ITEM_CLASS} ${isActive ? RESULT_ITEM_ACTIVE_CLASS : RESULT_ITEM_IDLE_CLASS}`;

const categoryPillClassName = (isActive: boolean) =>
  `${CATEGORY_PILL_CLASS} ${isActive ? CATEGORY_PILL_ACTIVE_CLASS : ""}`;

const assetClassName = (isSelected: boolean) =>
  `${ASSET_CLASS} ${isSelected ? ASSET_SELECTED_CLASS : ASSET_IDLE_CLASS}`;

export const SearchLibrarySidebar = ({
  scene,
  isOpen,
  onOpenChange,
  onFocusElement,
  onInsertLibraryAsset,
}: SearchLibrarySidebarProps) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("search");
  const [query, setQuery] = useState("");
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [activeLibraryCategory, setActiveLibraryCategory] =
    useState<LibraryCategoryId | null>(null);
  const [selectedLibraryAssetId, setSelectedLibraryAssetId] = useState<
    string | null
  >(null);

  const normalizedQuery = normalizeSearchText(query);

  const searchResults = useMemo(() => {
    const searchable = scene.elements
      .map((element) => getElementSearchPayload(element))
      .filter((payload): payload is SearchResult => payload !== null);

    if (!normalizedQuery) {
      return searchable;
    }

    return searchable.filter((item) =>
      normalizeSearchText(item.text).includes(normalizedQuery),
    );
  }, [normalizedQuery, scene.elements]);

  const clampedResultIndex =
    searchResults.length === 0
      ? 0
      : Math.min(activeResultIndex, searchResults.length - 1);

  const goToResult = (index: number) => {
    if (searchResults.length === 0) {
      return;
    }

    const nextIndex =
      ((index % searchResults.length) + searchResults.length) %
      searchResults.length;
    setActiveResultIndex(nextIndex);
    onFocusElement(searchResults[nextIndex].id);
  };

  const handleSearchSubmit = () => {
    if (searchResults.length === 0) {
      return;
    }

    goToResult(clampedResultIndex);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchSubmit();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      goToResult(clampedResultIndex + 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      goToResult(clampedResultIndex - 1);
    }
  };

  const libraryAssets = useMemo(() => {
    return searchLibraryAssets(query, {
      categoryId: activeLibraryCategory,
    });
  }, [activeLibraryCategory, query]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <style
        href="drawo-search-library-sidebar-in"
        precedence="drawo-search-library-sidebar"
      >
        {SIDEBAR_PAGE_IN_KEYFRAMES}
      </style>
      <aside
        id="search-library-sidebar"
        className={PANEL_CLASS}
        role="dialog"
      >
        <div
          className={TABS_CLASS}
          role="tablist"
          aria-label="Buscar o librería"
        >
          <button
            type="button"
            className={tabClassName(activeTab === "search")}
            onClick={() => setActiveTab("search")}
            role="tab"
            aria-selected={activeTab === "search"}
          >
            <Magnifier weight="BoldDuotone" size={15} />
            Buscar
          </button>
          <button
            type="button"
            className={tabClassName(activeTab === "library")}
            onClick={() => setActiveTab("library")}
            role="tab"
            aria-selected={activeTab === "library"}
          >
            <Library weight="BoldDuotone" size={15} />
            Librería
          </button>
          <button
            type="button"
            className={CLOSE_BUTTON_CLASS}
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar sidebar"
          >
            <Xmark className="size-4" />
          </button>
        </div>

        {activeTab === "search" ? (
          <section className={SECTION_CLASS}>
            <div className="relative">
              <Magnifier size={16} className={SEARCH_ICON_CLASS} />
              <input
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveResultIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar texto en elementos..."
                className={SEARCH_INPUT_CLASS}
              />
            </div>

            <div className={SEARCH_TOOLBAR_CLASS}>
              <span className={SEARCH_COUNT_CLASS}>
                {searchResults.length === 0
                  ? "0 resultados"
                  : `${clampedResultIndex + 1}/${searchResults.length}`}
              </span>
              <div className={SEARCH_ACTIONS_CLASS}>
                <button
                  type="button"
                  className={MINI_BUTTON_CLASS}
                  onClick={() => goToResult(clampedResultIndex - 1)}
                  disabled={searchResults.length === 0}
                  title="Anterior"
                >
                  <ChevronLeft className="size-7" />
                </button>
                <button
                  type="button"
                  className={MINI_BUTTON_CLASS}
                  onClick={() => goToResult(clampedResultIndex + 1)}
                  disabled={searchResults.length === 0}
                  title="Siguiente"
                >
                  <ChevronRight className="size-7" />
                </button>
              </div>
            </div>

            <div className={SEARCH_RESULTS_CLASS}>
              {searchResults.length === 0 ? (
                <div className={EMPTY_STATE_CLASS}>
                  <Ghost weight="BoldDuotone" />
                  <p className={EMPTY_STATE_TEXT_CLASS}>
                    No hay coincidencias con ese texto.
                  </p>
                </div>
              ) : (
                searchResults.map((result, index) => (
                  <button
                    key={result.id}
                    type="button"
                    className={resultItemClassName(
                      clampedResultIndex === index,
                    )}
                    onClick={() => goToResult(index)}
                  >
                    <span className={RESULT_META_CLASS}>
                      <span className={RESULT_TYPE_CLASS}>
                        {result.typeLabel.toUpperCase() === "TEXT" ? (
                          <>
                            <Text />
                          </>
                        ) : result.typeLabel.toUpperCase() === "SHAPE" ? (
                          <>
                            <NotesMinimalistic />
                          </>
                        ) : (
                          <>{result.typeLabel}</>
                        )}
                      </span>
                      <span className={RESULT_LABEL_CLASS}>
                        {result.label}
                      </span>
                    </span>
                    <span className={RESULT_TEXT_CLASS}>
                      "{getSearchSnippet(result.text, normalizedQuery)}"
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>
        ) : (
          <section className={SECTION_CLASS}>
            <div className="relative">
              <Magnifier size={16} className={SEARCH_ICON_CLASS} />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar assets por nombre o tags..."
                className={SEARCH_INPUT_CLASS}
              />
            </div>

            <div className={CATEGORIES_CLASS} role="tablist">
              <button
                type="button"
                className={categoryPillClassName(activeLibraryCategory === null)}
                onClick={() => setActiveLibraryCategory(null)}
              >
                Todo
                <span className={CATEGORY_PILL_COUNT_CLASS}>
                  {LIBRARY_CATALOG.assets.length}
                </span>
              </button>
              {LIBRARY_CATALOG.categories.map((category) => {
                const count = LIBRARY_CATALOG.assets.filter(
                  (asset) => asset.categoryId === category.id,
                ).length;
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={categoryPillClassName(
                      activeLibraryCategory === category.id,
                    )}
                    onClick={() => setActiveLibraryCategory(category.id)}
                    title={category.description}
                  >
                    {category.name}
                    <span className={CATEGORY_PILL_COUNT_CLASS}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className={LIBRARY_NOTE_CLASS}>
              {libraryAssets.length} asset{libraryAssets.length === 1 ? "" : "s"}{" "}
              disponible
              {activeLibraryCategory ? "s en la categoría" : "s"}.
            </p>

            {libraryAssets.length === 0 ? (
              <div className={EMPTY_STATE_CLASS}>
                <Ghost weight="BoldDuotone" />
                <p className={EMPTY_STATE_TEXT_CLASS}>
                  No hay resultados para tu búsqueda.
                </p>
              </div>
            ) : (
              <div className={LIBRARY_GRID_CLASS}>
                {libraryAssets.map((asset) => {
                  const previewSrc = toSvgDataUri(asset.svg);
                  const isSelected = selectedLibraryAssetId === asset.id;
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      className={assetClassName(isSelected)}
                      onClick={() => {
                        setSelectedLibraryAssetId(asset.id);
                        onInsertLibraryAsset(asset);
                      }}
                      title={`${asset.name} • ${asset.tags.join(", ")}`}
                    >
                      <div className={ASSET_PREVIEW_CLASS}>
                        {previewSrc ? (
                          <img
                            src={previewSrc}
                            alt={asset.name}
                            loading="lazy"
                            className={ASSET_PREVIEW_IMAGE_CLASS}
                          />
                        ) : (
                          <BoxMinimalistic />
                        )}
                      </div>
                      <div className={ASSET_META_CLASS}>
                        <span className={ASSET_NAME_CLASS}>{asset.name}</span>
                        <span className={ASSET_TAGS_CLASS}>
                          {asset.tags.slice(0, 3).join(" · ")}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </aside>
    </>
  );
};

import {
  useCallback,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import {
  Editable,
  Slate,
  type ReactEditor as ReactEditorType,
  type RenderLeafProps,
} from "slate-react";
import type { Descendant } from "slate";
import { deserializeRichTextDocument } from "./richTextDocument";
import type {
  EditingTextState,
  RichTextDocument,
  RichTextLeaf,
} from "@features/canvas/types";

interface TextEditorOverlayProps {
  editorWrapRef: RefObject<HTMLDivElement | null>;
  editor: ReactEditorType;
  editingText: EditingTextState | null;
  editingDocument: RichTextDocument | null;
  editorSessionKey: number;
  cameraZoom: number;
  setEditingDocument: Dispatch<SetStateAction<RichTextDocument | null>>;
  setEditingText: Dispatch<SetStateAction<EditingTextState | null>>;
  toThemeColor: (color: string | null | undefined) => string;
  getTextLineHeight: (fontSize: number) => number;
  onEditorChange: (value: Descendant[]) => void;
  onCommitEditingText: () => void;
  onToggleEditorMark: (mark: "bold" | "italic" | "strikethrough") => void;
}

export const TextEditorOverlay = ({
  editorWrapRef,
  editor,
  editingText,
  editingDocument,
  editorSessionKey,
  cameraZoom,
  setEditingDocument,
  setEditingText,
  toThemeColor,
  getTextLineHeight,
  onEditorChange,
  onCommitEditingText,
  onToggleEditorMark,
}: TextEditorOverlayProps) => {
  const shouldKeepTextEditing = (activeElement: Element | null): boolean => {
    if (!(activeElement instanceof HTMLElement)) {
      return false;
    }

    /* The toolbar carries `[data-selection-toolbar]` (its old `.selection-toolbar`
     * class only carried styling, and is now Tailwind utilities instead). */
    return Boolean(
      activeElement.closest("[data-selection-toolbar]") ||
        activeElement.closest(".select-content") ||
        activeElement.closest('[data-slot="select-content"]') ||
        activeElement.closest('[data-slot="select-trigger"]'),
    );
  };

  const handleInputBlur = () => {
    requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      if (editorWrapRef.current?.contains(activeElement)) {
        return;
      }

      if (shouldKeepTextEditing(activeElement)) {
        return;
      }

      onCommitEditingText();
    });
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      onCommitEditingText();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
      event.preventDefault();
      onToggleEditorMark("bold");
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "i") {
      event.preventDefault();
      onToggleEditorMark("italic");
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      onToggleEditorMark("strikethrough");
      return;
    }

    if (event.key === "Escape") {
      setEditingDocument(null);
      setEditingText(null);
    }
  };

  const renderLeaf = useCallback(
    ({ attributes, children, leaf }: RenderLeafProps) => {
      const richLeaf = leaf as RichTextLeaf;

      return (
        <span
          {...attributes}
          style={{
            fontWeight:
              richLeaf.bold === true
                ? 700
                : richLeaf.bold === false
                  ? 400
                  : undefined,
            fontStyle:
              richLeaf.italic === true
                ? "italic"
                : richLeaf.italic === false
                  ? "normal"
                  : undefined,
            textDecorationLine:
              richLeaf.strikethrough === true ? "line-through" : "none",
            textDecorationColor:
              richLeaf.strikethrough === true ? "currentColor" : undefined,
            textDecorationThickness:
              richLeaf.strikethrough === true ? "0.05em" : undefined,
          }}
        >
          {children}
        </span>
      );
    },
    [],
  );

  if (!editingText) {
    return null;
  }

  return (
    <div
      ref={editorWrapRef}
      style={{
        position: "absolute",
        left: editingText.left,
        top: editingText.top,
        width: editingText.width,
        height: editingText.height,
        maxWidth: editingText.maxWidth,
        margin: 0,
        padding: 0,
        border: "none",
        outline: "none",
        cursor: "var(--drawo-cursor-text), auto",
        background: "transparent",
        boxShadow: "none",
        color: toThemeColor(editingText.style.color),
        fontFamily: editingText.style.fontFamily,
        fontSize: editingText.style.fontSize * cameraZoom,
        fontWeight: editingText.style.fontWeight,
        fontStyle: editingText.style.fontStyle,
        textAlign: editingText.style.textAlign,
        lineHeight: `${getTextLineHeight(editingText.style.fontSize) * cameraZoom}px`,
      }}
    >
      <Slate
        key={`${editingText.id}-${editorSessionKey}`}
        editor={editor}
        initialValue={
          (editingDocument ??
            deserializeRichTextDocument(editingText.value)) as Descendant[]
        }
        onChange={onEditorChange}
      >
        <Editable
          className="[&::selection]:bg-[rgba(59,130,246,0.34)] [&::selection]:text-inherit [&::selection]:[-webkit-text-fill-color:currentColor] [&_*::selection]:bg-[rgba(59,130,246,0.34)] dark:[&::selection]:bg-[rgba(148,189,255,0.32)] dark:[&_*::selection]:bg-[rgba(148,189,255,0.32)]"
          renderLeaf={renderLeaf}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          spellCheck={false}
          style={{
            width: "100%",
            height: "100%",
            minHeight: `${editingText.style.fontSize * cameraZoom}px`,
            outline: "none",
            whiteSpace: "pre",
            wordBreak: "normal",
            background: "transparent",
            color: "inherit",
            WebkitTextFillColor: "currentColor",
            caretColor: "currentColor",
          }}
        />
      </Slate>
    </div>
  );
};

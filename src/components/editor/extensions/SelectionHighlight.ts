import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface SelectionHighlightOptions {
  highlightClass: string;
}

export interface HighlightItem {
  id: string;
  from: number;
  to: number;
  color: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    selectionHighlight: {
      /**
       * Add a highlight to the document
       */
      addHighlight: (
        item: Omit<HighlightItem, "from" | "to">,
        from: number,
        to: number
      ) => ReturnType;
      /**
       * Remove a highlight from the document
       */
      removeHighlight: (id: string) => ReturnType;
      /**
       * Clear all highlights from the document
       */
      clearHighlights: () => ReturnType;
    };
  }
}

export const SelectionHighlightKey = new PluginKey("selectionHighlight");

export const SelectionHighlight = Extension.create<SelectionHighlightOptions>({
  name: "selectionHighlight",

  addOptions() {
    return {
      highlightClass: "selection-highlight",
    };
  },

  addStorage() {
    return {
      highlights: [] as HighlightItem[],
    };
  },

  addCommands() {
    return {
      addHighlight:
        (item, from, to) =>
        ({ tr, dispatch }) => {
          const { highlights } = this.storage;

          // Check if this range is already highlighted
          const isDuplicate = highlights.some(
            (h: HighlightItem) => h.from === from && h.to === to
          );

          if (isDuplicate) {
            return false;
          }

          const newHighlight = {
            ...item,
            from,
            to,
          };

          this.storage.highlights = [...highlights, newHighlight];

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        },

      removeHighlight:
        (id) =>
        ({ tr, dispatch }) => {
          const { highlights } = this.storage;

          this.storage.highlights = highlights.filter(
            (h: HighlightItem) => h.id !== id
          );

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        },

      clearHighlights:
        () =>
        ({ tr, dispatch }) => {
          this.storage.highlights = [];

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    // Get a reference to the storage
    const { storage } = this;

    return [
      new Plugin({
        key: SelectionHighlightKey,
        state: {
          init() {
            return { decorationSet: DecorationSet.empty };
          },
          apply(tr, prev) {
            // If the document changed, we need to map our highlights to the new positions
            if (tr.docChanged) {
              const { highlights } = storage;

              // Map each highlight to its new position
              storage.highlights = highlights.map(
                (highlight: HighlightItem) => {
                  const newFrom = tr.mapping.map(highlight.from);
                  const newTo = tr.mapping.map(highlight.to);

                  return {
                    ...highlight,
                    from: newFrom,
                    to: newTo,
                  };
                }
              );
            }

            return prev;
          },
        },
        props: {
          decorations: (state) => {
            const { highlights } = storage;
            const decorations: Decoration[] = [];
            const docSize = state.doc.content.size;

            highlights.forEach((highlight: HighlightItem) => {
              // Validate highlight positions are within document bounds
              if (
                highlight.from < 0 ||
                highlight.to > docSize ||
                highlight.from >= highlight.to
              ) {
                return; // Skip invalid highlights
              }

              const colorClass = highlight.color.split(" ")[0]; // Get the background color class

              // Create decorations that respect node boundaries
              const nodeDecorations: Decoration[] = [];

              try {
                // Find all nodes between the highlight range
                state.doc.nodesBetween(
                  highlight.from,
                  highlight.to,
                  (node, pos) => {
                    // Skip non-text nodes or undefined nodes
                    if (!node || !node.isText) return true;

                    // Calculate the overlap between this text node and our highlight
                    const from = Math.max(highlight.from, pos);
                    const to = Math.min(highlight.to, pos + node.nodeSize);

                    // Only create a decoration if there's an actual overlap
                    if (from < to) {
                      nodeDecorations.push(
                        Decoration.inline(from, to, {
                          class: `${colorClass} selection-highlight`,
                        })
                      );
                    }

                    return true;
                  }
                );
              } catch (error) {
                console.warn("Error creating highlight decoration:", error);
                // If there's an error, we'll skip this highlight
                return;
              }

              // Add all node-specific decorations
              decorations.push(...nodeDecorations);
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

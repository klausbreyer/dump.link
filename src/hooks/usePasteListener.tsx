import { useEffect, RefObject } from "react";

/**
 * Custom hook that adds a paste event listener to the specified element.
 * On paste, it processes the content and calls the provided callback for each cleaned line.
 *
 * @param targetRef - Ref to the target element where the paste listener will be attached.
 * @param callback - Function to be called for each cleaned line of pasted content.
 */
const usePasteListener = (
  targetRef: RefObject<HTMLElement>,
  callback: (value: string) => void,
) => {
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return; // Return early if clipboardData is null

      const pastedData = e.clipboardData.getData("Text");

      // Check if it's a multiline input
      if (pastedData.includes("\n")) {
        // Ask the user for confirmation
        const isConfirmed = window.confirm(
          "Are you sure you want to paste multiple lines, which will create multiple tasks in this bucket?",
        );

        if (isConfirmed) {
          const lines = pastedData.split(/\r?\n/).map((line) => {
            return line.replace(/-/g, "").trim();
          });

          lines.forEach((line) => {
            if (line) {
              callback(line);
            }
          });

          // Prevent default to stop the original pasting
          e.preventDefault();
        }
      }
      // If it's a single line, the default behavior will handle it
    };

    const targetElement = targetRef.current;
    if (targetElement) {
      targetElement.addEventListener("paste", handlePaste);

      // Clean up the event listener when the component is unmounted
      return () => {
        targetElement.removeEventListener("paste", handlePaste);
      };
    }
  }, [targetRef, callback]);
};

export default usePasteListener;
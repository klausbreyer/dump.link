import { useEffect, RefObject } from "react";
import config from "../config";

/**
 * Custom hook that adds a paste event listener to the specified element.
 * On paste, it processes the content and calls the provided callback for each cleaned line.
 *
 * @param targetRef - Ref to the target element where the paste listener will be attached.
 * @param callback - Function to be called for each cleaned line of pasted content.
 */
const usePasteListener = (
  targetRef: RefObject<HTMLElement>,
  active: boolean,
  callback: (value: string) => void,
) => {
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!active) return;
      if (!e.clipboardData) return; // Return early if clipboardData is null

      const pastedData = e.clipboardData.getData("Text");

      // Check if it's a multiline input
      if (pastedData.includes("\n")) {
        // Prevent default to stop the original pasting
        e.preventDefault();

        // Ask the user for confirmation
        const isConfirmed = confirm(
          "Are you sure you want to paste multiple lines, which will create multiple tasks?",
        );

        if (isConfirmed) {
          const lines = pastedData.split(/\r?\n/).map((line) => {
            return line.replace(/-/g, "").trim();
          });

          lines.forEach((line, i) => {
            if (line) {
              // Improving on the race condition. Also nice on an interface perspective.
              // Without it, stuff can be in the wrong order.  Dirty hack, yes.But good enough.
              setTimeout(() => {
                callback(line);
              }, i * 100);
            }
          });
        } else {
          let title = pastedData.replace(/-/g, "").trim();
          if (title.length >= config.TASK_MAX_LENGTH) {
            // cut last character and add elipsis
            title = title.substring(0, config.TASK_MAX_LENGTH - 1) + "…";
          }
          callback(title);
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

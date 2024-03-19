import React from "react";

import { Coordinates } from "./coordinates";

interface FollowArrowProps {
  active: boolean;
  startRef: React.RefObject<HTMLDivElement>;
  currentMousePosition: Coordinates | null;
}
const FollowArrow: React.FC<FollowArrowProps> = ({
  active,
  startRef,
  currentMousePosition,
}) => {
  const getStartCenter = (): Coordinates => {
    const rect = startRef.current?.getBoundingClientRect();

    if (!rect) return { x: 0, y: 0 };

    const parentElement = document.querySelector(".parent");
    if (!parentElement) {
      throw new Error("Parent element not found");
    }
    const parentRect = parentElement.getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2 - parentRect.left,
      y: rect.top + rect.height / 2 - parentRect.top,
    };
  };

  const start = getStartCenter();

  // Addiere den Versatz zur Startposition, um die aktuelle Mausposition zu erhalten.
  const end = currentMousePosition
    ? {
        x: start.x + currentMousePosition.x,
        y: start.y + currentMousePosition.y,
      }
    : null;

  return (
    <svg className="absolute top-0 left-0 w-full h-full -z-10">
      {active && end && (
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="black"
          strokeWidth="2"
          markerEnd="url(#smallArrowhead)"
        />
      )}
      <defs>
        <marker
          id="smallArrowhead"
          markerWidth="6"
          markerHeight="4"
          refX="0"
          refY="2"
          orient="auto"
        >
          <polygon points="0 0, 6 2, 0 4" />
        </marker>
      </defs>
    </svg>
  );
};
export default FollowArrow;

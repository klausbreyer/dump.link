import React, { useState, useRef, useEffect } from "react";
import Container from "./common/Container";
import Box from "./Box";
import { useData } from "./context/data";
import { Bucket, BucketID } from "./types";
import FoliationLane from "./Foliation";
import { getOtherBuckets } from "./context/helper";

interface GraphProps {}

type Coordinates = {
  x: number;
  y: number;
};
type BoxSide = "top" | "right" | "bottom" | "left";

// clockwise.
const positions: { top: number; left: number }[] = [
  { top: 5, left: 50 }, // 12
  { top: 15.112, left: 75.8091 },
  { top: 38.1115, left: 90.4338 }, // 3
  { top: 62.8885, left: 90.4338 }, // 3
  { top: 85.8885, left: 75.8091 },
  { top: 95, left: 50 }, // 6
  { top: 85.8885, left: 25.1909 },
  { top: 62.8885, left: 10.5662 }, //9
  { top: 38.1115, left: 10.5662 }, //9
  { top: 15.112, left: 25.1909 },
];

const Graph: React.FC<GraphProps> = (props) => {
  const { getBuckets } = useData();

  const buckets = getBuckets();
  const others = getOtherBuckets(buckets);
  const [, setRepaintcounter] = useState(0);

  const boxRefs = useRef<{ [key: BucketID]: React.RefObject<HTMLDivElement> }>(
    {},
  );

  // check if all box refs are initialized.
  const [allBoxesRendered, setAllBoxesRendered] = useState(false);

  useEffect(() => {
    for (const bucket of others) {
      if (!boxRefs.current[bucket.id]) {
        boxRefs.current[bucket.id] = React.createRef();
      }
    }

    setAllBoxesRendered(true);
  }, [others]);

  const repaint = () => {
    setRepaintcounter((prev) => prev + 1);
  };

  useEffect(() => {
    window.addEventListener("resize", repaint);

    return () => {
      window.removeEventListener("resize", repaint);
    };
  }, []);

  // repaint after adding dependencies.
  useEffect(() => {
    repaint();
  }, [allBoxesRendered]);

  return (
    <Container>
      <div className="relative w-full min-h-[800px] parent mt-6 ">
        <svg className="absolute top-0 left-0 w-full h-full -z-10">
          {allBoxesRendered &&
            buckets.map((bucket) =>
              bucket.dependencies.map((dependencyId, index) => {
                if (
                  !boxRefs?.current[bucket.id]?.current ||
                  !boxRefs?.current[dependencyId]?.current
                ) {
                  return null;
                }

                const fromRect =
                  boxRefs.current[bucket.id].current!.getBoundingClientRect();
                const toRect =
                  boxRefs.current[
                    dependencyId
                  ].current!.getBoundingClientRect();
                const { from, to } = getBorderCenterCoordinates(
                  fromRect,
                  toRect,
                );
                const shortenedTo = shortenLineEnd(from, to, 10); // Shorten the arrow by 20 pixels.

                return (
                  <g key={index}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={shortenedTo.x}
                      y2={shortenedTo.y}
                      stroke="black"
                      strokeWidth="2"
                      markerEnd="url(#smallArrowhead)"
                    />
                  </g>
                );
              }),
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

        {others.map((bucket, i) => {
          const x = positions[i].left;
          const y = positions[i].top;

          return (
            <div
              ref={boxRefs.current[bucket.id]}
              className="absolute w-40 bg-blue-500"
              style={{
                top: `${y}%`,
                left: `${x}%`,
                transform: "translate(-50%, -50%)", // Center the box
              }}
              key={bucket.id}
            >
              <Box bucket={bucket} context="graph" />
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export default Graph;

// @todo. extract in own file.
export const shortenLineEnd = (
  from: Coordinates,
  to: Coordinates,
  shortenAmount: number,
): Coordinates => {
  const direction = {
    x: to.x - from.x,
    y: to.y - from.y,
  };

  const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
  const normalizedDirection = {
    x: direction.x / length,
    y: direction.y / length,
  };

  return {
    x: to.x - normalizedDirection.x * shortenAmount,
    y: to.y - normalizedDirection.y * shortenAmount,
  };
};

export const getBorderCenterCoordinates = (
  fromRect: DOMRect,
  toRect: DOMRect,
): { from: Coordinates; to: Coordinates } => {
  let from: Coordinates = { x: 0, y: 0 };
  let to: Coordinates = { x: 0, y: 0 };

  const parentElement = document.querySelector(".parent");
  if (!parentElement) {
    throw new Error("Parent element not found");
  }
  const parentRect = parentElement.getBoundingClientRect();

  const centersFrom: Record<BoxSide, Coordinates> = {
    top: { x: fromRect.left + fromRect.width / 2, y: fromRect.top },
    right: { x: fromRect.right, y: fromRect.top + fromRect.height / 2 },
    bottom: { x: fromRect.left + fromRect.width / 2, y: fromRect.bottom },
    left: { x: fromRect.left, y: fromRect.top + fromRect.height / 2 },
  };

  const centersTo: Record<BoxSide, Coordinates> = {
    top: { x: toRect.left + toRect.width / 2, y: toRect.top },
    right: { x: toRect.right, y: toRect.top + toRect.height / 2 },
    bottom: { x: toRect.left + toRect.width / 2, y: toRect.bottom },
    left: { x: toRect.left, y: toRect.top + toRect.height / 2 },
  };

  let minDistance = Infinity;
  let chosenFrom: Coordinates = { x: 0, y: 0 };
  let chosenTo: Coordinates = { x: 0, y: 0 };

  for (const sideFrom of ["top", "right", "bottom", "left"] as BoxSide[]) {
    for (const sideTo of ["top", "right", "bottom", "left"] as BoxSide[]) {
      const dist = Math.sqrt(
        Math.pow(centersFrom[sideFrom].x - centersTo[sideTo].x, 2) +
          Math.pow(centersFrom[sideFrom].y - centersTo[sideTo].y, 2),
      );

      if (dist < minDistance) {
        minDistance = dist;
        chosenFrom = centersFrom[sideFrom];
        chosenTo = centersTo[sideTo];
      }
    }
  }

  return {
    from: {
      x: chosenFrom.x - parentRect.left,
      y: chosenFrom.y - parentRect.top,
    },
    to: {
      x: chosenTo.x - parentRect.left,
      y: chosenTo.y - parentRect.top,
    },
  };
};

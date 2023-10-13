import React, { useState, useRef, useEffect } from "react";
import Container from "../common/Container";
import Box from "./Box";
import { useTasks } from "../hooks/useTasks";
import { Bucket } from "../types";

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
  const {
    addBucketDependency,
    hasCyclicDependency,
    removeBucketDependency,
    getBuckets,
  } = useTasks();

  const buckets = getBuckets();
  const [resizeCounter, setResizeCounter] = useState(0);

  const boxRefs = useRef<{ [key: number]: React.RefObject<HTMLDivElement> }>(
    {},
  );
  for (let i = 1; i <= 11; i++) {
    if (!boxRefs.current[i]) {
      boxRefs.current[i] = React.createRef();
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setResizeCounter((prev) => prev + 1);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const addRandomArrow = () => {
    const boxes = buckets
      .map((bucket) => parseInt(bucket.id))
      .filter((id) => id >= 1 && id <= 10);
    const start = boxes[Math.floor(Math.random() * boxes.length)];
    let end = boxes[Math.floor(Math.random() * boxes.length)];

    while (start === end) {
      end = boxes[Math.floor(Math.random() * boxes.length)];
    }

    if (!hasCyclicDependency(start.toString(), end.toString())) {
      addBucketDependency(start.toString(), end.toString());
    } else {
      console.warn("Cyclic dependency detected! Dependency not added.");
    }
  };

  const removeArrow = (bucketId: string, dependencyId: string) => {
    removeBucketDependency(bucketId, dependencyId);
  };

  const drawAllArrows = () => {
    const boxes = buckets
      .map((bucket) => parseInt(bucket.id))
      .filter((id) => id >= 1 && id <= 10);

    for (let i = 0; i < boxes.length; i++) {
      for (let j = 0; j < boxes.length; j++) {
        if (
          i !== j &&
          !hasCyclicDependency(boxes[i].toString(), boxes[j].toString())
        ) {
          addBucketDependency(boxes[i].toString(), boxes[j].toString());
        }
      }
    }
  };

  return (
    <Container>
      <button onClick={addRandomArrow}>Add Random Arrow</button>
      <button onClick={drawAllArrows}>Draw All Arrows</button>

      <div className="relative w-full h-[800px]  parent">
        <svg className="absolute top-0 left-0 w-full h-full -z-10">
          {buckets.map((bucket) =>
            bucket.dependencies.map((dependencyId, index) => {
              const fromRect =
                boxRefs.current[
                  parseInt(bucket.id)
                ].current!.getBoundingClientRect();
              const toRect =
                boxRefs.current[
                  parseInt(dependencyId)
                ].current!.getBoundingClientRect();
              const { from, to } = getBorderCenterCoordinates(fromRect, toRect);
              const shortenedTo = shortenLineEnd(from, to, 10); // Shorten the arrow by 20 pixels.

              return (
                <g
                  key={index}
                  onClick={() => removeArrow(bucket.id, dependencyId)}
                >
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
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i, index) => {
          const x = positions[index].left;
          const y = positions[index].top;

          return (
            <div
              data-testid={i}
              ref={boxRefs.current[i]}
              className="absolute w-40 bg-blue-500"
              style={{
                top: `${y}%`,
                left: `${x}%`,
                transform: "translate(-50%, -50%)", // Center the box
              }}
              key={i}
            >
              <Box bucketId={i + ""} />
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export default Graph;
const shortenLineEnd = (
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

const getBorderCenterCoordinates = (
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

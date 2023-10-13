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

// clockwise.
const positions: { top: number; left: number }[] = [
  { top: 10, left: 50 }, // 12
  { top: 20.112, left: 68.8091 },
  { top: 38.1115, left: 90.4338 }, // 3
  { top: 62.8885, left: 90.4338 }, // 3
  { top: 79.8885, left: 68.8091 },
  { top: 90, left: 50 }, // 6
  { top: 79.8885, left: 31.1909 },
  { top: 62.8885, left: 10.5662 }, //9
  { top: 38.1115, left: 10.5662 }, //9
  { top: 20.112, left: 31.1909 },
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
  const getCenterCoordinates = (id: number): Coordinates => {
    const rect = boxRefs.current[id].current!.getBoundingClientRect();
    const parentElement = document.querySelector(".parent");
    if (!parentElement) {
      throw new Error("Parent element not found");
    }
    const containerRect = parentElement.getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top + rect.height / 2 - containerRect.top,
    };
  };

  const createArrowheads = (from: Coordinates, to: Coordinates) => {
    const distance = Math.sqrt(
      Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2),
    );
    const numberOfArrows = Math.floor(distance / 20); // Abstand zwischen den Pfeilspitzen
    const dx = (to.x - from.x) / numberOfArrows;
    const dy = (to.y - from.y) / numberOfArrows;

    const arrows = [];
    for (let i = 1; i < numberOfArrows; i++) {
      arrows.push(
        <line
          key={i}
          x1={from.x + i * dx}
          y1={from.y + i * dy}
          x2={from.x + (i + 1) * dx}
          y2={from.y + (i + 1) * dy}
          stroke="black"
          strokeWidth="2"
          markerEnd="url(#smallArrowhead)"
        />,
      );
    }
    return arrows;
  };

  return (
    <Container>
      <button onClick={addRandomArrow}>Zufälligen Pfeil hinzufügen</button>
      <div className="relative w-full h-screen parent">
        <svg className="absolute top-0 left-0 w-full h-full -z-10">
          {buckets.map((bucket) =>
            bucket.dependencies.map((dependencyId, index) => {
              const fromCoords = getCenterCoordinates(parseInt(bucket.id));
              const toCoords = getCenterCoordinates(parseInt(dependencyId));

              return (
                <g
                  key={index}
                  onClick={() => removeArrow(bucket.id, dependencyId)}
                >
                  <line
                    x1={fromCoords.x}
                    y1={fromCoords.y}
                    x2={toCoords.x}
                    y2={toCoords.y}
                    stroke="black"
                    strokeWidth="2"
                  />
                  {createArrowheads(fromCoords, toCoords)}
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
                transform: "translate(-50%, -50%)", // Zentriert die Box
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

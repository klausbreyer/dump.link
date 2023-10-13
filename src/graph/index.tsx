import React, { useState, useRef, useEffect } from "react";
import Container from "../common/Container";
import Box from "./Box";
import { useTasks } from "../hooks/useTasks";

interface GraphProps {}

const Graph: React.FC<GraphProps> = (props) => {
  const {
    addBucketDependency,
    hasCyclicDependency,
    removeBucketDependency,
    getBuckets,
  } = useTasks();

  const buckets = getBuckets();

  const [arrows, setArrows] = useState(() => {
    const dependencies = [];
    buckets.forEach((bucket) => {
      bucket.dependencies.forEach((dependencyId) => {
        dependencies.push({
          startBoxId: parseInt(bucket.id),
          endBoxId: parseInt(dependencyId),
        });
      });
    });
    return dependencies;
  });

  const boxRefs = useRef<{ [key: number]: React.RefObject<HTMLDivElement> }>(
    {},
  );
  const [resizeCounter, setResizeCounter] = useState(0);

  for (let i = 1; i <= 10; i++) {
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

  const getArrowCoordinates = (fromId: number, toId: number) => {
    const fromBox = boxRefs.current[fromId].current!.getBoundingClientRect();
    const toBox = boxRefs.current[toId].current!.getBoundingClientRect();
    const containerRect = document
      .querySelector(".grid")
      .getBoundingClientRect();

    return {
      start: {
        x: fromBox.left + fromBox.width / 2 - containerRect.left,
        y: fromBox.top + fromBox.height / 2 - containerRect.top,
      },
      end: {
        x: toBox.left + toBox.width / 2 - containerRect.left,
        y: toBox.top + toBox.height / 2 - containerRect.top,
      },
    };
  };

  const addRandomArrow = () => {
    const boxes = buckets.map((bucket) => parseInt(bucket.id));
    const start = boxes[Math.floor(Math.random() * boxes.length)];
    let end = boxes[Math.floor(Math.random() * boxes.length)];

    while (start === end) {
      end = boxes[Math.floor(Math.random() * boxes.length)];
    }

    if (!hasCyclicDependency(start.toString(), end.toString())) {
      addBucketDependency(start.toString(), end.toString());
      setArrows((prev) => [...prev, { startBoxId: start, endBoxId: end }]);
    } else {
      console.warn("Cyclic dependency detected! Dependency not added.");
    }
  };

  const removeArrow = (index: number) => {
    const arrowToRemove = arrows[index];
    removeBucketDependency(
      arrowToRemove.startBoxId.toString(),
      arrowToRemove.endBoxId.toString(),
    );
    setArrows((prev) => prev.filter((_, arrowIndex) => arrowIndex !== index));
  };

  const getCenterCoordinates = (id: number) => {
    const rect = boxRefs.current[id].current!.getBoundingClientRect();
    const containerRect = document
      .querySelector(".grid")
      .getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top + rect.height / 2 - containerRect.top,
    };
  };

  const createArrowheads = (from, to) => {
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
      <div className="relative grid grid-cols-4 gap-20">
        <div className="col-span-2 col-start-2 row-start-2"></div>
        <svg className="absolute top-0 left-0 w-full h-full -z-10">
          {arrows.map((arrow, index) => {
            const fromCoords = getCenterCoordinates(arrow.startBoxId);
            const toCoords = getCenterCoordinates(arrow.endBoxId);

            // Hauptpfeil
            return (
              <g key={index} onClick={() => removeArrow(index)}>
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
          })}

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
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
          <div ref={boxRefs.current[index]} className="box" key={index}>
            <Box bucketId={index + ""} />
          </div>
        ))}
      </div>
    </Container>
  );
};

export default Graph;

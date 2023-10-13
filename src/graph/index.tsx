import React, { useState, useRef, useEffect } from "react";
import Container from "../common/Container";
import Box from "./Box";

interface GraphProps {}

const Graph: React.FC<GraphProps> = (props) => {
  const [arrows, setArrows] = useState<
    Array<{ startBoxId: number; endBoxId: number }>
  >([]);
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
    setArrows([
      { startBoxId: 1, endBoxId: 2 },
      { startBoxId: 1, endBoxId: 8 },
    ]);
  }, []);

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
    const boxes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const startBoxId = boxes[Math.floor(Math.random() * boxes.length)];
    let endBoxId = boxes[Math.floor(Math.random() * boxes.length)];

    while (startBoxId === endBoxId) {
      endBoxId = boxes[Math.floor(Math.random() * boxes.length)];
    }

    setArrows((prev) => [...prev, { startBoxId, endBoxId }]);
  };

  const removeArrow = (index: number) => {
    setArrows((prev) => prev.filter((_, arrowIndex) => arrowIndex !== index));
  };

  const getBezierPath = (fromId: number, toId: number) => {
    const fromCoords = getEdgeCoordinates(fromId);
    const toCoords = getEdgeCoordinates(toId);
    const containerRect = document
      .querySelector(".grid")
      .getBoundingClientRect();

    const midX = containerRect.left + containerRect.width / 2;
    const midY = containerRect.top + containerRect.height / 2;

    // If the arrow is roughly horizontal
    if (Math.abs(fromCoords.y - toCoords.y) < 10) {
      return `M ${fromCoords.x} ${fromCoords.y} C ${fromCoords.x} ${midY}, ${toCoords.x} ${midY}, ${toCoords.x} ${toCoords.y}`;
    }

    // For all other arrows
    return `M ${fromCoords.x} ${fromCoords.y} C ${midX} ${fromCoords.y}, ${midX} ${toCoords.y}, ${toCoords.x} ${toCoords.y}`;
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

  const getEdgeCoordinates = (id: number) => {
    const boxRect = boxRefs.current[id].current!.getBoundingClientRect();
    const containerRect = document
      .querySelector(".grid")
      .getBoundingClientRect();

    const containerCenter = {
      x: containerRect.left + containerRect.width / 2,
      y: containerRect.top + containerRect.height / 2,
    };

    // Define the four corners of the box
    const corners = [
      { x: boxRect.left, y: boxRect.top }, // top-left
      { x: boxRect.right, y: boxRect.top }, // top-right
      { x: boxRect.left, y: boxRect.bottom }, // bottom-left
      { x: boxRect.right, y: boxRect.bottom }, // bottom-right
    ];

    // Find the corner that's closest to the container's center
    const closestCorner = corners.reduce((closest, corner) => {
      const currentDist = Math.sqrt(
        Math.pow(corner.x - containerCenter.x, 2) +
          Math.pow(corner.y - containerCenter.y, 2),
      );
      const closestDist = Math.sqrt(
        Math.pow(closest.x - containerCenter.x, 2) +
          Math.pow(closest.y - containerCenter.y, 2),
      );
      return currentDist < closestDist ? corner : closest;
    });

    return {
      x: closestCorner.x - containerRect.left,
      y: closestCorner.y - containerRect.top,
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

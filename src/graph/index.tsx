import React, { useState, useRef, useEffect } from "react";
import Container from "../common/Container";
import Box from "./Box";

interface GraphProps {
  // [key: string]: any;
}

const Graph: React.FC<GraphProps> = (props) => {
  const [arrows, setArrows] = useState<Array<{ start: number; end: number }>>(
    [],
  );
  const boxRefs = useRef<{ [key: number]: React.RefObject<HTMLDivElement> }>(
    {},
  );

  for (let i = 1; i <= 10; i++) {
    if (!boxRefs.current[i]) {
      boxRefs.current[i] = React.createRef();
    }
  }
  const drawArrow = (fromId: number, toId: number) => {
    const containerRect = document
      .querySelector(".grid")
      .getBoundingClientRect();
    const fromBox = boxRefs.current[fromId].current!.getBoundingClientRect();
    const toBox = boxRefs.current[toId].current!.getBoundingClientRect();

    const relativeFromBox = {
      left: fromBox.left - containerRect.left,
      right: fromBox.right - containerRect.left,
      top: fromBox.top - containerRect.top,
      bottom: fromBox.bottom - containerRect.top,
      width: fromBox.width,
      height: fromBox.height,
    };

    const relativeToBox = {
      left: toBox.left - containerRect.left,
      right: toBox.right - containerRect.left,
      top: toBox.top - containerRect.top,
      bottom: toBox.bottom - containerRect.top,
      width: toBox.width,
      height: toBox.height,
    };

    let startX, startY, endX, endY;

    if (relativeFromBox.right < relativeToBox.left) {
      startX = relativeFromBox.right;
      endX = relativeToBox.left;
    } else if (relativeFromBox.left > relativeToBox.right) {
      startX = relativeFromBox.left;
      endX = relativeToBox.right;
    } else {
      startX = relativeFromBox.left + relativeFromBox.width / 2;
      endX = relativeToBox.left + relativeToBox.width / 2;
    }

    if (relativeFromBox.bottom < relativeToBox.top) {
      startY = relativeFromBox.bottom;
      endY = relativeToBox.top;
    } else if (relativeFromBox.top > relativeToBox.bottom) {
      startY = relativeFromBox.top;
      endY = relativeToBox.bottom;
    } else {
      startY = relativeFromBox.top + relativeFromBox.height / 2;
      endY = relativeToBox.top + relativeToBox.height / 2;
    }

    setArrows((prev) => [
      ...prev,
      { start: { x: startX, y: startY }, end: { x: endX, y: endY } },
    ]);
  };

  const addRandomArrow = () => {
    const boxes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const start = boxes[Math.floor(Math.random() * boxes.length)];
    let end = boxes[Math.floor(Math.random() * boxes.length)];

    while (start === end) {
      end = boxes[Math.floor(Math.random() * boxes.length)];
    }

    drawArrow(start, end);
  };

  const removeArrow = (index: number) => {
    setArrows((prev) => prev.filter((_, arrowIndex) => arrowIndex !== index));
  };

  return (
    <Container>
      <button onClick={addRandomArrow}>Zufälligen Pfeil hinzufügen</button>
      <div className="relative grid grid-cols-4 gap-20">
        <div className="col-span-2 col-start-2 row-start-2"></div>
        <svg className="absolute top-0 left-0 w-full h-full">
          {arrows.map((arrow, index) => (
            <line
              key={index}
              x1={arrow.start.x}
              y1={arrow.start.y}
              x2={arrow.end.x}
              y2={arrow.end.y}
              stroke="black"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
              onClick={() => removeArrow(index)}
            />
          ))}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="0"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" />
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

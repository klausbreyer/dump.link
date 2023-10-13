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

  return (
    <Container>
      <button onClick={addRandomArrow}>Zufälligen Pfeil hinzufügen</button>
      <div className="relative grid grid-cols-4 gap-20">
        <div className="col-span-2 col-start-2 row-start-2"></div>
        <svg className="absolute top-0 left-0 w-full h-full">
          {arrows.map((arrow, index) => {
            const coords = getArrowCoordinates(
              arrow.startBoxId,
              arrow.endBoxId,
            );
            console.dir(coords);

            return (
              <line
                key={index}
                x1={coords.start.x}
                y1={coords.start.y}
                x2={coords.end.x}
                y2={coords.end.y}
                stroke="black"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                onClick={() => removeArrow(index)}
              />
            );
          })}
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

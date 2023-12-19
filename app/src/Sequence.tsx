import React, { useEffect, useRef, useState } from "react";

import { useDragLayer } from "react-dnd";
import Box from "./Box";
import FollowArrow from "./FollowArrow";
import Container from "./common/Container";
import InfoButton from "./common/InfoButton";
import {
  Coordinates,
  getBorderCenterCoordinates,
  shortenLineEnd,
} from "./common/coordinates";
import { useData } from "./context/data";
import { getOtherBuckets } from "./context/helper";
import { BucketID, TabContext } from "./types";

interface SequenceProps {}

// clockwise.
const positions: { top: number; left: number }[] = [
  { top: 10, left: 50 }, // 12
  { top: 15.112, left: 70.8091 },
  { top: 35.1115, left: 90.4338 }, // 3
  { top: 65.8885, left: 90.4338 }, // 3
  { top: 85.8885, left: 70.8091 },
  { top: 95, left: 50 }, // 6
  { top: 85.8885, left: 30.1909 },
  { top: 65.8885, left: 10.5662 }, //9
  { top: 35.1115, left: 10.5662 }, //9
  { top: 15.112, left: 30.1909 },
];

const Sequence: React.FC<SequenceProps> = (props) => {
  const { buckets, dependencies, removeAllBucketDependencies } = useData();

  const others = getOtherBuckets(buckets);
  const [, setRepaintcounter] = useState(0);
  const [activeRef, setActiveRef] = useState<React.RefObject<HTMLDivElement>>(
    React.createRef(),
  );
  const [currentMousePosition, setCurrentMousePosition] =
    useState<Coordinates | null>(null);

  const layerProps = useDragLayer((monitor) => ({
    differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
    isDragging: monitor.isDragging(),
  }));

  useEffect(() => {
    if (layerProps.isDragging) {
      setCurrentMousePosition(layerProps.differenceFromInitialOffset);
    } else {
      setCurrentMousePosition(null);
    }
  }, [layerProps.isDragging, layerProps.differenceFromInitialOffset]);

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
  }, [allBoxesRendered, buckets]);

  const [arrowActive, setArrowActive] = useState(false);

  useEffect(() => {
    const handleMouseUp = () => {
      setArrowActive(false);
    };

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleDragEnd = () => {
    setArrowActive(false);
  };

  const handleDragStart = (bucketId: BucketID) => {
    const ref = boxRefs.current[bucketId];
    if (ref && ref.current) {
      setActiveRef(ref);
      setArrowActive(true);
    }
  };

  return (
    <Container>
      <div className="relative w-full min-h-[600px] parent mt-6 mb-20 ">
        <svg className="absolute top-0 left-0 w-full h-full -z-10">
          {allBoxesRendered &&
            dependencies.map((dependency, index) => {
              if (
                !boxRefs?.current[dependency.bucketId]?.current ||
                !boxRefs?.current[dependency.dependencyId]?.current
              ) {
                return null;
              }

              const fromRect =
                boxRefs.current[
                  dependency.bucketId
                ].current!.getBoundingClientRect();
              const toRect =
                boxRefs.current[
                  dependency.dependencyId
                ].current!.getBoundingClientRect();
              const { from, to } = getBorderCenterCoordinates(fromRect, toRect);
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

        <FollowArrow
          active={arrowActive}
          startRef={activeRef}
          currentMousePosition={currentMousePosition}
        />

        {others.map((bucket, i) => {
          const x = positions[i].left;
          const y = positions[i].top;

          return (
            <div
              ref={boxRefs.current[bucket.id]}
              className="absolute w-48 "
              style={{
                top: `${y}%`,
                left: `${x}%`,
                transform: "translate(-50%, -50%)", // Center the box
              }}
              key={bucket.id}
            >
              <Box
                bucket={bucket}
                context={TabContext.Sequence}
                onDragStart={() => handleDragStart(bucket.id)}
                onDragEnd={() => {
                  setArrowActive(false);
                  handleDragEnd();
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-end w-full">
        <InfoButton
          color="slate"
          onClick={() =>
            confirm(
              "Are you certain you want to remove all interrelated connections from your task groups?",
            )
              ? removeAllBucketDependencies()
              : null
          }
        >
          Reset
        </InfoButton>
      </div>
    </Container>
  );
};

export default Sequence;

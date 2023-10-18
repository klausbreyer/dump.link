import React, { useEffect, useRef, useState } from "react";
import FlexCol from "../common/FlexCol";
import { useData } from "../hooks/useData";
import {
  deduplicateInnerValues,
  difference,
  getAllPairs,
  getElementsAtIndex,
  getFoliationBucketType,
  getLongestChain,
  getOtherBuckets,
  removeDuplicates,
  uniqueValues,
} from "../hooks/useData/helper";
import Container from "../common/Container";
import Box from "../graph/Box";
import {
  Bucket,
  BucketID,
  DraggedBucket,
  DraggingType,
  DropCollectedProps,
} from "../types";
import { getBorderCenterCoordinates, shortenLineEnd } from "../graph";
import { useDrop } from "react-dnd";
import { useGlobalDragging } from "../hooks/useGlobalDragging";
import Lane from "./Lane";

interface FoliationProps {
  // [key: string]: any;
}

const Foliation: React.FC<FoliationProps> = (props) => {
  const { getDependencyChains, getBucket, getBuckets, resetLayers, getLayers } =
    useData();
  const buckets = getBuckets();
  const others = getOtherBuckets(buckets);
  const chains = getDependencyChains();

  const cleanedLayers = getLayers();
  const cleanedBuckets = cleanedLayers.map((layer) =>
    layer
      .filter((id): id is BucketID => id !== null)
      .map((id) => getBucket(id))
      .filter((bucket): bucket is Bucket => bucket !== undefined),
  );

  const uniquePaired = uniqueValues(cleanedLayers);

  const notPaired = difference(
    others.map((b) => b.id),
    uniquePaired,
  );

  const notPairedBuckets = notPaired
    .filter((id): id is BucketID => id !== null)
    .map((id) => getBucket(id))
    .filter((bucket): bucket is Bucket => bucket !== undefined);

  const pairs = getAllPairs(chains);

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
  }, [buckets, allBoxesRendered, cleanedLayers]);

  return (
    <Container>
      <button
        className="p-1 rounded-sm bg-slate-500"
        onClick={() => resetLayers()}
      >
        reset layers
      </button>
      <div className="relative w-full min-h-[800px]  parent">
        <svg className="absolute top-0 left-0 w-full h-full -z-10">
          {allBoxesRendered &&
            pairs.map((pair: [BucketID, BucketID], i) => {
              if (
                !boxRefs?.current[pair[0]]?.current ||
                !boxRefs?.current[pair[1]]?.current
              ) {
                return null;
              }

              const fromRect =
                boxRefs.current[pair[0]].current!.getBoundingClientRect();
              const toRect =
                boxRefs.current[pair[1]].current!.getBoundingClientRect();
              const { from, to } = getBorderCenterCoordinates(fromRect, toRect);
              const shortenedTo = shortenLineEnd(from, to, 10); // Shorten the arrow by 20 pixels.

              return (
                <g key={i}>
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
        <div className="flex flex-col ">
          <Lane defaultHidden={true} index={-1} hoverable />

          {cleanedBuckets.map((lane, i) => (
            <Lane defaultHidden={false} index={i} hoverable={true} key={i}>
              {lane.map((bucket, j) => (
                <div key={j} ref={boxRefs.current[bucket.id]} className="w-40">
                  <Box bucket={bucket} context="foliation" />
                </div>
              ))}
            </Lane>
          ))}

          <Lane defaultHidden={true} index={cleanedBuckets.length} hoverable />
          <Lane defaultHidden={false} hoverable={false}>
            {notPairedBuckets.map((bucket, j) => (
              <div key={j} ref={boxRefs.current[bucket.id]} className="w-40">
                <Box bucket={bucket} context="foliation" />
              </div>
            ))}
          </Lane>
        </div>
      </div>
    </Container>
  );
};

export default Foliation;

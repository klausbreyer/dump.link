import React, { useEffect, useRef, useState } from "react";
import FlexCol from "../common/FlexCol";
import { useData } from "../hooks/useData";
import {
  deduplicateInnerValues,
  difference,
  getAllPairs,
  getElementsAtIndex,
  getLongestChain,
  removeDuplicates,
  uniqueValues,
} from "../hooks/useData/helper";
import Container from "../common/Container";
import Box from "../graph/Box";
import { Bucket, BucketID } from "../types";
import { getBorderCenterCoordinates, shortenLineEnd } from "../graph";

interface FoliationProps {
  // [key: string]: any;
}

const Foliation: React.FC<FoliationProps> = (props) => {
  const { getDependencyChains, getBucket, getBuckets } = useData();
  const buckets = getBuckets();

  const [, setRepaintcounter] = useState(0);

  const boxRefs = useRef<{ [key: BucketID]: React.RefObject<HTMLDivElement> }>(
    {},
  );

  // check if all box refs are initialized.
  const [allBoxesRendered, setAllBoxesRendered] = useState(false);

  useEffect(() => {
    for (let i = 1; i <= 11; i++) {
      if (!boxRefs.current[i]) {
        boxRefs.current[i] = React.createRef();
      }
    }

    setAllBoxesRendered(true);
  }, []);

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
  }, [buckets, allBoxesRendered]);

  const chains = getDependencyChains();

  const longestChain = getLongestChain(chains) || [];

  const layers = longestChain.map((_, i) =>
    getElementsAtIndex(chains, i).filter(Boolean),
  );

  //remove duplicates between layers
  const cleanedLayers = deduplicateInnerValues(
    // remove duplicates from each layer.
    layers.map((layer) => removeDuplicates(layer)),
  );
  const cleanedBuckets = cleanedLayers.map((layer) =>
    layer
      .filter((id): id is BucketID => id !== null)
      .map((id) => getBucket(id))
      .filter((bucket): bucket is Bucket => bucket !== undefined),
  );

  const uniquePaired = uniqueValues(cleanedLayers);
  const notPaired = difference(
    buckets.map((b) => b.id),
    uniquePaired,
  );

  const notPairedBuckets = notPaired
    .filter((id): id is BucketID => id !== null)
    .map((id) => getBucket(id))
    .filter((bucket): bucket is Bucket => bucket !== undefined);

  const pairs = getAllPairs(chains);

  return (
    <Container>
      <div className="relative w-full h-[800px]  parent">
        <svg className="absolute top-0 left-0 w-full h-full -z-10">
          {allBoxesRendered &&
            pairs.map((pair: [BucketID, BucketID], i) => {
              if (
                !boxRefs?.current[parseInt(pair[0])]?.current ||
                !boxRefs?.current[parseInt(pair[1])]?.current
              ) {
                return null;
              }

              const fromRect =
                boxRefs.current[
                  parseInt(pair[0])
                ].current!.getBoundingClientRect();
              const toRect =
                boxRefs.current[
                  parseInt(pair[1])
                ].current!.getBoundingClientRect();
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
        <div className="flex flex-col gap-8">
          {longestChain.map((_, i) => (
            <div
              className="flex items-center justify-center w-full gap-8 "
              key={i}
            >
              {cleanedBuckets[i].map((bucket, j) => (
                <div key={j} ref={boxRefs.current[bucket.id]} className="w-40">
                  <Box bucketId={bucket.id} />
                </div>
              ))}
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-center w-full gap-8 py-8 border-t border-black bg-slate-50">
            {notPairedBuckets.map((bucket, j) => (
              <div key={j} ref={boxRefs.current[bucket.id]} className="w-40">
                <Box bucketId={bucket.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Foliation;

import React, { useEffect, useRef, useState } from "react";

import Box from "./Box";
import { useData } from "./context/data";
import { getAllPairs, uniqueValues } from "./context/helper";
import FoliationLane from "./FoliationLane";
import { getBorderCenterCoordinates, shortenLineEnd } from "./Graph";
import { Bucket, BucketID } from "./types";

interface FoliationSubgraphProps {
  chains: BucketID[][];
}

const FoliationSubgraph: React.FC<FoliationSubgraphProps> = (props) => {
  const { getBucket, getLayersForSubgraphChains } = useData();
  const { chains } = props;

  const layersWithBucketIds = getLayersForSubgraphChains(chains);

  const layersWithBuckets = layersWithBucketIds.map((layer) =>
    layer
      .filter((id): id is BucketID => id !== null)
      .map((id) => getBucket(id))
      .filter((bucket): bucket is Bucket => bucket !== undefined),
  );

  const uniqueBuckets = uniqueValues(layersWithBuckets);
  const pairs = getAllPairs(chains);

  const [, setRepaintcounter] = useState(0);

  const boxRefs = useRef<{ [key: BucketID]: React.RefObject<HTMLDivElement> }>(
    {},
  );

  // check if all box refs are initialized.
  const [allBoxesRendered, setAllBoxesRendered] = useState(false);

  useEffect(() => {
    for (const bucket of uniqueBuckets) {
      if (!boxRefs.current[bucket.id]) {
        boxRefs.current[bucket.id] = React.createRef();
      }
    }

    setAllBoxesRendered(true);
  }, [layersWithBuckets]);

  const repaint = () => {
    setRepaintcounter((prev) => prev + 1);
  };

  useEffect(() => {
    window.addEventListener("resize", repaint);
    return () => {
      window.removeEventListener("resize", repaint);
    };
  }, []);

  // repaint after adding dependencies or after initialization
  useEffect(() => {
    repaint();
  }, [chains, allBoxesRendered]);

  return (
    <div className="w-full ">
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
        {layersWithBuckets.map((lane, i) => (
          <FoliationLane
            chains={chains}
            defaultHidden={false}
            index={i}
            hoverable={true}
            key={i}
          >
            {lane.map((bucket, j) => (
              <div key={j} ref={boxRefs.current[bucket.id]} className="w-40">
                <Box bucket={bucket} context={"foliation"} />
              </div>
            ))}
          </FoliationLane>
        ))}

        <FoliationLane
          chains={chains}
          defaultHidden={true}
          index={layersWithBuckets.length}
          hoverable
        />
      </div>
    </div>
  );
};
export default FoliationSubgraph;
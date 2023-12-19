import React, { useEffect, useRef, useState } from "react";

import Box from "./Box";
import Lane from "./Lane";
import Container from "./common/Container";
import InfoButton from "./common/InfoButton";
import {
  getBorderCenterCoordinates,
  shortenLineEnd,
} from "./common/coordinates";
import { useData } from "./context/data";
import {
  getAllDependencyChains,
  getAllPairs,
  getBucket,
  getLayers,
  uniqueValues,
} from "./context/helper";
import { Bucket, BucketID, TabContext } from "./types";

interface ArrangeProps {}

const Arrange: React.FC<ArrangeProps> = (props) => {
  const { resetLayersForAllBuckets, buckets, dependencies } = useData();

  const chains = getAllDependencyChains(buckets, dependencies);
  const layers = getLayers(buckets, dependencies);

  const layersWithBuckets = layers.map((layer) =>
    layer
      .filter((id): id is BucketID => id !== null)
      .map((id) => getBucket(buckets, id))
      .filter((bucket): bucket is Bucket => bucket !== undefined),
  );

  const uniqueBuckets = uniqueValues(layersWithBuckets);
  const pairs = getAllPairs(chains);

  const boxRefs = useRef<{ [key: BucketID]: React.RefObject<HTMLDivElement> }>(
    {},
  );

  const [, setRepaintcounter] = useState(0);
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

  useEffect(() => {
    repaint();
  }, [buckets, allBoxesRendered]);

  return (
    <Container>
      <div className="relative w-full parent ">
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
            <Lane defaultHidden={false} index={i} hoverable={true} key={i}>
              {lane.map((bucket, j) => (
                <div key={j} ref={boxRefs.current[bucket.id]} className="w-52">
                  <Box bucket={bucket} context={TabContext.Arrange} />
                </div>
              ))}
            </Lane>
          ))}

          <Lane
            defaultHidden={true}
            index={layersWithBuckets.length}
            hoverable
          />
        </div>
      </div>
      {layersWithBuckets.length > 0 && (
        <div className="flex items-center justify-end w-full">
          <InfoButton
            onClick={() =>
              confirm(
                "Are you certain you want to revert your customized layers to their default settings?",
              )
                ? resetLayersForAllBuckets()
                : null
            }
          >
            Revert
          </InfoButton>
        </div>
      )}
    </Container>
  );
};

export default Arrange;

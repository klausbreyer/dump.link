import React, { useEffect, useRef, useState } from "react";
import FlexCol from "./common/FlexCol";
import { useData } from "./context/data";
import {
  categorizeByFirstEntry,
  deduplicateInnerValues,
  difference,
  getAllPairs,
  getDefaultLayers,
  getElementsAtIndex,
  getFoliationBucketType,
  getLongestChain,
  getOtherBuckets,
  removeDuplicates,
  uniqueValues,
} from "./context/helper";
import Container from "./common/Container";
import Box from "./Box";
import {
  Bucket,
  BucketID,
  Chain,
  DraggedBucket,
  DraggingType,
  DropCollectedProps,
} from "./types";
import { getBorderCenterCoordinates, shortenLineEnd } from "./Graph";
import { useDrop } from "react-dnd";
import { useGlobalDragging } from "./hooks/useGlobalDragging";
import FoliationLane from "./FoliationLane";
import FoliationSubgraph from "./FoliationSubgraph";

interface FoliationProps {
  // [key: string]: any;
}

const Foliation: React.FC<FoliationProps> = (props) => {
  const { getDependencyChains, getBucket, getBuckets, getLayers } = useData();
  const buckets = getBuckets();
  const others = getOtherBuckets(buckets);
  const allChains = getDependencyChains();
  const subgraphs = categorizeByFirstEntry(allChains);

  const cleanedLayers = getDefaultLayers(allChains);
  const uniquePaired = uniqueValues(cleanedLayers);

  const notPaired = difference(
    others.map((b) => b.id),
    uniquePaired,
  );

  const notPairedBuckets = notPaired
    .filter((id): id is BucketID => id !== null)
    .map((id) => getBucket(id))
    .filter((bucket): bucket is Bucket => bucket !== undefined);

  return (
    <Container>
      <div className="relative w-full min-h-[800px] parent">
        <div className="grid w-full grid-cols-2 gap-8">
          {subgraphs.map((subgraph, i) => (
            <FoliationSubgraph chains={subgraph} key={i} />
          ))}
        </div>
        <FoliationLane defaultHidden={false} hoverable={false}>
          {notPairedBuckets.map((bucket, j) => (
            <div key={j} className="w-40">
              <Box bucket={bucket} context="foliation" />
            </div>
          ))}
        </FoliationLane>
      </div>
    </Container>
  );
};

export default Foliation;

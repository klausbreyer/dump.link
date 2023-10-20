import React, { useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';

import Box from './Box';
import Container from './common/Container';
import FlexCol from './common/FlexCol';
import { useData } from './context/data';
import { difference, divideIntoSubsets, getOtherBuckets, uniqueValues } from './context/helper';
import FoliationLane from './FoliationLane';
import FoliationSubgraph from './FoliationSubgraph';
import { getBorderCenterCoordinates, shortenLineEnd } from './Graph';
import { useGlobalDragging } from './hooks/useGlobalDragging';
import { Bucket, BucketID, DraggedBucket, DraggingType, DropCollectedProps } from './types';

interface FoliationProps {
  // [key: string]: any;
}

const Foliation: React.FC<FoliationProps> = (props) => {
  const { getDependencyChains, getBucket, getBuckets } = useData();
  const buckets = getBuckets();

  const allChains = getDependencyChains();

  const subgraphs = divideIntoSubsets(allChains);
  const uniquePaired = uniqueValues(allChains);
  const others = getOtherBuckets(buckets);
  const notPaired = difference(
    others.map((b) => b.id),
    uniquePaired,
  );

  // console.dir(
  //   uniquePaired.map(
  //     (id) => `${id} -> ${getBucket(id)?.id} , ${getBucket(id)?.layer}`,
  //   ),
  // );

  const notPairedBuckets = notPaired
    .filter((id): id is BucketID => id !== null)
    .map((id) => getBucket(id))
    .filter((bucket): bucket is Bucket => bucket !== undefined);

  return (
    <Container>
      <div className="relative w-full parent">
        <div className="grid w-full grid-cols-2 gap-8">
          {subgraphs.map((subgraph, i) => (
            <FoliationSubgraph chains={subgraph} key={i} />
          ))}
        </div>
        <FoliationLane chains={[]} defaultHidden={false} hoverable={false}>
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

import React from "react";

import Box from "./Box";
import Container from "./common/Container";
import { useData } from "./context/data";
import {
  difference,
  divideIntoSubsets,
  getOtherBuckets,
  uniqueValues,
} from "./context/helper";
import FoliationLane from "./FoliationLane";
import FoliationSubgraph from "./FoliationSubgraph";
import { Bucket, BucketID } from "./types";

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

  const notPairedBuckets = notPaired
    .filter((id): id is BucketID => id !== null)
    .map((id) => getBucket(id))
    .filter((bucket): bucket is Bucket => bucket !== undefined);

  function gridCols(n: number) {
    if (n === 1) return "grid-cols-1";
    if (n === 2) return "grid-cols-2";
    if (n === 3) return "grid-cols-3";
    if (n === 4) return "grid-cols-4";
    if (n === 5) return "grid-cols-5";
  }

  return (
    <Container>
      <div className="relative w-full parent">
        <div className={`grid w-full gap-8 ${gridCols(subgraphs.length)}`}>
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
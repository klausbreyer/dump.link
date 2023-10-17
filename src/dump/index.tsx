import React from "react";
import Area from "./Area";
import Bucket from "./Bucket";
import FlexCol from "../common/FlexCol";
import Container from "../common/Container";
import { useData } from "../hooks/useData";
import { getDumpBucket, getOtherBuckets } from "../hooks/useData/helper";

interface DumpProps {
  // [key: string]: any;
}

const Dump: React.FC<DumpProps> = (props) => {
  const { getBuckets } = useData();
  const buckets = getBuckets();

  const others = getOtherBuckets(buckets);
  const dump = getDumpBucket(buckets);

  if (!dump) {
    console.error("No dump bucket found.");
    return;
  }

  return (
    <Container>
      <div className="grid grid-cols-3 gap-4">
        <div className="">
          <Area bucket={dump} />
        </div>
        <div className="grid grid-cols-2 col-span-2 gap-4 ">
          <FlexCol>
            {others.slice(0, 5).map((bucket) => (
              <Bucket bucket={bucket} key={bucket.id} />
            ))}
          </FlexCol>
          <FlexCol>
            {others.slice(-5).map((bucket) => (
              <Bucket bucket={bucket} key={bucket.id} />
            ))}
          </FlexCol>
        </div>
      </div>
    </Container>
  );
};

export default Dump;

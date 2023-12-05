import React from "react";

import Area from "./Area";
import Bucket from "./Bucket";
import Container from "./common/Container";
import FlexCol from "./common/FlexCol";
import { useData } from "./context/data";
import { getDumpBucket, getOtherBuckets } from "./context/helper";

interface GroupProps {}

const Group: React.FC<GroupProps> = (props) => {
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
      <div className="grid grid-cols-3 gap-4 mt-6 mb-10">
        <div className={``}>
          <Area bucket={dump} />
        </div>
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-4 ">
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
      </div>
    </Container>
  );
};

export default Group;

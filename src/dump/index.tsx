import React from "react";
import Area from "./Area";
import Bucket from "./Bucket";
import FlexCol from "../design/FlexCol";

interface DumpProps {
  // [key: string]: any;
}

const Dump: React.FC<DumpProps> = (props) => {
  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="grid grid-cols-3 gap-4">
        <div className="">
          <Area />
        </div>
        <div className="grid grid-cols-2 col-span-2 gap-4 ">
          <FlexCol>
            {[1, 2, 3, 4, 5].map((index) => (
              <Bucket bucketId={index + ""} key={index} />
            ))}
          </FlexCol>
          <FlexCol>
            {[6, 7, 8, 9, 10].map((index) => (
              <Bucket bucketId={index + ""} key={index} />
            ))}
          </FlexCol>
        </div>
      </div>
    </div>
  );
};

export default Dump;

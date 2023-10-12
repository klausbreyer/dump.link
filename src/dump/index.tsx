import React from "react";
import Area from "./Area";
import Bucket from "./Bucket";
import FlexCol from "../common/FlexCol";
import Container from "../common/Container";

interface DumpProps {
  // [key: string]: any;
}

const Dump: React.FC<DumpProps> = (props) => {
  return (
    <Container>
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
    </Container>
  );
};

export default Dump;

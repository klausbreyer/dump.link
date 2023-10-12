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
            {[1, 3, 5, 7, 9].map((index) => (
              <Bucket bucketId={index + ""} key={index} />
            ))}
          </FlexCol>
          <FlexCol>
            {[2, 4, 6, 8, 10].map((index) => (
              <Bucket bucketId={index + ""} key={index} />
            ))}
          </FlexCol>
        </div>
      </div>
    </Container>
  );
};

export default Dump;

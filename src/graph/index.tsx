import React from "react";
import Container from "../common/Container";
import Box from "./Box";

interface GraphProps {
  // [key: string]: any;
}

const Graph: React.FC<GraphProps> = (props) => {
  return (
    <Container>
      <div className="grid grid-cols-4 gap-20 ">
        <div className="col-span-2 col-start-2 row-start-2"></div>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
          <Box bucketId={index + ""} key={index} />
        ))}
      </div>
    </Container>
  );
};

export default Graph;

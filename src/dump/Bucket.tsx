import React from "react";

interface BucketProps {
  index: number;
}

const Bucket: React.FC<BucketProps> = (props) => {
  const { index } = props;
  return (
    <div className="w-full">
      <div className="h-32 bg-amber-200"></div>
      <div className="h-10 bg-amber-300"></div>
    </div>
  );
};

export default Bucket;

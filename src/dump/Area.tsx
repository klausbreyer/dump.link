import React from "react";

interface AreaProps {
  [key: string]: any;
}

const Area: React.FC<AreaProps> = (props) => {
  return <div className="w-full h-full bg-stone-300">area</div>;
};

export default Area;

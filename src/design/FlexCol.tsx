import React from "react";

interface FlexColProps {
  children: React.ReactNode;
}

const FlexCol: React.FC<FlexColProps> = ({ children }) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};

export default FlexCol;

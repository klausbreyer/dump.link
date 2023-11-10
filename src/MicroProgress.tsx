import React from "react";

export interface MicroProgressProps {
  percentageCompleted: number;
}

const MicroProgress: React.FC<MicroProgressProps> = (props) => {
  const { percentageCompleted } = props;

  return (
    <div className="flex items-center justify-between gap-1 p-1 ">
      <div
        className={`relative w-full h-2  rounded-xl overflow-hidden bg-white `}
        title={`${percentageCompleted}% Figured Out`}
      >
        <div
          className={`h-full bg-green-500 absolute top-0 left-0 `}
          style={{ width: `${percentageCompleted}%` }}
        ></div>
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between h-full gap-1 p-1 text-sm">
          <span className={` font-bold`}></span>
        </div>
      </div>
    </div>
  );
};

export default MicroProgress;

import React from "react";
import Area from "./Area";
import TaskGroup from "./TaskGroup";

interface DumpProps {
  // [key: string]: any;
}

const Dump: React.FC<DumpProps> = (props) => {
  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="grid h-screen grid-cols-3 gap-4">
        <div className="">
          <Area />
        </div>
        <div className="grid grid-cols-2 col-span-2 gap-4 ">
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map((index) => (
              <TaskGroup index={index} key={index} />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {[6, 7, 8, 9, 10].map((index) => (
              <TaskGroup index={index} key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dump;

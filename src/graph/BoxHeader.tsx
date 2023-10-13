import React, { ChangeEvent } from "react";
import { CursorArrowRaysIcon } from "@heroicons/react/24/outline";

import { useTasks } from "../hooks/useTasks";
import {
  getBucketBackgroundColor,
  getHeaderBorderColor,
  getHeaderHoverColor,
  getHeaderTextColor,
} from "../common/colors";

export interface BoxHeaderProps {
  bucketId: string;
}

const BoxHeader: React.FC<BoxHeaderProps> = (props) => {
  const { bucketId } = props;

  const { getBucket } = useTasks();

  const bucket = getBucket(bucketId);
  const handleClick = () => {};

  const bgTop = getBucketBackgroundColor(bucket, "top");
  const border = getHeaderBorderColor(bucket);
  const hover = getHeaderHoverColor(bucket);
  const text = getHeaderTextColor(bucket);
  return (
    <div className={`w-full ${bgTop} p-1 flex gap-1 `}>
      <input
        type="text"
        className={`w-full px-1 bg-transparent shadow-md border-b-2 focus:outline-none ${border}
        `}
        value={bucket?.name}
        readOnly
      />
      <button
        onClick={handleClick}
        className={` p-0.5 bg-transparent border-2 focus:outline-none ${border} ${hover} ${text}`}
      >
        <Arrowhead />
      </button>
    </div>
  );
};

export default BoxHeader;

const Arrowhead: React.FC = () => {
  return (
    <svg
      width="15"
      height="15"
      version="1.1"
      viewBox="0 0 1200 1200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m1200 77.418-326.27 1083.9c-16.59 44.238-77.418 55.301-105.07 16.59l-243.32-309.68-309.68 309.68c-22.121 22.121-60.828 22.121-82.949 0l-110.6-110.6c-22.121-22.121-22.121-60.828 0-82.949l309.68-309.68-309.68-243.32c-38.711-27.648-27.648-88.48 22.121-99.539l1083.9-331.8c44.238-11.059 82.949 33.18 71.891 77.418z"
        fill-rule="evenodd"
      />
    </svg>
  );
};

import React, { ChangeEvent } from "react";
import { FlagIcon as FlagIconOutline } from "@heroicons/react/24/outline";
import { FlagIcon as FlagIconSolid } from "@heroicons/react/24/solid";

import { useTasks } from "../hooks/useTasks";
import {
  getBucketBackgroundColor,
  getHeaderBorderColor,
  getHeaderHoverColor,
  getHeaderTextColor,
} from "../design/colors";

export interface BucketHeaderProps {
  bucketId: string;
}

const BucketHeader: React.FC<BucketHeaderProps> = (props) => {
  const { bucketId } = props;

  const { getBucket, renameBucket, flagBucket } = useTasks();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 48) {
      renameBucket(bucketId, newValue);
    } else {
      renameBucket(bucketId, newValue.substring(0, 48)); // Abschneiden nach 48 Zeichen
    }
  };

  const bucket = getBucket(bucketId);
  const handleClick = () => {
    flagBucket(bucketId, !bucket?.flagged);
  };

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
        onChange={handleChange}
      />
      <button
        onClick={handleClick}
        className={` p-0.5 bg-transparent border-2 focus:outline-none ${border} ${hover} ${text}`}
      >
        {bucket?.flagged ? (
          <FlagIconSolid className="w-5 h-5 " />
        ) : (
          <FlagIconOutline className="w-5 h-5 " />
        )}
      </button>
    </div>
  );
};

export default BucketHeader;

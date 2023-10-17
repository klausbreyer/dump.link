import React, { ChangeEvent } from "react";
import { FlagIcon as FlagIconOutline } from "@heroicons/react/24/outline";
import { FlagIcon as FlagIconSolid } from "@heroicons/react/24/solid";

import { useData } from "../hooks/useData";
import {
  getBucketBackgroundColor,
  getHeaderBorderColor,
  getHeaderHoverColor,
  getHeaderTextColor,
} from "../common/colors";
import { Bucket } from "../types";

export interface BucketHeaderProps {
  bucket: Bucket;
}

const BucketHeader: React.FC<BucketHeaderProps> = (props) => {
  const { bucket } = props;

  const { renameBucket, flagBucket } = useData();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 48) {
      renameBucket(bucket.id, newValue);
    } else {
      renameBucket(bucket.id, newValue.substring(0, 48)); // Abschneiden nach 48 Zeichen
    }
  };

  const handleClick = () => {
    flagBucket(bucket.id, !bucket?.flagged);
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
        placeholder="unnamed"
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

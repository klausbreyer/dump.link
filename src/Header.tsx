import React, { ChangeEvent } from "react";

import { FlagIcon as FlagIconOutline } from "@heroicons/react/24/outline";
import { FlagIcon as FlagIconSolid } from "@heroicons/react/24/solid";

import StateSwitch from "./StateSwitch";
import BucketButton from "./common/BucketButton";
import {
  getBucketBackgroundColorTop,
  getActiveBorderColor,
} from "./common/colors";
import { useData } from "./context/data";
import { Bucket, Tabs } from "./types";
import { getBucketPercentage } from "./context/helper";

export interface HeaderProps {
  bucket: Bucket;
  context: Tabs;
}

const Header: React.FC<HeaderProps> = (props) => {
  const { bucket, context } = props;

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

  const bgTop = getBucketBackgroundColorTop(bucket);
  const border = getActiveBorderColor(bucket);

  const showExpanded = context !== Tabs.Sequencing && context !== Tabs.Ordering;

  // to account for NaN on unstarted buckets
  const percentageCompleted = getBucketPercentage(bucket) || 0;

  return (
    <div className={`w-full ${bgTop}`}>
      <div
        className="w-full cursor-help "
        title={`${percentageCompleted}% completed`}
      >
        <div
          className={`border-b-4 ${border} `}
          style={{ width: `${percentageCompleted}%` }}
        ></div>
      </div>
      <div className={` p-1 flex gap-1 flex-row  `}>
        <input
          type="text"
          className={`w-full h-7 px-1 bg-transparent shadow-sm rounded-sm border-b focus:outline-none ${border}
        `}
          placeholder="unnamed"
          value={bucket?.name}
          onChange={handleChange}
        />
        {showExpanded && (
          <>
            <StateSwitch bucket={bucket} />
            <BucketButton onClick={handleClick} bucket={bucket} flag>
              {bucket?.flagged ? (
                <FlagIconSolid className="w-5 h-5 " />
              ) : (
                <FlagIconOutline className="w-5 h-5 " />
              )}
            </BucketButton>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;

import React, { ChangeEvent, useState } from "react";

import StateSwitch from "./StateSwitch";
import FlagButton from "./common/FlagButton";
import {
  getActiveColor,
  getBucketBackgroundColorTop,
  getBucketFlaggedStyle,
  getHeaderBorderColor,
  getInputBorderColor,
} from "./common/colors";
import config from "./config";
import { useData } from "./context/data";
import { getBucketPercentage } from "./context/helper";
import { Bucket, TabContext } from "./types";

export interface HeaderProps {
  bucket: Bucket;
  context: TabContext;
}

const Header: React.FC<HeaderProps> = (props) => {
  const { bucket, context } = props;
  const { renameBucket, flagBucket, setBucketActive } = useData();

  const [isTextAreaFocused, setIsTextAreaFocused] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= config.BUCKET_MAX_LENGTH) {
      renameBucket(bucket.id, newValue);
    } else {
      renameBucket(bucket.id, newValue.substring(0, config.BUCKET_MAX_LENGTH));
    }
  };

  const handleClick = () => {
    flagBucket(bucket.id, !bucket?.flagged);
  };
  function handleFocus() {
    setIsTextAreaFocused(true);
  }

  function handleBlur() {
    setIsTextAreaFocused(false);
  }

  const bgTop = getBucketBackgroundColorTop(bucket);
  const inputBorder = getInputBorderColor(bucket);
  const darkBorder = getHeaderBorderColor(bucket);
  const active = getActiveColor(bucket);

  // to account for NaN on unstarted buckets
  const percentageCompleted = getBucketPercentage(bucket) || 0;
  const flaggedStyles = getBucketFlaggedStyle(bucket);

  return (
    <div className={`w-full ${bgTop}`}>
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
            <span className={` font-bold`}>
              {/* {bucket.active ? "started" : "stopped"} */}
            </span>
          </div>
        </div>
      </div>
      <div className={` p-1 flex gap-1 flex-row items-center `}>
        <input
          type="checkbox"
          className="w-8 h-8 "
          checked={bucket.active}
          onClick={() => setBucketActive(bucket.id, !bucket.active)}
        />
        <div className="relative w-full">
          <input
            type="text"
            className={`w-full h-8  px-1 text-lg shadow-sm rounded-sm border-b-4 focus:outline-none  ${flaggedStyles} ${inputBorder}
        `}
            placeholder="Unnamed"
            value={bucket?.name}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
          />
          <div
            className={`absolute text-slate-800 text-xxs bottom-1.5 right-2 ${
              isTextAreaFocused ? "block" : "hidden"
            }`}
          >
            {bucket?.name.length}/{config.BUCKET_MAX_LENGTH}
          </div>
        </div>
        {context === TabContext.Group && (
          <>
            <FlagButton onClick={handleClick} bucket={bucket} />
            {/* {<StateSwitch bucket={bucket} />} */}
          </>
        )}
      </div>
    </div>
  );
};

export default Header;

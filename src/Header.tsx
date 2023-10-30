import React, { ChangeEvent, useState } from "react";

import {
  ExclamationTriangleIcon,
  FlagIcon as FlagIconOutline,
} from "@heroicons/react/24/outline";
import { FlagIcon as FlagIconSolid } from "@heroicons/react/24/solid";

import StateSwitch from "./StateSwitch";
import BucketButton from "./common/BucketButton";
import {
  getActiveColor,
  getBucketBackgroundColorTop,
  getBucketFlaggedStyle,
  getHeaderBorderColor,
  getInputBorderColor,
} from "./common/colors";
import config from "./config";
import { useData } from "./context/data";
import {
  getBucketPercentage,
  getBucketState,
  getTasksByClosed,
} from "./context/helper";
import { useGlobalDragging } from "./hooks/useGlobalDragging";
import { Bucket, BucketState, TabContext } from "./types";

const getState = (bucket: Bucket) => {
  const state = getBucketState(bucket);
  if (state === BucketState.INACTIVE) {
    return "inactive";
  }
  if (state === BucketState.UNSOLVED) {
    return "unsolved";
  }
  if (state === BucketState.SOLVED) {
    return "solved";
  }
  if (state === BucketState.DONE) {
    return "done";
  }

  if (state === BucketState.EMPTY) {
    return "empty";
  }

  return null;
};

const getTasksNumber = (bucket: Bucket) => {
  const state = getBucketState(bucket);
  if (state === BucketState.INACTIVE) {
    return getTasksByClosed(bucket, false).length;
  }
  if (state === BucketState.UNSOLVED) {
    return getTasksByClosed(bucket, false).length;
  }
  if (state === BucketState.SOLVED) {
    return getTasksByClosed(bucket, true).length;
  }
  if (state === BucketState.DONE) {
    return getTasksByClosed(bucket, true).length;
  }

  if (state === BucketState.EMPTY) {
    return null;
  }

  return null;
};
export interface HeaderProps {
  bucket: Bucket;
  context: TabContext;
}

const Header: React.FC<HeaderProps> = (props) => {
  const { bucket, context } = props;

  const [isTextAreaFocused, setIsTextAreaFocused] = useState<boolean>(false);
  const { renameBucket, flagBucket, getLayerForBucketId, getLayers } =
    useData();

  const { globalDragging } = useGlobalDragging();

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
  const state = getState(bucket);
  const ownLayer = getLayerForBucketId(bucket.id);
  const layersWithBucketIds = getLayers();
  const ownLayerSize = layersWithBucketIds?.[ownLayer]?.length ?? 0;

  const bgTop = getBucketBackgroundColorTop(bucket);
  const inputBorder = getInputBorderColor(bucket);
  const darkBorder = getHeaderBorderColor(bucket);
  const active = getActiveColor(bucket);

  const wouldBeLastInZero = ownLayer !== 0 || ownLayerSize > 1;
  // to account for NaN on unstarted buckets
  const percentageCompleted = getBucketPercentage(bucket) || 0;
  const flaggedStyles = getBucketFlaggedStyle(bucket);

  return (
    <div className={`w-full ${bgTop}`}>
      <div
        className={`relative w-full h-4 border-b ${darkBorder} `}
        title={`${percentageCompleted}% completed`}
      >
        <div
          className={`h-full ${active} absolute top-0 left-0 `}
          style={{ width: `${percentageCompleted}%` }}
        ></div>
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center h-full gap-1 text-sm text-xxs">
          <span>{state}</span>
          {getBucketState(bucket) !== BucketState.EMPTY && (
            <span>({getTasksNumber(bucket)})</span>
          )}
        </div>
      </div>
      <div className={` p-1 flex gap-1 flex-row  `}>
        <div className="relative w-full">
          <input
            type="text"
            className={`w-full h-7 px-1 shadow-sm rounded-sm border-b-2 focus:outline-none  ${flaggedStyles} ${inputBorder}
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

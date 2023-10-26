import React, { ChangeEvent } from "react";

import {
  ArrowsPointingOutIcon,
  ExclamationTriangleIcon,
  FlagIcon as FlagIconOutline,
} from "@heroicons/react/24/outline";
import { FlagIcon as FlagIconSolid } from "@heroicons/react/24/solid";

import { ConnectDragSource } from "react-dnd";
import StateSwitch from "./StateSwitch";
import BucketButton from "./common/BucketButton";
import {
  getActiveColor,
  getBucketBackgroundColorTop,
  getBucketFlaggedStyle,
  getHeaderBorderColor,
  getInputBorderColor,
} from "./common/colors";
import { ArrowIcon } from "./common/icons";
import config from "./config";
import { useData } from "./context/data";
import { getBucketPercentage, getBucketState } from "./context/helper";
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

export interface HeaderProps {
  bucket: Bucket;
  context: TabContext;
}

const Header: React.FC<HeaderProps> = (props) => {
  const { bucket, context } = props;

  const { renameBucket, flagBucket, getLayerForBucketId, getLayers } =
    useData();

  const { globalDragging } = useGlobalDragging();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= config.MAX_LENGTH) {
      renameBucket(bucket.id, newValue);
    } else {
      renameBucket(bucket.id, newValue.substring(0, config.MAX_LENGTH));
    }
  };

  const handleClick = () => {
    flagBucket(bucket.id, !bucket?.flagged);
  };

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
        className={`relative w-full h-4 border-b ${darkBorder} cursor-help `}
        title={`${percentageCompleted}% completed`}
      >
        <div
          className={`h-full ${active} absolute top-0 left-0 `}
          style={{ width: `${percentageCompleted}%` }}
        ></div>
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center h-full text-sm "
          style={{ fontSize: "10px" }}
        >
          {state}
        </div>
      </div>
      <div className={` p-1 flex gap-1 flex-row  `}>
        <input
          type="text"
          className={`w-full h-7 px-1 shadow-sm rounded-sm border-b-2 focus:outline-none  ${flaggedStyles} ${inputBorder}
        `}
          placeholder="Untitled Task Group"
          value={bucket?.name}
          onChange={handleChange}
        />
        {context === TabContext.Grouping && (
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

        {context === TabContext.Ordering && !globalDragging.type && (
          <>
            {!wouldBeLastInZero && (
              <div
                title="One dependency needs to stay in the first layer"
                className="flex items-center justify-start gap-2 font-bold cursor-help"
              >
                <ExclamationTriangleIcon className="block w-5 h-5 " />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Header;

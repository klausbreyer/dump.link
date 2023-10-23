import React, { ChangeEvent } from "react";

import {
  ArrowsPointingOutIcon,
  ExclamationTriangleIcon,
  FlagIcon as FlagIconOutline,
} from "@heroicons/react/24/outline";
import { FlagIcon as FlagIconSolid } from "@heroicons/react/24/solid";

import StateSwitch from "./StateSwitch";
import BucketButton from "./common/BucketButton";
import {
  getBucketBackgroundColorTop,
  getActiveBorderColor,
} from "./common/colors";
import { useData } from "./context/data";
import { Bucket, TabContext } from "./types";
import { getBucketPercentage } from "./context/helper";
import { useGlobalDragging } from "./hooks/useGlobalDragging";
import { ArrowIcon } from "./common/icons";
import { ConnectDragSource } from "react-dnd";

export interface HeaderProps {
  bucket: Bucket;
  context: TabContext;

  foliationDrag?: ConnectDragSource;
  graphDrag?: ConnectDragSource;
}

const Header: React.FC<HeaderProps> = (props) => {
  const { bucket, context, foliationDrag, graphDrag } = props;

  const {
    renameBucket,
    flagBucket,
    getLayerForBucketId,
    getLayers,
    getBucketsDependingOn,
  } = useData();

  const { globalDragging } = useGlobalDragging();

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

  const ownLayer = getLayerForBucketId(bucket.id);
  const layersWithBucketIds = getLayers();
  const ownLayerSize = layersWithBucketIds?.[ownLayer]?.length ?? 0;

  const bgTop = getBucketBackgroundColorTop(bucket);
  const border = getActiveBorderColor(bucket);
  const wouldBeLastInZero = ownLayer !== 0 || ownLayerSize > 1;

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
        {context === TabContext.Sequencing && (
          <>
            <BucketButton bucket={bucket} ref={graphDrag}>
              <div className="flex items-center justify-start text-center cursor-move w-7 h-7">
                <ArrowIcon className="block w-3 h-3 mx-auto " />
              </div>
            </BucketButton>
          </>
        )}
        {!globalDragging.type && (
          <>
            {wouldBeLastInZero && (
              <BucketButton bucket={bucket} ref={foliationDrag}>
                <div className="flex items-center justify-start gap-2 font-bold cursor-move">
                  <ArrowsPointingOutIcon className="block w-5 h-5 " />
                </div>
              </BucketButton>
            )}
            {!wouldBeLastInZero && (
              <div className="flex items-center justify-start gap-2 font-bold cursor-move">
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

import React, { useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";

import {
  ArrowLeftOnRectangleIcon,
  ArrowsPointingOutIcon,
  ArrowsUpDownIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import {
  getBucketBackgroundColorTop,
  getHeaderTextColor,
} from "./common/colors";
import { ArrowIcon } from "./common/icons";
import { useData } from "./context/data";
import { getFoliationBucketType, getGraphBucketType } from "./context/helper";
import Header from "./Header";
import { useGlobalDragging } from "./hooks/useGlobalDragging";
import {
  Bucket,
  DraggedBucket,
  DraggingType,
  DropCollectedProps,
  TabContext,
} from "./types";
import BucketButton from "./common/BucketButton";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

interface BoxProps {
  bucket: Bucket;
  context: TabContext;
}

const Box: React.FC<BoxProps> = (props) => {
  const { bucket, context } = props;
  const {
    removeBucketDependency,
    getBucket,
    addBucketDependency,
    getBucketsAvailableFor,
    getLayers,
    getBucketsDependingOn,
  } = useData();

  const availbleIds = getBucketsAvailableFor(bucket.id);
  const dependingIds = getBucketsDependingOn(bucket.id);

  const { globalDragging, setGlobalDragging } = useGlobalDragging();

  const [collectedProps, dropRef] = useDrop(
    {
      accept: availbleIds.map((id) => getGraphBucketType(id)),

      drop: (item: DraggedBucket) => {
        const fromBucket = getBucket(item.bucketId);
        if (!fromBucket) return;
        addBucketDependency(fromBucket, bucket.id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [availbleIds, bucket, addBucketDependency, getGraphBucketType],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  const [{ isDragging: graphIsDragging }, graphDragRef, graphPreviewRev] =
    useDrag(
      () => ({
        type: getGraphBucketType(bucket.id),
        item: { bucketId: bucket.id },
        collect: (monitor) => ({
          isDragging: !!monitor.isDragging(),
        }),
        end: (item, monitor) => {},
      }),
      [bucket, getGraphBucketType],
    );

  useEffect(() => {
    setGlobalDragging(
      graphIsDragging ? DraggingType.GRAPH : DraggingType.NONE,
      bucket.id,
    );
  }, [graphIsDragging, setGlobalDragging]);

  const [
    { isDragging: foliationIsDragging },
    foliationDragRef,
    foliationPreviewRev,
  ] = useDrag(
    () => ({
      type: getFoliationBucketType(bucket.id),
      item: { bucketId: bucket.id },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {},
    }),
    [bucket, getFoliationBucketType],
  );

  useEffect(() => {
    setGlobalDragging(
      foliationIsDragging ? DraggingType.FOLIATION : DraggingType.NONE,
      bucket.id,
    );
  }, [foliationIsDragging, setGlobalDragging]);

  const bgTop = getBucketBackgroundColorTop(bucket);
  const bgHeader = getHeaderTextColor(bucket);

  return (
    <div
      id={bucket.id}
      className={`w-full rounded-md overflow-hidden opacity-95 ${bgTop} `}
      ref={(node) => foliationPreviewRev(graphPreviewRev(node))}
    >
      <Header
        bucket={bucket}
        context={context}
        foliationDrag={foliationDragRef}
        graphDrag={graphDragRef}
      />

      <div className={`min-h-[1rem] `}>
        <ul className="p-1 text-sm">
          {dependingIds?.map((id) => (
            <li
              key={id}
              onClick={() => removeBucketDependency(id, bucket.id)}
              className={`flex items-center justify-end gap-1 p-0.5 cursor-pointer group hover:underline
                ${bgHeader}
              `}
            >
              {getBucket(id)?.name}
              <ArrowLeftOnRectangleIcon className="block w-5 h-5 rotate-180 shrink-0 group-hover:hidden" />
              <XMarkIcon className="hidden w-4 h-4 shrink-0 group-hover:block" />
            </li>
          ))}
          {TabContext.Sequencing === context && (
            <li
              ref={dropRef}
              className={`flex border-2 h-8 items-center justify-between gap-1 p-1
            ${canDrop && !isOver && "border-dashed border-2 border-gray-400"}
            ${isOver && " border-gray-400"}
            ${!canDrop && !isOver && " border-transparent"}
            `}
            >
              {globalDragging.type === DraggingType.GRAPH}
              {canDrop}
              {globalDragging.type === DraggingType.GRAPH && canDrop && <></>}
              {globalDragging.type === DraggingType.GRAPH &&
                !canDrop &&
                !graphIsDragging && (
                  <>
                    Unavailble <ExclamationTriangleIcon className="w-5 h-5" />
                  </>
                )}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Box;

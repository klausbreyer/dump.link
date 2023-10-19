import React, { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useData } from "./context/data";
import { getBucketBackgroundColor, getHeaderTextColor } from "./common/colors";
import Header from "./Header";
import {
  ArrowRightIcon,
  ArrowsUpDownIcon,
  Bars2Icon,
  ExclamationTriangleIcon,
  LinkIcon,
  PlusIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Bucket,
  DraggedBucket,
  DraggingType,
  DropCollectedProps,
} from "./types";
import { useGlobalDragging } from "./hooks/useGlobalDragging";
import { ArrowIcon } from "./common/icons";
import { getFoliationBucketType, getGraphBucketType } from "./context/helper";

interface BoxProps {
  bucket: Bucket;
  context: "graph" | "foliation";
}

const Box: React.FC<BoxProps> = (props) => {
  const { bucket, context } = props;
  const {
    removeBucketDependency,
    getBucket,
    addBucketDependency,
    getBucketsAvailableFor,
    getBucketsDependingOn,
  } = useData();

  const availbleIds = getBucketsAvailableFor(bucket.id);

  const dependingIds = getBucketsDependingOn(bucket.id);

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

  const { globalDragging, setGlobalDragging } = useGlobalDragging();
  useEffect(() => {
    setGlobalDragging(graphIsDragging ? DraggingType.GRAPH : DraggingType.NONE);
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
    );
  }, [foliationIsDragging, setGlobalDragging]);

  const bgTop = getBucketBackgroundColor(bucket, "top");
  const showFoliationIcon =
    context === "foliation" &&
    (dependingIds.length > 0 || bucket.dependencies.length > 0);

  return (
    <div className={`w-full`} ref={graphPreviewRev}>
      <Header bucket={bucket} />
      <div className={`min-h-[2rem] ${bgTop} `}>
        <ul className="p-1 text-sm">
          {dependingIds?.map((id) => (
            <li
              key={id}
              onClick={() => removeBucketDependency(id, bucket.id)}
              className={`flex items-center justify-start gap-1 p-0.5 cursor-pointer group hover:underline
                ${getHeaderTextColor(getBucket(id))}
              `}
            >
              <LinkIcon className="block w-4 h-4 shrink-0 group-hover:hidden" />
              <XMarkIcon className="hidden w-4 h-4 shrink-0 group-hover:block" />
              {getBucket(id)?.name}
            </li>
          ))}
          <li
            ref={dropRef}
            className={`flex border-2 h-8 items-center justify-between gap-1 p-1
            ${canDrop && !isOver && "border-dashed border-2 border-gray-400"}
            ${isOver && " border-gray-400"}
            ${!canDrop && !isOver && " border-transparent"}
            `}
          >
            {!globalDragging && (
              <>
                <div>
                  {showFoliationIcon && (
                    <div ref={foliationDragRef}>
                      <ArrowsUpDownIcon className="block w-5 h-5 cursor-move" />
                    </div>
                  )}
                </div>
                <div ref={graphDragRef}>
                  <ArrowIcon className="block w-3 h-3 cursor-move" />
                </div>
              </>
            )}
            {globalDragging === DraggingType.GRAPH}
            {canDrop}
            {globalDragging === DraggingType.GRAPH && canDrop && <></>}
            {globalDragging === DraggingType.GRAPH &&
              !canDrop &&
              !graphIsDragging && (
                <>
                  Unavailble <ExclamationTriangleIcon className="w-5 h-5" />
                </>
              )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Box;

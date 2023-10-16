import React, { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getTasksByState, useData } from "../hooks/useData";
import { getBucketBackgroundColor } from "../common/colors";
import BucketHeader from "../dump/BucketHeader";
import {
  ArrowRightIcon,
  LinkIcon,
  PlusIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { DraggedBucket, DropCollectedProps } from "../types";
import { useGlobalDragging } from "../hooks/useGlobalDragging";

interface BoxProps {
  bucketId: string;
}

const Box: React.FC<BoxProps> = (props) => {
  const { bucketId } = props;
  const {
    moveTask,
    getBucket,
    updateTask,
    getTask,
    changeTaskState,
    getBucketForTask,
    getBuckets,
    addBucketDependency,
    getBucketsAvailbleFor,
    getBucketsDependingOn,
  } = useData();

  const bucket = getBucket(bucketId);

  const availbleIds = getBucketsAvailbleFor(bucketId);
  console.log(bucketId, availbleIds);

  const dependingIds = getBucketsDependingOn(bucketId);
  const dependencyIds = bucket?.dependencies;

  const [collectedProps, dropRef] = useDrop(
    {
      accept: availbleIds,

      drop: (item: DraggedBucket) => {
        const fromBucketId = item.bucketId;
        console.log(fromBucketId, bucketId);
        addBucketDependency(fromBucketId, bucketId);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [availbleIds, bucketId, addBucketDependency],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  const [{ isDragging }, dragRef, previewRev] = useDrag(
    () => ({
      type: bucketId,
      item: { bucketId },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {},
    }),
    [bucketId],
  );

  const { globalDragging, setGlobalDragging } = useGlobalDragging();
  useEffect(() => {
    setGlobalDragging(isDragging);
  }, [isDragging, setGlobalDragging]);

  const bgTop = getBucketBackgroundColor(bucket, "top");

  const isDefault = !canDrop && !isOver;

  return (
    <div className={`w-full`}>
      <BucketHeader bucketId={bucketId} />
      <div className={`min-h-[2rem] ${bgTop} `}>
        <ul className="p-1 text-sm">
          {dependingIds?.map((id) => (
            <li
              key={id}
              className="flex items-center justify-start gap-1 p-0.5 cursor-pointer group hover:underline "
            >
              <LinkIcon className="block w-5 h-5 group-hover:hidden" />
              <XMarkIcon className="hidden w-5 h-5 group-hover:block" />
              {getBucket(id)?.name}
            </li>
          ))}
          <li
            ref={(node) => dragRef(dropRef(node))}
            className={`flex border-2 items-center justify-start gap-1 p-1 cursor-pointer hover:underline hover:bg-gray-100
            ${canDrop && !isOver && "border-dashed border-2 border-gray-400"}
            ${isOver && " border-gray-400"}
            ${!canDrop && !isOver && " border-transparent"}
            `}
          >
            {!globalDragging && (
              <>
                <ArrowRightIcon className="block w-5 h-5" />
                Drag Dep.
              </>
            )}
            {globalDragging}
            {canDrop}
            {globalDragging && canDrop && <>Drop Dep.</>}
            {globalDragging && !canDrop && <>No Drop</>}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Box;

import React, { ChangeEvent, useEffect, useState } from "react";

import FlagButton from "../common/FlagButton";
import {
  getBucketBackgroundColor,
  getInputBorderColor,
} from "../common/bucketColors";
import { isSafari } from "../common/helper";
import { EmptyChekboxIcon } from "../common/icons";
import config from "../config";
import { ActivityAvatar } from "./HeaderActivity";
import {
  checkBucketActivity,
  validateActivityOther,
} from "./context/data/activities";
import { useData } from "./context/data/data";
import { getTasksByClosed, getTasksForBucket } from "./context/data/tasks";
import { Bucket, TabContext, Task } from "./types";

export interface HeaderProps {
  bucket: Bucket;
  context: TabContext;
}

const BoxHeader: React.FC<HeaderProps> = (props) => {
  const { bucket, context } = props;
  const { updateBucket, tasks, project, activities, updateActivities } =
    useData();

  const tasksForbucket = getTasksForBucket(tasks, bucket.id);
  const open = getTasksByClosed(tasksForbucket, false);

  const [inputValue, setInputValue] = useState(bucket?.name);

  useEffect(() => {
    setInputValue(bucket?.name);
  }, [bucket?.name]);

  const [isTextAreaFocused, setIsTextAreaFocused] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= config.PROJECT_BUCKET_MAX_LENGTH) {
      setInputValue(newValue);
    } else {
      setInputValue(newValue.substring(0, config.PROJECT_BUCKET_MAX_LENGTH));
    }
  };

  const handleFlagClick = () => {
    updateBucket(bucket.id, { flagged: !bucket?.flagged });
  };

  const handleCheckboxClick = () => {
    updateBucket(bucket.id, { done: !bucket.done });
  };

  function handleInputFocus() {
    updateActivities(bucket.id, undefined);
    setIsTextAreaFocused(true);
  }

  function handleInputBlur() {
    setIsTextAreaFocused(false);
    updateActivities(undefined, undefined);
    updateBucket(bucket.id, { name: inputValue });
  }

  const bgTop = getBucketBackgroundColor(bucket, tasksForbucket);
  const inputBorder = getInputBorderColor(bucket);

  function getBucketFlaggedStyle(bucket: Bucket, tasks: Task[]): string {
    const open = getTasksByClosed(tasks, false);
    if (bucket.flagged && (open.length > 0 || tasks.length === 0)) {
      return " bg-rose-500 ";
    }
    return "";
  }
  const flaggedStyles = getBucketFlaggedStyle(bucket, tasksForbucket);

  const hasTasks = tasksForbucket.length > 0;
  const showDone = hasTasks && open.length === 0;

  const activity = checkBucketActivity(activities, bucket.id);
  const activityOther = validateActivityOther(activity);

  return (
    <div className={`w-full ${bgTop}`}>
      <div className={` p-1 flex gap-1 flex-row items-center `}>
        <div className="relative w-full">
          <input
            type="text"
            className={`w-full h-8 px-1 text-lg shadow-sm rounded-sm border-b-4 focus:outline-none  ${flaggedStyles} ${inputBorder}`}
            placeholder="Unnamed"
            value={inputValue}
            disabled={project.archived}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
          />

          {activityOther && (
            <div className="absolute right-0 z-30 top-0.5 ">
              <ActivityAvatar activity={activityOther} />
            </div>
          )}
          <div
            className={`absolute text-slate-800 text-xxs bottom-1.5 right-2 ${
              isTextAreaFocused ? "block" : "hidden"
            }`}
          >
            {bucket?.name?.length}/{config.PROJECT_BUCKET_MAX_LENGTH}
          </div>
        </div>
        {!showDone && context === TabContext.Group && (
          <>
            <FlagButton
              tasks={tasksForbucket}
              onClick={handleFlagClick}
              disabled={project.archived}
              bucket={bucket}
            />
          </>
        )}
        {showDone && context === TabContext.Group && (
          <div className="relative w-8 h-8">
            {!bucket.done && (
              <>
                <EmptyChekboxIcon
                  className="absolute top-0 left-0 z-10 w-8 h-8 text-green-500 hover:text-green-600"
                  onClick={() => !project.archived && handleCheckboxClick()}
                />
                <div className="absolute w-7 h-7 bg-white top-0.5 left-0.5">
                  &nbsp;
                </div>
              </>
            )}
            {bucket.done && (
              <input
                type="checkbox"
                disabled={project.archived}
                className={`w-8 h-8 accent-green-500 absolute top-0 left-0
            ${isSafari() && "safari-only-checkbox-big"} `}
                checked={bucket.done || false}
                onChange={handleCheckboxClick}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoxHeader;

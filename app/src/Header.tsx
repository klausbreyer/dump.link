import React, { ChangeEvent, useState } from "react";

import FlagButton from "./common/FlagButton";
import {
  getBucketBackgroundColorTop,
  getBucketFlaggedStyle,
  getInputBorderColor,
} from "./common/colors";
import config from "./config";
import { useData } from "./context/data";
import { getTasksByClosed, getTasksForBucket } from "./context/helper";
import { Bucket, TabContext } from "./types";
import { isSafari } from "./common/helper";

export interface HeaderProps {
  bucket: Bucket;
  context: TabContext;
}

const Header: React.FC<HeaderProps> = (props) => {
  const { bucket, context } = props;
  const { renameBucket, getTasks, flagBucket, setBucketDone } = useData();

  const tasks = getTasks();
  const tasksForbucket = getTasksForBucket(tasks, bucket.id);
  const open = getTasksByClosed(tasksForbucket, false);

  const [inputValue, setInputValue] = useState(bucket?.name);
  const [isTextAreaFocused, setIsTextAreaFocused] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= config.BUCKET_MAX_LENGTH) {
      setInputValue(newValue);
    } else {
      setInputValue(newValue.substring(0, config.BUCKET_MAX_LENGTH));
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
    renameBucket(bucket.id, inputValue);
  }

  const bgTop = getBucketBackgroundColorTop(bucket, tasksForbucket);
  const inputBorder = getInputBorderColor(bucket);

  const flaggedStyles = getBucketFlaggedStyle(bucket, tasksForbucket);

  const hasTasks = tasksForbucket.length > 0;
  const showDone = hasTasks && open.length === 0;

  return (
    <div className={`w-full ${bgTop}`}>
      <div className={` p-1 flex gap-1 flex-row items-center `}>
        <div className="relative w-full">
          <input
            type="text"
            className={`w-full h-8 px-1 text-lg shadow-sm rounded-sm border-b-4 focus:outline-none  ${flaggedStyles} ${inputBorder}`}
            placeholder="Unnamed"
            value={inputValue}
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
        {!showDone && context === TabContext.Group && (
          <>
            <FlagButton
              tasks={tasksForbucket}
              onClick={handleClick}
              bucket={bucket}
            />
          </>
        )}
        {showDone && context === TabContext.Group && (
          <input
            type="checkbox"
            className={`w-7 h-7 accent-green-500
            ring-2 ring-green-500
            ${isSafari() && "safari-only-checkbox-big"} `}
            checked={bucket.done || false}
            onChange={() => setBucketDone(bucket.id, !bucket.done)}
          />
        )}
      </div>
    </div>
  );
};

export default Header;

import React from "react";

import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";

import { useData } from "./context/data";
import { Bucket } from "./types";

import BucketButton from "./common/BucketButton";
import { SquareIcon } from "./common/icons";

export interface SwitchProps {
  text: string;
  hover: string;
  Icon: React.ReactElement;
  HoverIcon: React.ReactElement;
  callback: () => void;
  bucket: Bucket;
}

const Switch: React.FC<SwitchProps> = (props) => {
  const { hover, Icon, bucket, callback, text, HoverIcon } = props;
  return (
    <div>
      <BucketButton
        onClick={callback}
        bucket={bucket}
        className="h-full overflow-y-hidden text-sm text-center group"
      >
        <div className="flex items-center gap-1 cursor-pointer group-hover:hidden">
          {Icon}
          {text}
        </div>
        <div className="items-center hidden gap-1 cursor-pointer group-hover:flex ">
          {HoverIcon}
          {hover}
        </div>
      </BucketButton>
    </div>
  );
};

export interface StateSwitchProps {
  bucket: Bucket;
}

const StateSwitch: React.FC<StateSwitchProps> = (props) => {
  const { bucket } = props;

  const { setBucketActive } = useData();

  if (bucket.active) {
    return (
      <Switch
        bucket={bucket}
        text={"started"}
        Icon={<PlayIcon className="w-4 h-4" />}
        hover={"stop"}
        HoverIcon={<SquareIcon className="w-4 h-4" />}
        callback={() =>
          bucket.tasks.length > 0 ? setBucketActive(bucket.id, false) : null
        }
      />
    );
  }

  return (
    <Switch
      bucket={bucket}
      text={"stopped"}
      hover={"start"}
      Icon={<SquareIcon className="w-3 h-3" />}
      HoverIcon={<PlayIcon className="w-4 h-4" />}
      callback={() => setBucketActive(bucket.id, true)}
    />
  );
};

export default StateSwitch;

import React from "react";

import { BackwardIcon, PauseIcon, PlayIcon } from "@heroicons/react/24/solid";

import { useData } from "./context/data";
import { getBucketState } from "./context/helper";
import { Bucket, BucketState } from "./types";

import BucketButton from "./common/BucketButton";
import { EjectIcon } from "./common/icons";

export interface SwitchProps {
  hover: string;
  Icon: React.ComponentType<any>;
  callback: () => void;
  bucket: Bucket;
}

const Switch: React.FC<SwitchProps> = (props) => {
  const { hover, Icon, bucket, callback } = props;
  return (
    <div>
      <BucketButton
        onClick={callback}
        bucket={bucket}
        className="h-full overflow-y-hidden text-sm text-center group"
      >
        <div className="flex gap-1 cursor-pointer">
          <Icon className={`h-5 w-5`} />
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

  const state = getBucketState(bucket);
  if (state === BucketState.INACTIVE) {
    return (
      <Switch
        bucket={bucket}
        hover={"start"}
        Icon={PlayIcon}
        callback={() =>
          bucket.tasks.length > 0 ? setBucketActive(bucket.id, true) : null
        }
      />
    );
  }
  if (state === BucketState.UNSOLVED) {
    return (
      <Switch
        bucket={bucket}
        hover={"pause"}
        Icon={PauseIcon}
        callback={() => setBucketActive(bucket.id, false)}
      />
    );
  }
  if (state === BucketState.SOLVED) {
    return (
      <Switch
        bucket={bucket}
        hover={"done"}
        Icon={EjectIcon}
        callback={() => setBucketActive(bucket.id, false)}
      />
    );
  }
  if (state === BucketState.DONE) {
    return (
      <Switch
        bucket={bucket}
        hover={"undone"}
        Icon={BackwardIcon}
        callback={() => setBucketActive(bucket.id, true)}
      />
    );
  }

  return null;
};

export default StateSwitch;

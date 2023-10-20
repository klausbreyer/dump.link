import React from "react";

import { BackwardIcon, PauseIcon, PlayIcon } from "@heroicons/react/24/solid";

import { useData } from "./context/data";
import { getBucketState } from "./context/helper";
import { Bucket, BucketState } from "./types";

import { EjectIcon } from "./common/icons";
import BucketButton from "./common/BucketButton";

export interface SwitchProps {
  active: string;
  hover: string;
  Icon: React.ComponentType<any>;
  callback: () => void;
  bucket: Bucket;
}

const Switch: React.FC<SwitchProps> = (props) => {
  const { active, hover, Icon, bucket, callback } = props;
  return (
    <div>
      <BucketButton
        onClick={callback}
        bucket={bucket}
        className="h-full overflow-y-hidden text-sm text-center group"
      >
        <div className="flex gap-1 group-hover:hidden">
          {/* workaround to keep height and not flicker. */}
          <Icon className={`h-5 w-0 invisible`} />
          {active}
        </div>
        <div className="hidden gap-1 cursor-pointer group-hover:flex">
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
        active={"inactive"}
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
        active={"unsolved"}
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
        active={"solved"}
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
        active={"done"}
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

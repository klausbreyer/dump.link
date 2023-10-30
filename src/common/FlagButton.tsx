import { FlagIcon as FlagIconOutline } from "@heroicons/react/24/outline";

import { FlagIcon as FlagIconSolid } from "@heroicons/react/24/solid";
import React from "react";
import { Bucket } from "../types";
import {
  getButtonBackground,
  getFlaggedHeaderTextColor,
  getHeaderTextColor,
  getInputBorderColor,
} from "./colors";

export interface FlagButtonProps {
  bucket: Bucket;
  onClick?: () => void;
}

const FlagButton = React.forwardRef<
  HTMLButtonElement,
  FlagButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  const { bucket, onClick, children, className, ...rest } = props;

  const border = getInputBorderColor(bucket);
  const hover = getButtonBackground(bucket);
  const text = getHeaderTextColor(bucket);

  const flagColor = getFlaggedHeaderTextColor();

  const colors = bucket.flagged
    ? `${flagColor} ${border} ${hover} `
    : `${border} ${hover} ${text}`;

  return (
    <button
      ref={ref}
      onClick={onClick ? () => onClick() : () => {}}
      className={`active:transform active:scale-95 transition-transform duration-150 h-7 p-0.5 rounded-sm shadow-sm focus:outline-none ${colors} ${className} `}
      {...rest}
    >
      {bucket?.flagged ? (
        <FlagIconSolid className="w-5 h-5 " />
      ) : (
        <FlagIconOutline className="w-5 h-5 " />
      )}
    </button>
  );
});

export default FlagButton;

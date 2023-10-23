import React from "react";

import { Bucket } from "../types";
import {
  getBucketBackgroundColorBottom,
  getFlaggedHeaderTextColor,
  getHeaderBorderColor,
  getHeaderHoverColor,
  getHeaderTextColor,
} from "./colors";

export interface BucketButton {
  children: React.ReactNode;
  bucket: Bucket;
  onClick: () => void;
  flag?: boolean;
}

const BucketButton: React.FC<
  BucketButton & React.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  const { bucket, onClick, children, className, flag = false, ...rest } = props;

  const border = getHeaderBorderColor(bucket);
  const hover = getHeaderHoverColor(bucket);
  const text = getHeaderTextColor(bucket);

  const flagColor = getFlaggedHeaderTextColor();

  const colors =
    flag && bucket.flagged
      ? `${flagColor} ${border} ${hover} `
      : `${border} ${hover} ${text}`;

  return (
    <button
      onClick={() => onClick()}
      className={`active:transform active:scale-95 transition-transform duration-150 h-7 p-0.5 rounded-sm border-b shadow-sm focus:outline-none ${colors} ${className} `}
      {...rest}
    >
      {children}
    </button>
  );
};

export default BucketButton;

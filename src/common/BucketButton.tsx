import React from "react";

import { Bucket } from "../types";
import {
  getBucketBackgroundColorBottom,
  getFlaggedHeaderTextColor,
  getActiveBorderColor,
  getHeaderTextColor,
} from "./colors";

export interface BucketButtonProps {
  children: React.ReactNode;
  bucket: Bucket;
  onClick?: () => void;
  flag?: boolean;
}

const BucketButton = React.forwardRef<
  HTMLButtonElement,
  BucketButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  const { bucket, onClick, children, className, flag = false, ...rest } = props;

  const border = getActiveBorderColor(bucket);
  const hover = getBucketBackgroundColorBottom(bucket);
  const text = getHeaderTextColor(bucket);

  const flagColor = getFlaggedHeaderTextColor();

  const colors =
    flag && bucket.flagged
      ? `${flagColor} ${border} ${hover} `
      : `${border} ${hover} ${text}`;

  return (
    <button
      ref={ref}
      onClick={onClick ? () => onClick() : () => {}}
      className={`active:transform active:scale-95 transition-transform duration-150 h-7 p-0.5 rounded-sm border-b shadow-sm focus:outline-none ${colors} ${className} `}
      {...rest}
    >
      {children}
    </button>
  );
});

export default BucketButton;

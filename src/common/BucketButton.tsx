import React from "react";

import { Bucket } from "../types";
import {
  getHeaderBorderColor,
  getHeaderHoverColor,
  getHeaderTextColor,
} from "./colors";

export interface BucketButton {
  children: React.ReactNode;
  bucket: Bucket;
  onClick: () => void;
}

const BucketButton: React.FC<
  BucketButton & React.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  const { bucket, onClick, children, className, ...rest } = props;

  const border = getHeaderBorderColor(bucket);
  const hover = getHeaderHoverColor(bucket);
  const text = getHeaderTextColor(bucket);

  return (
    <button
      onClick={() => onClick()}
      className={` p-0.5 bg-transparent border-2 focus:outline-none ${border} ${hover} ${text} ${className} `}
      {...rest} // Hier fügen wir alle anderen übergebenen Props hinzu
    >
      {children}
    </button>
  );
};

export default BucketButton;

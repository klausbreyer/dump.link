import React from "react";

import { Bucket } from "../types";

export interface BucketButtonProps {
  children: React.ReactNode;
  bucket: Bucket;
  onClick?: () => void;
}

const BucketButton = React.forwardRef<
  HTMLButtonElement,
  BucketButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  const { bucket, onClick, children, className, ...rest } = props;

  return (
    <button
      ref={ref}
      onClick={onClick ? () => onClick() : () => {}}
      className={`${className}  active:transform active:scale-95 transition-transform duration-150 h-7 p-0.5 rounded-sm shadow-sm focus:outline-none bg-sky-300 hover:bg-sky-400 text-black `}
      {...rest}
    >
      {children}
    </button>
  );
});

export default BucketButton;

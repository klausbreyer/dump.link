import React, { forwardRef } from "react";

interface ContainerProps {
  children: React.ReactNode;

  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp?: (e: React.MouseEvent<HTMLDivElement>) => void;
}
const Container = forwardRef<HTMLDivElement, ContainerProps>((props, ref) => {
  return (
    <div
      className="mx-auto max-w-7xl sm:px-6 lg:px-8 min-w-[1024px]"
      ref={ref}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
    >
      {props.children}
    </div>
  );
});
export default Container;

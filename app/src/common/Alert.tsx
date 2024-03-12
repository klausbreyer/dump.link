import React, { forwardRef } from "react";

interface AlertProps {
  children: React.ReactNode;
}
const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return (
    <div className="max-w-screen-md mx-auto m-10" ref={ref}>
      {props.children}
    </div>
  );
});
export default Alert;

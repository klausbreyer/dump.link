import React from "react";

export interface InfoButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const InfoButton = React.forwardRef<
  HTMLButtonElement,
  InfoButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  const { onClick, children, className, ...rest } = props;

  return (
    <button
      ref={ref}
      onClick={onClick ? () => onClick() : () => {}}
      className={`${className} inline-flex justify-center px-4 py-2 text-sm font-medium text-slate-900 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2`}
      {...rest}
    >
      {children}
    </button>
  );
});

export default InfoButton;

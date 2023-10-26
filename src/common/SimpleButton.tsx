import React from "react";

type ButtonColor =
  | "blue"
  | "slate"
  | "yellow"
  | "orange"
  | "red"
  | "green"
  | "amber"
  | "purple"
  | "pink"
  | "rose";

export interface SimpleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: ButtonColor;
}

const SimpleButton = React.forwardRef<
  HTMLButtonElement,
  SimpleButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  const { children, onClick, className, color, ...rest } = props;

  // Default custom styles
  const defaultStyles = "py-1 px-2 mt-4 rounded-md shadow-lg border-b-2 ";

  // Map color names to Tailwind classes
  const colorMap: Record<ButtonColor, string> = {
    blue: "bg-blue-200 hover:bg-blue-300 border-blue-700",
    slate: "bg-slate-200 hover:bg-slate-300 border-slate-700",
    yellow: "bg-yellow-200 hover:bg-yellow-300 border-yellow-700",
    orange: "bg-orange-200 hover:bg-orange-300 border-orange-700",
    red: "bg-red-200 hover:bg-red-300 border-red-700",
    green: "bg-green-200 hover:bg-green-300 border-green-700",
    amber: "bg-amber-200 hover:bg-amber-300 border-amber-700",
    purple: "bg-purple-200 hover:bg-purple-300 border-purple-700",
    pink: "bg-pink-200 hover:bg-pink-300 border-pink-700",
    rose: "bg-rose-200 hover:bg-rose-300 border-rose-700",
  };

  // Use color-specific styles if color prop is provided
  const colorStyles = color ? colorMap[color] : "";

  // Combine all styles
  const combinedStyles = `${defaultStyles} ${colorStyles} ${className}`;

  return (
    <button
      ref={ref}
      onClick={onClick ? () => onClick() : () => {}}
      className={combinedStyles}
      {...rest}
    >
      {children}
    </button>
  );
});

export default SimpleButton;

import React from "react";

type ButtonColor =
  | "indigo"
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
  const defaultStyles = "py-1 px-2 rounded-md shadow-lg border-b-2 ";

  // Map color names to Tailwind classes
  const colorMap: Record<ButtonColor, string> = {
    indigo: "bg-indigo-300 hover:bg-indigo-400 border-indigo-700",
    slate: "bg-slate-300 hover:bg-slate-400 border-slate-700",
    yellow: "bg-yellow-300 hover:bg-yellow-400 border-yellow-700",
    orange: "bg-orange-300 hover:bg-orange-400 border-orange-700",
    red: "bg-red-300 hover:bg-red-400 border-red-700",
    green: "bg-green-300 hover:bg-green-400 border-green-700",
    amber: "bg-amber-300 hover:bg-amber-400 border-amber-700",
    purple: "bg-purple-300 hover:bg-purple-400 border-purple-700",
    pink: "bg-pink-300 hover:bg-pink-400 border-pink-700",
    rose: "bg-rose-300 hover:bg-rose-400 border-rose-700",
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

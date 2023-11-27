import React from "react";

export interface InfoButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: keyof typeof colorMap;
}
// Map color names to Tailwind classes
const colorMap = {
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

const InfoButton = React.forwardRef<
  HTMLButtonElement,
  InfoButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  const {
    onClick,
    children,
    disabled,
    className,
    color = "slate",
    ...rest
  } = props;

  const colorClass = colorMap[color] || colorMap.slate;
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      disabled={disabled}
      ref={ref}
      onClick={onClick ? () => onClick() : () => {}}
      className={`${className} ${disabledClass} inline-flex justify-center px-4 py-2 text-sm font-medium text-slate-900 ${colorClass} border border-transparent rounded-md hover:ring-2 hover:ring-slate-500 hover:ring-offset-2`}
      {...rest}
    >
      {children}
    </button>
  );
});

export default InfoButton;
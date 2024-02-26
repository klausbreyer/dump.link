import React from "react";

// Map color names to Tailwind classes
const colorMap = {
  indigo:
    "bg-indigo-300 hover:bg-indigo-400 border-indigo-700 ring-indigo-700 text-indigo-900",
  slate:
    "bg-slate-300 hover:bg-slate-400 border-slate-700 ring-slate-700 text-slate-900",
  yellow:
    "bg-yellow-300 hover:bg-yellow-400 border-yellow-700 ring-yellow-700 text-yellow-900",
  orange:
    "bg-orange-300 hover:bg-orange-400 border-orange-700 ring-orange-700 text-orange-900",
  red: "bg-red-300 hover:bg-red-400 border-red-700 ring-red-700 text-red-900",
  green:
    "bg-green-300 hover:bg-green-400 border-green-700 ring-green-700 text-green-900",
  amber:
    "bg-amber-300 hover:bg-amber-400 border-amber-700 ring-amber-700 text-amber-900",
  purple:
    "bg-purple-300 hover:bg-purple-400 border-purple-700 ring-purple-700 text-purple-900",
  violet:
    "bg-violet-300 hover:bg-violet-400 border-violet-700 ring-violet-700 text-violet-900",
  pink: "bg-pink-300 hover:bg-pink-400 border-pink-700 ring-pink-700 text-pink-900",
  rose: "bg-rose-300 hover:bg-rose-400 border-rose-700 ring-rose-700 text-rose-900",
  gray: "bg-gray-300 hover:bg-gray-400 border-gray-700 ring-gray-700 text-gray-900",
  blue: "bg-blue-300 hover:bg-blue-400 border-blue-700 ring-blue-700 text-blue-900",
  white:
    "bg-white hover:bg-slate-100 border-slate-700 ring-slate-700 text-slate-900",
};

export function getButtonClasses(
  color: keyof typeof colorMap,
  disabled?: boolean,
  className?: string,
) {
  const colorClass = colorMap[color] || colorMap.slate;
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";
  return `${className} inline-flex justify-center px-4 py-2 text-sm font-medium text-slate-900 ${colorClass} border border-transparent rounded-md hover:ring-2 hover:ring-offset-2 ${disabledClass}`;
}

export interface InfoButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: keyof typeof colorMap;
  href?: string;
  type?: "button" | "submit" | "reset";
  target?: string;
}
const InfoButton: React.FC<
  InfoButtonProps &
    React.ButtonHTMLAttributes<HTMLButtonElement> &
    React.AnchorHTMLAttributes<HTMLAnchorElement>
> = ({
  onClick,
  children,
  href,
  disabled = false,
  className = "",
  type = "button",
  target = "_self",
  color = "slate",
  ...rest
}) => {
  const buttonClasses = getButtonClasses(color, disabled, className);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  if (href) {
    return (
      <a href={href} target={target} className={buttonClasses} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      type={type}
      className={buttonClasses}
      {...rest}
    >
      {children}
    </button>
  );
};

export default InfoButton;

import { Dialog } from "@headlessui/react";
import React, { ReactNode } from "react";
interface TitleProps {
  children: ReactNode;
  className?: string;
}

const Title: React.FC<TitleProps> = ({ children, className }) => {
  return (
    <h3
      className={`text-lg font-medium leading-6 text-gray-900 mb-2 ${className}`}
    >
      {children}
    </h3>
  );
};

export default Title;

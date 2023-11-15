import React from "react";

interface TitleProps {
  title: string;
}

const Title: React.FC<TitleProps> = ({ title }) => {
  return (
    <div
      className={` px-1 py-2 w-full border-slate-500 text-lg font-bold
        `}
    >
      {title}
    </div>
  );
};

export default Title;

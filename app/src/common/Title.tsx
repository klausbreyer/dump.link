import React from "react";
interface TitleProps {
  title: string;
}

const Title: React.FC<TitleProps> = ({ title }) => {
  return (
    <div className="gap-2 px-1 py-2 text-lg font-bold border-slate-500">
      {title}
    </div>
  );
};

export default Title;

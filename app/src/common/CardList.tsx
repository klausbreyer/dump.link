import React from "react";

interface CardListProps {
  children: React.ReactNode;
}

const CardList: React.FC<CardListProps> = ({ children }) => {
  return (
    <div className="flex flex-col gap-2 pt-2 pb-2 pl-1 pr-1">{children}</div>
  );
};

export default CardList;

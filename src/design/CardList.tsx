import React from "react";

interface CardListProps {
  children: React.ReactNode;
}

const CardList: React.FC<CardListProps> = ({ children }) => {
  return <div className="grid grid-cols-1 gap-2">{children}</div>;
};

export default CardList;

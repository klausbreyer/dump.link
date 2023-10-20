import React, { SVGProps } from 'react';

export const ArrowIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="15"
      height="15"
      version="1.1"
      viewBox="0 0 1200 1200"
      xmlns="http://www.w3.org/2000/svg"
      {...props} // Spread-Operator for all the props
    >
      <path
        d="m1200 77.418-326.27 1083.9c-16.59 44.238-77.418 55.301-105.07 16.59l-243.32-309.68-309.68 309.68c-22.121 22.121-60.828 22.121-82.949 0l-110.6-110.6c-22.121-22.121-22.121-60.828 0-82.949l309.68-309.68-309.68-243.32c-38.711-27.648-27.648-88.48 22.121-99.539l1083.9-331.8c44.238-11.059 82.949 33.18 71.891 77.418z"
        fillRule="evenodd"
      />
    </svg>
  );
};

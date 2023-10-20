import React, { SVGProps } from "react";

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
        fill="currentColor"
      />
    </svg>
  );
};
export const EjectIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="1200pt"
      height="1200pt"
      version="1.1"
      viewBox="0 0 1200 1200"
      {...props} // Spread-Operator for all the props
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m930.62 812.55c0-39.133-31.715-70.848-70.848-70.848h-519.55c-39.133 0-70.852 31.715-70.852 70.848v23.617c0 39.129 31.719 70.848 70.852 70.848h519.55c39.133 0 70.848-31.719 70.848-70.848zm-66.973-117.91c28.668 0 54.504-17.266 65.465-43.738 10.957-26.473 4.9102-56.938-15.352-77.199l-263.68-263.65c-27.652-27.676-72.523-27.676-100.18 0l-263.67 263.65c-20.262 20.262-26.309 50.727-15.352 77.199 10.961 26.473 36.797 43.738 65.465 43.738z"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
};

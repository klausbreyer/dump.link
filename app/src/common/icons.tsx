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

export const SquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="1200"
      height="1200"
      viewBox="0 0 1200 1200"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="m75 37.5h1050c20.711 0 37.5 20.711 37.5 37.5v1050c0 20.711-16.789 37.5-37.5 37.5h-1050c-20.711 0-37.5-20.711-37.5-37.5v-1050c0-20.711 16.789-37.5 37.5-37.5z"
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
export const GroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="1229"
      height="1229"
      version="1.1"
      viewBox="0 0 1229 1229"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>grouping</title>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <rect
          fill="currentColor"
          x="497"
          y="382"
          width="323"
          height="116"
        ></rect>
        <rect
          fill="currentColor"
          x="497"
          y="555"
          width="323"
          height="116"
        ></rect>
        <rect
          fill="currentColor"
          x="497"
          y="729"
          width="323"
          height="116"
        ></rect>
        <rect
          fill="currentColor"
          x="497"
          y="902"
          width="323"
          height="116"
        ></rect>
        <rect
          fill="currentColor"
          x="905"
          y="207"
          width="323"
          height="116"
        ></rect>
        <rect
          fill="currentColor"
          x="905"
          y="382"
          width="323"
          height="116"
        ></rect>
        <rect
          fill="currentColor"
          x="905"
          y="556"
          width="323"
          height="115"
        ></rect>
        <rect
          fill="currentColor"
          x="905"
          y="729"
          width="323"
          height="116"
        ></rect>
        <rect
          fill="currentColor"
          x="906"
          y="902"
          width="323"
          height="116"
        ></rect>
        <rect
          fill="currentColor"
          x="497"
          y="207"
          width="323"
          height="116"
        ></rect>
        <rect fill="currentColor" x="0" y="207" width="397" height="811"></rect>
      </g>
    </svg>
  );
};

export const ArrangeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="1229"
      height="1229"
      version="1.1"
      viewBox="0 0 1229 1229"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>ordering</title>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <path
          d="M445.475976,355.648545 L463.413716,373.06226 L726.166,628.138 L797.214242,554.95293 L891,823 L620.290889,737.200365 L691.338,664.014 L428.586284,408.93774 L410.648545,391.524024 L445.475976,355.648545 Z"
          fill="currentColor"
          fillRule="nonzero"
        ></path>
        <path
          d="M284.763769,411.593236 L332.406764,426.763769 L324.821497,450.585266 L280.887,588.558 L378.079512,619.50674 L180,823 L136.053099,542.440434 L233.244,573.388 L277.178503,435.414734 L284.763769,411.593236 Z"
          fill="currentColor"
          fillRule="nonzero"
        ></path>
        <rect
          fill="currentColor"
          x="121"
          y="215"
          width="360"
          height="228"
        ></rect>
        <rect fill="currentColor" x="0" y="797" width="360" height="228"></rect>
        <rect
          fill="currentColor"
          x="869"
          y="797"
          width="360"
          height="228"
        ></rect>
      </g>
    </svg>
  );
};

export const SequenceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => {
  return (
    <svg
      width="1229"
      height="1229"
      viewBox="0 0 1229 1229"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <path
          d="M0,334 L280.22298,380.044341 L220.418,462.672 L872.657939,934.747968 L892.909972,949.405907 L863.594093,989.909972 L843.342061,975.252032 L191.102,503.176 L131.298316,585.804989 L0,334 Z"
          fill="currentColor"
          fillRule="nonzero"
        ></path>
        <path
          d="M975,230 L1229,357 L975,484 L975,382 L353,382 L353,332 L975,332 L975,230 Z"
          fill="currentColor"
          fillRule="nonzero"
        ></path>
        <path
          d="M1229.97154,583.98441 L1244.01559,631.971541 L1220.02202,638.993565 L250.796,922.649 L279.446507,1020.54354 L0,970 L208.102739,776.76892 L236.752,874.662 L1205.97798,591.006435 L1229.97154,583.98441 Z"
          fill="currentColor"
          fillRule="nonzero"
        ></path>
      </g>
    </svg>
  );
};
export const DumplinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => {
  return (
    <svg
      width="984"
      height="984"
      viewBox="0 0 984 984"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M492,0 C220.8,0 0,220.8 0,492 C0,763.2 220.8,984 492,984 C763.2,984 984,763.2 984,492 C984,220.8 763.2,0 492,0 Z M756,588 C756,601.199 745.199,612 732,612 L252,612 C238.801,612 228,601.199 228,588 L228,540 C228,394.8 346.8,276 492,276 C637.2,276 756,394.8 756,540 L756,588 Z M492,324 C373.2,324 276,421.199 276,540 L276,564 L708,564 L708,540 C708,421.2 610.801,324 492,324 Z M588,492 L396,492 C382.801,492 372,481.199 372,468 C372,454.801 382.801,444 396,444 L588,444 C601.199,444 612,454.801 612,468 C612,481.199 601.199,492 588,492 Z"
        fill="currentColor"
      />
    </svg>
  );
};

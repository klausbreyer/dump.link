import React, { forwardRef } from "react";

import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";
import { links } from "../Routing";
interface AlertProps {
  children: React.ReactNode;
}
const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return (
    <div className="max-w-screen-md m-10 mx-auto" ref={ref}>
      {props.children}
    </div>
  );
});
export default Alert;

export const LoginRequired: React.FC = () => {
  return (
    <Alert>
      <div className="p-4 rounded-md bg-yellow-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon
              className="w-5 h-5 text-yellow-400"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Login Required
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Unauthorized. Please Login to continue and unlock the full
                features of your account.
              </p>
            </div>
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <Link
                  to={links.login}
                  className="rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Alert>
  );
};

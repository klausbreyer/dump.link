import { useAuth0 } from "@auth0/auth0-react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../types";
import InfoButton, { getButtonClasses } from "../common/InfoButton";
import { DumplinkIcon } from "../common/icons";

const navigation = [
  { name: "Projects", href: AppContext.Dashboard, current: true },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function DLMenu() {
  const { isAuthenticated, user, logout, loginWithRedirect } = useAuth0();

  const userNavigation = [
    {
      name: "Sign out",
      onclick: () =>
        logout({ logoutParams: { returnTo: window.location.origin } }),
    },
  ];

  return (
    <>
      <div className="min-h-full bg-slate-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link className="flex-shrink-0" to="/">
                <DumplinkIcon className={`w-10 h-10 text-white `} />
              </Link>

              <div className="block">
                {isAuthenticated && (
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          item.current
                            ? "bg-slate-700 text-white"
                            : "text-white hover:bg-slate-500 hover:bg-opacity-75",
                          "rounded-md px-3 py-2 text-sm font-medium",
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="block">
              {!isAuthenticated && (
                <div className="flex gap-4">
                  <InfoButton color="white" onClick={() => loginWithRedirect()}>
                    Login
                  </InfoButton>
                  <InfoButton
                    color="white"
                    onClick={() =>
                      loginWithRedirect({
                        authorizationParams: { screen_hint: "signup" },
                      })
                    }
                  >
                    Signup
                  </InfoButton>
                </div>
              )}
              {isAuthenticated && user && (
                <div className="flex items-center ml-6">
                  <Link
                    to={AppContext.New}
                    className={getButtonClasses("white")}
                  >
                    🥟 Make dumplink
                  </Link>
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button
                        title={user.email}
                        className="relative flex max-w-xs items-center rounded-full bg-slate-600 text-sm focus:outline-none hover:ring-2 hover:ring-offset-2  focus:ring-2 focus:ring-offset-2 ring-slate-700"
                      >
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.picture}
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <a
                                onClick={item.onclick}
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700",
                                )}
                              >
                                {item.name}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

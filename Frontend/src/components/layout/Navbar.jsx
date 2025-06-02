import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { UserCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="h-14 border-b border-border bg-card">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-semibold">Notion Clone</span>
        </div>

        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center space-x-2 hover:bg-secondary p-2 rounded-md">
            <UserCircleIcon className="w-6 h-6" />
            <span className="text-sm">{user?.email}</span>
            <ChevronDownIcon className="w-4 h-4" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-card border border-border rounded-md shadow-lg focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate("/profile")}
                      className={`${
                        active ? "bg-secondary" : ""
                      } block w-full text-left px-4 py-2 text-sm`}
                    >
                      Your Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate("/settings")}
                      className={`${
                        active ? "bg-secondary" : ""
                      } block w-full text-left px-4 py-2 text-sm`}
                    >
                      Settings
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active
                          ? "bg-secondary text-destructive"
                          : "text-destructive"
                      } block w-full text-left px-4 py-2 text-sm`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </nav>
  );
}

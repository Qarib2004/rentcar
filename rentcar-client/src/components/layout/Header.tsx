import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Car,
  ClipboardPlus,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLogout } from "@/features/auth/hooks/useAuth";
import NotificationsDropdown from "@/features/notifications/components/NotificationsDropdown";
import { ROUTES } from "@/lib/utils/constants";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils"; 

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: logout } = useLogout();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location]);

  const publicNavigation = [
    { name: "Home", href: ROUTES.HOME },
    { name: "Cars", href: ROUTES.CARS },
    { name: "About", href: ROUTES.ABOUT },
  ];

  const privateNavigation = [{ name: "My bookings", href: ROUTES.BOOKINGS }];

  const navigation = isAuthenticated
    ? [...publicNavigation, ...privateNavigation]
    : publicNavigation;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link
              to={ROUTES.HOME}
              className="group flex items-center space-x-2 transition-transform active:scale-95"
            >
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-blue-200 shadow-lg group-hover:bg-blue-700 transition-colors">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                Rent<span className="text-blue-600">Car</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationsDropdown />

                {user?.role === UserRole.ADMIN && (
                  <Link to={ROUTES.DASHBOARD}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </Link>
                )}

                <div className="relative ml-2">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-1 pr-3 rounded-full border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-all shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </div>
                    <span className="hidden sm:inline-block text-sm font-semibold text-gray-700">
                      {user?.firstName}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-gray-400 transition-transform",
                        isProfileMenuOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsProfileMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl bg-white ring-1 ring-black/5 z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            Account
                          </p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="p-1">
                          <DropdownItem
                            to={ROUTES.PROFILE}
                            icon={<User className="h-4 w-4" />}
                            label="Profile"
                          />
                          <DropdownItem
                            to={ROUTES.MyCARS}
                            icon={<Car className="h-4 w-4" />}
                            label="My Cars"
                          />
                          <DropdownItem
                            to={ROUTES.CREATE_CAR}
                            icon={<ClipboardPlus className="h-4 w-4" />}
                            label="Add Vehicle"
                          />
                          <DropdownItem
                            to={ROUTES.CHAT}
                            icon={<MessageCircle className="h-4 w-4" />}
                            label="Messages"
                          />
                          <DropdownItem
                            to={ROUTES.SETTINGS}
                            icon={<Settings className="h-4 w-4" />}
                            label="Settings"
                          />
                        </div>
                        <div className="p-1 border-t border-gray-100">
                          <button
                            onClick={() => logout()}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                          >
                            <LogOut className="mr-3 h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" className="rounded-full">
                    Login
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "block px-4 py-3 rounded-xl text-base font-semibold transition-colors",
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {item.name}
              </Link>
            ))}

            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-3 mt-4 px-2">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="outline" className="w-full rounded-xl">
                    Login
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button className="w-full rounded-xl">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function DropdownItem({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
    >
      <span className="mr-3 text-gray-400 group-hover:text-blue-500 transition-colors">
        {icon}
      </span>
      {label}
    </Link>
  );
}

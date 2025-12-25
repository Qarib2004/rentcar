import { Link } from 'react-router-dom'
import { Menu, X, User, LogOut, Settings, Car, ClipboardPlus, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useLogout } from '@/features/auth/hooks/useAuth'
import NotificationsDropdown from '@/features/notifications/components/NotificationsDropdown'
import { ROUTES } from '@/lib/utils/constants'
import { Button } from '@/components/ui/button'
import { UserRole } from '@/types'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const { user, isAuthenticated } = useAuthStore()
  const { mutate: logout } = useLogout()

  const publicNavigation = [
    { name: 'Home', href: ROUTES.HOME },
    { name: 'Cars', href: ROUTES.CARS },
    { name: 'About', href: ROUTES.ABOUT },
  ]

  const privateNavigation = [
    { name: 'My Bookings', href: ROUTES.BOOKINGS },
  ]

  const navigation = isAuthenticated 
    ? [...publicNavigation, ...privateNavigation]
    : publicNavigation

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={ROUTES.HOME} className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-gray-900">RentCar</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-blue-500 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:block">
                  <NotificationsDropdown />
                </div>
                {user?.role === UserRole.ADMIN && (
                  <Link
                    to={ROUTES.DASHBOARD}
                    className="hidden md:flex items-center text-gray-700 hover:text-blue-500 transition-colors"
                    title="Admin Panel"
                  >
                    <Settings className="h-6 w-6" />
                  </Link>
                )}

                <div className="hidden md:block relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <span className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </button>

                  {isProfileMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsProfileMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                        <div className="py-1">
                          <Link
                            to={ROUTES.PROFILE}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <User className="mr-3 h-4 w-4" />
                            Profile
                          </Link>
                          <Link
                            to={ROUTES.MyCARS}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Car className="mr-3 h-4 w-4" />
                            My Cars
                          </Link>
                          <Link
                            to={ROUTES.CREATE_CAR}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <ClipboardPlus className="mr-3 h-4 w-4" />
                            Create Car
                          </Link>
                          <Link
                            to={ROUTES.CHAT}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <MessageCircle className="mr-3 h-4 w-4" />
                            Chat
                          </Link>
                          <Link
                            to={ROUTES.SETTINGS}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Settings className="mr-3 h-4 w-4" />
                            Settings
                          </Link>
                          <hr className="my-1" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <LogOut className="mr-3 h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  <hr className="my-2" />
                  <Link
                    to={ROUTES.PROFILE}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to={ROUTES.MyCARS}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Cars
                  </Link>
                  <Link
                    to={ROUTES.CREATE_CAR}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Create Car
                  </Link>
                  <Link
                    to={ROUTES.CHAT}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Chat
                  </Link>
                  <Link
                    to={ROUTES.SETTINGS}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <div className="space-y-2 px-3">
                    <Link
                      to={ROUTES.LOGIN}
                      className="block w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" className="w-full">Login</Button>
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      className="block w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full">Sign up</Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
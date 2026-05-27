import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  Home, 
  Ticket, 
  User, 
  Settings, 
  LogOut,
  Search,
  Calendar,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UserLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
}

const UserLayout: React.FC<UserLayoutProps> = ({ 
  children, 
  pageTitle, 
  pageSubtitle 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Build navigation items based on user role
  const navigationItems = [
    {
      name: 'Dashboard',
      href: user?.role === 'busman' ? '/busman/dashboard' : '/dashboard',
      icon: Home,
    },
    ...(user?.role === 'busman' 
      ? []
      : [
          {
            name: 'My Tickets',
            href: '/dashboard/tickets',
            icon: Ticket,
          },
          {
            name: 'Search Buses',
            href: '/',
            icon: Search,
          }
        ]
    ),
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-40 h-full transition-all duration-300 shadow-lg",
        "bg-[#002c2b]",
        isSidebarOpen ? "w-64" : "w-16",
        "md:translate-x-0",
        "md:block"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            "flex items-center border-b border-white/20 transition-all duration-300",
            isSidebarOpen ? "justify-between px-4 py-5" : "justify-center px-2 py-5"
          )}>
            {isSidebarOpen ? (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src="/uploads/36cb789c-33f7-4773-9d74-d74642c0307d.png"
                    alt="ETA Logo"
                    className="h-8 w-auto"
                  />
                  <h1 className="text-lg font-bold text-white">ETA</h1>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="text-white hover:bg-white/10 flex-shrink-0"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-white hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* User Info */}
          {isSidebarOpen && (
            <div className="px-4 py-4 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-white/70 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      "hover:bg-white/10 text-white/80 hover:text-white",
                      isActive && "bg-white/20 text-white",
                      !isSidebarOpen && "justify-center px-2"
                    )
                  }
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="truncate">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-2 border-t border-white/20">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "w-full justify-start text-white/80 hover:text-white hover:bg-white/10",
                !isSidebarOpen && "justify-center px-2"
              )}
              title={!isSidebarOpen ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3">Logout</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300",
        isSidebarOpen ? "ml-64" : "ml-16"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
                {pageSubtitle && (
                  <p className="text-sm text-gray-600">{pageSubtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="text-[#002c2b] border-[#002c2b] hover:bg-[#002c2b] hover:text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Buses
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;


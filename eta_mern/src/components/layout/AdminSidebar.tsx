
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, MapPin, Ticket, BarChart3, Settings, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
  collapsed?: boolean;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ to, icon, label, end = false, collapsed = false }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => 
        cn(
          "flex items-center px-3 py-2 rounded-md text-white/80 hover:bg-white/10 transition-colors",
          collapsed ? "justify-center" : "gap-3",
          isActive ? "bg-white/20 text-white font-medium" : "text-white/80"
        )
      }
    >
      <span className="text-white">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const handleLogout = () => {
    // TODO: Implement actual logout logic
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <div className={cn(
        "fixed top-0 left-0 z-40 h-full transition-all duration-300 shadow-lg",
        "bg-[#002c2b]",
        isSidebarOpen ? "w-64" : "w-16",
        "md:translate-x-0",
        "md:block"
      )}>
        <div className="flex flex-col h-full">
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
          
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <div className="space-y-1"> 
              <SidebarNavItem 
                to="/admin/dashboard" 
                icon={<LayoutDashboard size={20} />} 
                label="Dashboard" 
                end 
                collapsed={!isSidebarOpen}
              />
              <SidebarNavItem 
                to="/admin/schedules" 
                icon={<Calendar size={20} />}
                label="Schedules" 
                collapsed={!isSidebarOpen}
              />
              <SidebarNavItem 
                to="/admin/routes" 
                icon={<MapPin size={20} />} 
                label="Routes" 
                collapsed={!isSidebarOpen}
              />
              <SidebarNavItem 
                to="/admin/tickets" 
                icon={<Ticket size={20} />} 
                label="Tickets" 
                collapsed={!isSidebarOpen}
              />
              <SidebarNavItem 
                to="/admin/busmen" 
                icon={<MapPin size={20} />} 
                label="Busmen" 
                collapsed={!isSidebarOpen}
              />
              <SidebarNavItem 
                to="/admin/reports" 
                icon={<BarChart3 size={20} />} 
                label="Reports" 
                collapsed={!isSidebarOpen}
              />
            </div>
          </nav>
          
          <div className="p-4 border-t border-white/20">
            <div className={cn(
              "flex items-center gap-3 transition-opacity duration-300 mb-3",
              isSidebarOpen ? "opacity-100" : "opacity-0"
            )}>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white flex-shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-xs text-white/70 truncate">admin@eta.com</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={cn(
                "text-white/80 hover:bg-white/10 hover:text-white transition-colors",
                isSidebarOpen ? "w-full justify-start" : "w-8 h-8 p-0"
              )}
            >
              <LogOut size={16} />
              {isSidebarOpen && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  showSearchButton?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ showSearchButton = true, className = '' }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className={`bg-white shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0"
            onClick={() => navigate('/')}
          >
            <img 
              src="/uploads/36cb789c-33f7-4773-9d74-d74642c0307d.png" 
              alt="ETA Logo" 
              className="h-8 sm:h-10 w-auto"
            />
            <span className="text-base sm:text-xl font-bold text-[#002c2b] truncate">E-Tickets Albania</span>
          </div>
          
          <div className="hidden sm:flex flex-wrap items-center gap-2 justify-end">
            {showSearchButton && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="text-[#002c2b] border-[#002c2b] hover:bg-[#002c2b] hover:text-white px-3 py-2 text-sm"
              >
                Search Buses
              </Button>
            )}
            
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">Welcome, {user?.fullName}</span>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  className="text-[#002c2b] border-[#002c2b] hover:bg-[#002c2b] hover:text-white px-3 py-2 text-sm"
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/profile')}
                  className="bg-[#002c2b] hover:bg-[#003a37] text-white px-3 py-2 text-sm"
                >
                  Profile
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth')}
                  className="text-[#002c2b] border-[#002c2b] hover:bg-[#002c2b] hover:text-white px-3 py-2 text-sm"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-[#002c2b] hover:bg-[#003a37] text-white px-3 py-2 text-sm"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          <div className="flex sm:hidden items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="text-[#002c2b] border-[#002c2b] hover:bg-[#002c2b] hover:text-white px-3 py-2 text-sm"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[12rem]">
                {isAuthenticated && (
                  <>
                    <DropdownMenuLabel>Welcome, {user?.fullName}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                {showSearchButton && (
                  <DropdownMenuItem onSelect={() => navigate('/')}>Search Buses</DropdownMenuItem>
                )}
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem onSelect={() => navigate('/dashboard')}>Dashboard</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate('/profile')}>Profile</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onSelect={() => navigate('/auth')}>Sign In</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate('/auth')}>Sign Up</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

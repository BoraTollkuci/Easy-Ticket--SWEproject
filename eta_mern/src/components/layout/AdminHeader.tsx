
import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, children }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center space-x-2">
        {children}
      </div>
    </div>
  );
};

interface AdminHeaderProps {
  pageTitle: string;
  pageSubtitle?: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ pageTitle, pageSubtitle, actions, onMenuClick }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-background border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative w-full max-w-sm hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-9 w-full bg-muted/50" 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
              3
            </Badge>
          </Button>
        </div>
      </div>

      <div className="container py-4">
        <PageHeader title={pageTitle} subtitle={pageSubtitle}>
          {actions}
        </PageHeader>
      </div>
    </header>
  );
};

export default AdminHeader;
export { PageHeader };

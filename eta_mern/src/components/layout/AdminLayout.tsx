
import React, { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
  actions?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children,
  pageTitle,
  pageSubtitle,
  actions
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      
      <div className={cn(
        "transition-all duration-300",
        isSidebarOpen ? "ml-64" : "ml-16"
      )}>
        <AdminHeader 
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          actions={actions}
          onMenuClick={toggleSidebar}
        />
        <main className="container py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

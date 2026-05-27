
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardAPI } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';
import StatCard from '@/components/dashboard/StatCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import PopularRoutesChart from '@/components/dashboard/PopularRoutesChart';
import { Calendar, MapPin, Ticket, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: DashboardAPI.getStats,
  });

  const { data: revenueByDay, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['revenueByDay'],
    queryFn: DashboardAPI.getRevenueByDay,
  });

  const { data: revenueByRoute, isLoading: isLoadingRouteRevenue } = useQuery({
    queryKey: ['revenueByRoute'],
    queryFn: DashboardAPI.getRevenueByRoute,
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <AdminLayout
      pageTitle="Dashboard"
      pageSubtitle="Overview of system performance and key metrics"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Routes"
            value={stats?.totalRoutes || 0}
            icon={<MapPin className="h-8 w-8" />}
          />
          <StatCard
            title="Active Schedules"
            value={stats?.activeSchedules || 0}
            icon={<Calendar className="h-8 w-8" />}
          />
          <StatCard
            title="Available Tickets"
            value={stats?.availableTickets || 0}
            icon={<Ticket className="h-8 w-8" />}
          />
          <StatCard
            title="Today's Bookings"
            value={stats?.todayBookings || 0}
            trend={{ value: 12, positive: true }}
            icon={<DollarSign className="h-8 w-8" />}
          />
        </div>

        {/* Revenue Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="Weekly Revenue"
            value={formatCurrency(stats?.weeklyRevenue || 0)}
            description="Last 7 days"
            trend={{ value: 8.2, positive: true }}
            className="md:col-span-1"
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(stats?.monthlyRevenue || 0)}
            description="Last 30 days"
            trend={{ value: 4.6, positive: true }}
            className="md:col-span-1"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {revenueByDay && <RevenueChart data={revenueByDay} className="md:col-span-1" />}
          {revenueByRoute && <PopularRoutesChart data={revenueByRoute} className="md:col-span-1" />}
        </div>

        {/* Popular Routes & Recent Transactions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Popular Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {stats?.popularRoutes.map((route, index) => (
                  <li key={index} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                    <span className="font-medium">{route.routeName}</span>
                    <span className="text-muted-foreground">{route.bookingCount} bookings</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {stats?.recentTransactions.map((transaction) => (
                  <li key={transaction.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                    <div>
                      <div className="font-medium">{transaction.customerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(transaction.amount)}</span>
                      <Badge 
                        variant="outline" 
                        className={
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : 
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                          'bg-red-100 text-red-800 border-red-200'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;


import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardAPI } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';
import RevenueChart from '@/components/dashboard/RevenueChart';
import PopularRoutesChart from '@/components/dashboard/PopularRoutesChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Reports = () => {
  const [dateRange, setDateRange] = useState('week');
  
  const { data: revenueByDay } = useQuery({
    queryKey: ['revenueByDay'],
    queryFn: DashboardAPI.getRevenueByDay,
  });

  const { data: revenueByRoute } = useQuery({
    queryKey: ['revenueByRoute'],
    queryFn: DashboardAPI.getRevenueByRoute,
  });

  return (
    <AdminLayout
      pageTitle="Reports"
      pageSubtitle="View sales and performance analytics"
      actions={
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export Reports
        </Button>
      }
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Time Period:</span>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="quarter">Last 90 Days</SelectItem>
            <SelectItem value="year">Last 365 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <div className="grid gap-6">
            {/* Revenue Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$47,250</div>
                  <p className="text-sm text-muted-foreground">+12.5% from previous period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average Ticket Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$126.75</div>
                  <p className="text-sm text-muted-foreground">-2.3% from previous period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Sold</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">373</div>
                  <p className="text-sm text-muted-foreground">+8.7% from previous period</p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              {revenueByDay && <RevenueChart data={revenueByDay} />}
              {revenueByRoute && <PopularRoutesChart data={revenueByRoute} />}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <CardTitle>Route Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium text-muted-foreground">Route Name</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Total Trips</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Total Tickets</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Avg. Occupancy</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-muted/50">
                        <td className="p-3 border-t border-border">Northeast Express</td>
                        <td className="p-3 border-t border-border text-center">28</td>
                        <td className="p-3 border-t border-border text-center">156</td>
                        <td className="p-3 border-t border-border text-center">78%</td>
                        <td className="p-3 border-t border-border text-right">$18,720</td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-3 border-t border-border">Eastern Corridor</td>
                        <td className="p-3 border-t border-border text-center">32</td>
                        <td className="p-3 border-t border-border text-center">124</td>
                        <td className="p-3 border-t border-border text-center">69%</td>
                        <td className="p-3 border-t border-border text-right">$15,250</td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-3 border-t border-border">Midwest Connection</td>
                        <td className="p-3 border-t border-border text-center">18</td>
                        <td className="p-3 border-t border-border text-center">98</td>
                        <td className="p-3 border-t border-border text-center">65%</td>
                        <td className="p-3 border-t border-border text-right">$13,280</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Sales Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex justify-between items-center">
                          <span className="text-sm">Confirmed</span>
                          <span className="font-medium">285 (76.4%)</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-sm">Reserved</span>
                          <span className="font-medium">48 (12.9%)</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-sm">Cancelled</span>
                          <span className="font-medium">23 (6.2%)</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-sm">Completed</span>
                          <span className="font-medium">17 (4.5%)</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Payment Method Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex justify-between items-center">
                          <span className="text-sm">Credit Card</span>
                          <span className="font-medium">238 (63.8%)</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-sm">PayPal</span>
                          <span className="font-medium">87 (23.3%)</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-sm">Bank Transfer</span>
                          <span className="font-medium">32 (8.6%)</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-sm">Other</span>
                          <span className="font-medium">16 (4.3%)</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Booking Channels</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex justify-between items-center">
                          <span className="text-sm">Mobile App</span>
                          <span className="font-medium">217 (58.2%)</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-sm">Website</span>
                          <span className="font-medium">112 (30.0%)</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-sm">Agent</span>
                          <span className="font-medium">32 (8.6%)</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-sm">Phone</span>
                          <span className="font-medium">12 (3.2%)</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Reports;

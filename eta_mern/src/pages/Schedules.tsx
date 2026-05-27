
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SchedulesAPI, RoutesAPI } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';
import ScheduleRow from '@/components/schedules/ScheduleRow';
import { Schedule, Route } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

const Schedules = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [routeFilter, setRouteFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['schedules'],
    queryFn: SchedulesAPI.getAll,
  });

  const { data: routes, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['routes'],
    queryFn: RoutesAPI.getAll,
  });

  const handleAddSchedule = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setCurrentSchedule(schedule);
    setIsEditDialogOpen(true);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    // In a real app, you'd implement proper confirmation and deletion logic
    console.log(`Delete schedule: ${scheduleId}`);
  };

  const filteredSchedules = schedules?.filter(schedule => {
    let matchesRoute = routeFilter === "all" || schedule.routeId === routeFilter;
    let matchesStatus = statusFilter === "all" || schedule.status === statusFilter;
    return matchesRoute && matchesStatus;
  });

  return (
    <AdminLayout
      pageTitle="Schedules"
      pageSubtitle="Manage all route schedules"
      actions={
        <Button onClick={handleAddSchedule}>
          <Plus className="mr-2 h-4 w-4" /> Add Schedule
        </Button>
      }
    >
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={routeFilter} onValueChange={setRouteFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by route" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Routes</SelectItem>
              {routes?.map(route => (
                <SelectItem key={route.id} value={route.id}>
                  {route.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Route</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Departure</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Arrival</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Available Seats</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingSchedules ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">Loading schedules...</td>
              </tr>
            ) : filteredSchedules?.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">No schedules found with the selected filters</td>
              </tr>
            ) : (
              filteredSchedules?.map(schedule => (
                <ScheduleRow
                  key={schedule.id}
                  schedule={schedule}
                  onEdit={handleEditSchedule}
                  onDelete={handleDeleteSchedule}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Schedule Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Schedule</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="route" className="text-right">Route</Label>
              <div className="col-span-3">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes?.map(route => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departure" className="text-right">Departure Time</Label>
              <Input
                id="departure"
                type="datetime-local"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="arrival" className="text-right">Arrival Time</Label>
              <Input
                id="arrival"
                type="datetime-local"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vehicle" className="text-right">Vehicle ID</Label>
              <Input
                id="vehicle"
                placeholder="e.g., V123"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="seats" className="text-right">Total Seats</Label>
              <Input
                id="seats"
                type="number"
                placeholder="e.g., 200"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select defaultValue="scheduled">
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button>Add Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="route" className="text-right">Route</Label>
              <div className="col-span-3">
                <Select defaultValue={currentSchedule?.routeId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {routes?.map(route => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departure" className="text-right">Departure Time</Label>
              <Input
                id="departure"
                type="datetime-local"
                className="col-span-3"
                defaultValue={currentSchedule?.departureTime.slice(0, 16)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="arrival" className="text-right">Arrival Time</Label>
              <Input
                id="arrival"
                type="datetime-local"
                className="col-span-3"
                defaultValue={currentSchedule?.arrivalTime.slice(0, 16)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vehicle" className="text-right">Vehicle ID</Label>
              <Input
                id="vehicle"
                placeholder="e.g., V123"
                className="col-span-3"
                defaultValue={currentSchedule?.vehicleId}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="available" className="text-right">Available Seats</Label>
              <Input
                id="available"
                type="number"
                className="col-span-3"
                defaultValue={currentSchedule?.availableSeats}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total" className="text-right">Total Seats</Label>
              <Input
                id="total"
                type="number"
                className="col-span-3"
                defaultValue={currentSchedule?.totalSeats}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select defaultValue={currentSchedule?.status}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button>Update Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Schedules;

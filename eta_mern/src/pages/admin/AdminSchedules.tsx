import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SchedulesAPI, RoutesAPI, StationsAPI, BusmanAPI } from '@/services/api';
import { Schedule, Route, Station } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, MapPin, Users, Plus, Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';

interface ScheduleFormData {
  route: string;
  departureTime: string;
  arrivalTime: string;
  vehicleId: string;
  totalSeats: number;
  availableSeats: number;
  status: 'scheduled' | 'delayed' | 'cancelled' | 'completed';
  assignedBusman?: string;
}

const AdminSchedules: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    route: '',
    departureTime: '',
    arrivalTime: '',
    vehicleId: '',
    totalSeats: 50,
    availableSeats: 50,
    status: 'scheduled',
    assignedBusman: ''
  });

  // Fetch data
  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['admin-schedules'],
    queryFn: () => SchedulesAPI.getAll()
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['routes'],
    queryFn: RoutesAPI.getAll
  });

  const { data: stations = [] } = useQuery({
    queryKey: ['stations'],
    queryFn: StationsAPI.getAll
  });

  const { data: busmen = [] } = useQuery({
    queryKey: ['busmen'],
    queryFn: () => BusmanAPI.getAll()
  });

  // Mutations
  const createScheduleMutation = useMutation({
    mutationFn: SchedulesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schedules'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({ title: 'Success', description: 'Schedule created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create schedule' });
    }
  });

  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => SchedulesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schedules'] });
      setIsEditDialogOpen(false);
      setEditingSchedule(null);
      resetForm();
      toast({ title: 'Success', description: 'Schedule updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update schedule' });
    }
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: SchedulesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schedules'] });
      toast({ title: 'Success', description: 'Schedule deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete schedule' });
    }
  });

  const resetForm = () => {
    setFormData({
      route: '',
      departureTime: '',
      arrivalTime: '',
      vehicleId: '',
      totalSeats: 50,
      availableSeats: 50,
      status: 'scheduled',
      assignedBusman: ''
    });
  };

  const handleCreate = () => {
    const scheduleData: any = {
      route: formData.route,
      departureTime: new Date(formData.departureTime),
      arrivalTime: new Date(formData.arrivalTime),
      vehicleId: formData.vehicleId,
      totalSeats: formData.totalSeats,
      availableSeats: formData.availableSeats,
      status: formData.status
    };
    
    if (formData.assignedBusman) {
      scheduleData.assignedBusman = formData.assignedBusman;
    }
    
    createScheduleMutation.mutate(scheduleData);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      route: typeof schedule.route === 'string' ? schedule.route : schedule.route._id,
      departureTime: format(new Date(schedule.departureTime), "yyyy-MM-dd'T'HH:mm"),
      arrivalTime: format(new Date(schedule.arrivalTime), "yyyy-MM-dd'T'HH:mm"),
      vehicleId: schedule.vehicleId,
      totalSeats: schedule.totalSeats,
      availableSeats: schedule.availableSeats,
      status: schedule.status,
      assignedBusman: typeof schedule.assignedBusman === 'string' ? schedule.assignedBusman : schedule.assignedBusman?._id || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (editingSchedule) {
      const scheduleData: any = {
        route: formData.route,
        departureTime: new Date(formData.departureTime),
        arrivalTime: new Date(formData.arrivalTime),
        vehicleId: formData.vehicleId,
        totalSeats: formData.totalSeats,
        availableSeats: formData.availableSeats,
        status: formData.status
      };
      
      if (formData.assignedBusman) {
        scheduleData.assignedBusman = formData.assignedBusman;
      }
      
      updateScheduleMutation.mutate({
        id: editingSchedule._id,
        data: scheduleData
      });
    }
  };

  const handleDelete = (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      deleteScheduleMutation.mutate(scheduleId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRouteName = (route: Route | string) => {
    if (typeof route === 'string') return 'Loading...';
    return route.name;
  };

  const getRouteStations = (route: Route | string) => {
    if (typeof route === 'string') return 'Loading...';
    if (route.stations && Array.isArray(route.stations)) {
      return route.stations.map(station => station.name).join(' → ');
    }
    return 'No stations';
  };

  if (isLoadingSchedules) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading schedules...</div>
      </div>
    );
  }

  return (
    <AdminLayout
      pageTitle="Schedule Management"
      pageSubtitle="Manage bus schedules and routes"
      actions={
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Schedule</DialogTitle>
              <DialogDescription>
                Add a new bus schedule to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="route">Route</Label>
                <Select value={formData.route} onValueChange={(value) => setFormData({ ...formData, route: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route._id} value={route._id}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicleId">Vehicle ID</Label>
                <Input
                  id="vehicleId"
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  placeholder="e.g., BUS-001"
                />
              </div>
              <div>
                <Label htmlFor="assignedBusman">Assign Busman (Optional)</Label>
                <Select value={formData.assignedBusman || 'none'} onValueChange={(value) => setFormData({ ...formData, assignedBusman: value === 'none' ? '' : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a busman" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {Array.isArray(busmen) && busmen.length > 0 && (busmen as any[]).map((busman: any) => (
                      <SelectItem key={busman._id} value={busman._id}>
                        {busman.fullName} ({busman.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departureTime">Departure Time</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="departureTime"
                      type="datetime-local"
                      className="pl-9"
                      value={formData.departureTime}
                      onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="arrivalTime">Arrival Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="arrivalTime"
                      type="datetime-local"
                      className="pl-9"
                      value={formData.arrivalTime}
                      onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalSeats">Total Seats</Label>
                  <Input
                    id="totalSeats"
                    type="number"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="availableSeats">Available Seats</Label>
                  <Input
                    id="availableSeats"
                    type="number"
                    value={formData.availableSeats}
                    onChange={(e) => setFormData({ ...formData, availableSeats: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
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
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createScheduleMutation.isPending}>
                  {createScheduleMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>All Schedules</CardTitle>
          <CardDescription>
            Manage and monitor all bus schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getRouteName(schedule.route)}</div>
                        <div className="text-sm text-muted-foreground">{getRouteStations(schedule.route)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{schedule.vehicleId}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(schedule.departureTime), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(schedule.departureTime), 'HH:mm')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(schedule.arrivalTime), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(schedule.arrivalTime), 'HH:mm')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{schedule.availableSeats}/{schedule.totalSeats}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(schedule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(schedule._id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update the schedule information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-route">Route</Label>
              <Select value={formData.route} onValueChange={(value) => setFormData({ ...formData, route: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route._id} value={route._id}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-vehicleId">Vehicle ID</Label>
              <Input
                id="edit-vehicleId"
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                placeholder="e.g., BUS-001"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-departureTime">Departure Time</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="edit-departureTime"
                    type="datetime-local"
                    className="pl-9"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-arrivalTime">Arrival Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="edit-arrivalTime"
                    type="datetime-local"
                    className="pl-9"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-totalSeats">Total Seats</Label>
                <Input
                  id="edit-totalSeats"
                  type="number"
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-availableSeats">Available Seats</Label>
                <Input
                  id="edit-availableSeats"
                  type="number"
                  value={formData.availableSeats}
                  onChange={(e) => setFormData({ ...formData, availableSeats: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-assignedBusman">Assign Busman (Optional)</Label>
              <Select value={formData.assignedBusman || 'none'} onValueChange={(value) => setFormData({ ...formData, assignedBusman: value === 'none' ? '' : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a busman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {Array.isArray(busmen) && busmen.length > 0 && (busmen as any[]).map((busman: any) => (
                    <SelectItem key={busman._id} value={busman._id}>
                      {busman.fullName} ({busman.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
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
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateScheduleMutation.isPending}>
                {updateScheduleMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminSchedules;

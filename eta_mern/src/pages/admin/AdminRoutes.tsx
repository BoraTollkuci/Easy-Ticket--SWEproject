import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoutesAPI, StationsAPI } from '@/services/api';
import { Route, Station } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Route as RouteIcon, DollarSign, Clock, Plus, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';

interface RouteFormData {
  name: string;
  code: string;
  description: string;
  stations: string[];
  distance: number;
  duration: number;
  fare: number;
}

const AdminRoutes: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState<RouteFormData>({
    name: '',
    code: '',
    description: '',
    stations: [],
    distance: 0,
    duration: 0,
    fare: 0
  });

  // Fetch data
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['admin-routes'],
    queryFn: () => RoutesAPI.getAll()
  });

  const { data: stations = [] } = useQuery({
    queryKey: ['stations'],
    queryFn: StationsAPI.getAll
  });

  // Mutations
  const createRouteMutation = useMutation({
    mutationFn: RoutesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-routes'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({ title: 'Success', description: 'Route created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create route' });
    }
  });

  const updateRouteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => RoutesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-routes'] });
      setIsEditDialogOpen(false);
      setEditingRoute(null);
      resetForm();
      toast({ title: 'Success', description: 'Route updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update route' });
    }
  });

  const deleteRouteMutation = useMutation({
    mutationFn: RoutesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-routes'] });
      toast({ title: 'Success', description: 'Route deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete route' });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      stations: [],
      distance: 0,
      duration: 0,
      fare: 0
    });
  };

  const handleCreate = () => {
    createRouteMutation.mutate(formData);
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      code: route.code,
      description: route.description,
      stations: route.stations.map(station => 
        typeof station === 'string' ? station : station._id
      ),
      distance: route.distance,
      duration: route.duration,
      fare: route.fare
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (editingRoute) {
      updateRouteMutation.mutate({
        id: editingRoute._id,
        data: formData
      });
    }
  };

  const handleDelete = (routeId: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      deleteRouteMutation.mutate(routeId);
    }
  };

  const handleStationToggle = (stationId: string) => {
    setFormData(prev => ({
      ...prev,
      stations: prev.stations.includes(stationId)
        ? prev.stations.filter(id => id !== stationId)
        : [...prev.stations, stationId]
    }));
  };

  const getStationName = (station: Station | string) => {
    if (typeof station === 'string') {
      const foundStation = stations.find(s => s._id === station);
      return foundStation ? foundStation.name : 'Unknown Station';
    }
    return station.name;
  };

  const getRouteStations = (route: Route) => {
    if (route.stations && Array.isArray(route.stations)) {
      return route.stations.map(station => getStationName(station)).join(' → ');
    }
    return 'No stations';
  };

  if (isLoadingRoutes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading routes...</div>
      </div>
    );
  }

  return (
    <AdminLayout
      pageTitle="Route Management"
      pageSubtitle="Manage bus routes and connections"
      actions={
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Route</DialogTitle>
              <DialogDescription>
                Add a new bus route to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Route Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Tirana-Durrës Express"
                  />
                </div>
                <div>
                  <Label htmlFor="code">Route Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., TIR-DUR-EXP"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Route description"
                />
              </div>
              <div>
                <Label>Stations</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {stations.map((station) => (
                    <label key={station._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.stations.includes(station._id)}
                        onChange={() => handleStationToggle(station._id)}
                        className="rounded"
                      />
                      <span className="text-sm">{station.name} ({station.code})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="fare">Fare (ALL)</Label>
                  <Input
                    id="fare"
                    type="number"
                    value={formData.fare}
                    onChange={(e) => setFormData({ ...formData, fare: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createRouteMutation.isPending}>
                  {createRouteMutation.isPending ? 'Creating...' : 'Create'}
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
          <CardTitle>All Routes</CardTitle>
          <CardDescription>
            Manage and monitor all bus routes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Stations</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{route.name}</div>
                        <div className="text-sm text-muted-foreground">{route.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{getRouteStations(route)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <RouteIcon className="w-4 h-4" />
                        <span>{route.distance} km</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{route.duration} min</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{route.fare} ALL</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={route.isActive ? 'default' : 'secondary'}>
                        {route.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(route)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(route._id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
            <DialogDescription>
              Update the route information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Route Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Tirana-Durrës Express"
                />
              </div>
              <div>
                <Label htmlFor="edit-code">Route Code</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., TIR-DUR-EXP"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Route description"
              />
            </div>
            <div>
              <Label>Stations</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {stations.map((station) => (
                  <label key={station._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.stations.includes(station._id)}
                      onChange={() => handleStationToggle(station._id)}
                      className="rounded"
                    />
                    <span className="text-sm">{station.name} ({station.code})</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-distance">Distance (km)</Label>
                <Input
                  id="edit-distance"
                  type="number"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (min)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-fare">Fare (ALL)</Label>
                <Input
                  id="edit-fare"
                  type="number"
                  value={formData.fare}
                  onChange={(e) => setFormData({ ...formData, fare: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateRouteMutation.isPending}>
                {updateRouteMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminRoutes;

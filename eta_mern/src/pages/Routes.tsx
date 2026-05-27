import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RoutesAPI, StationsAPI } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';
import RouteCard from '@/components/routes/RouteCard';
import RoutesMap from '@/components/routes/RoutesMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Map } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Route } from '@/types/models';

const Routes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [activeView, setActiveView] = useState<'grid' | 'map'>('grid');

  const { data: routes, isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: RoutesAPI.getAll,
  });

  const { data: stations } = useQuery({
    queryKey: ['stations'],
    queryFn: StationsAPI.getAll,
  });

  const filteredRoutes = routes?.filter(
    route => route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             route.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRouteClick = (route: Route) => {
    setSelectedRoute(route);
    setIsDialogOpen(true);
  };

  const handleAddRoute = () => {
    setSelectedRoute(null);
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout
      pageTitle="Routes"
      pageSubtitle="Manage all transportation routes"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveView(activeView === 'grid' ? 'map' : 'grid')}>
            <Map className="mr-2 h-4 w-4" /> {activeView === 'grid' ? 'View Map' : 'View Grid'}
          </Button>
          <Button onClick={handleAddRoute}>
            <Plus className="mr-2 h-4 w-4" /> Add Route
          </Button>
        </div>
      }
    >
      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search routes by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 w-full"
        />
      </div>

      {/* Tabs for Different Views */}
      <Tabs defaultValue="grid" value={activeView} onValueChange={(value) => setActiveView(value as 'grid' | 'map')}>
        <TabsList className="mb-6">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>
        
        {/* Grid View */}
        <TabsContent value="grid">
          {isLoading ? (
            <div className="text-center p-8">Loading routes...</div>
          ) : filteredRoutes?.length === 0 ? (
            <div className="text-center p-8">No routes found matching your search</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRoutes?.map(route => (
                <RouteCard 
                  key={route.id} 
                  route={route} 
                  onClick={() => handleRouteClick(route)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Map View */}
        <TabsContent value="map">
          <div className="space-y-6">
            <RoutesMap routes={routes || []} selectedRouteId={selectedRoute?.id} />
            
            {/* Route List Below Map */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Available Routes</h3>
              <div className="grid gap-3">
                {filteredRoutes?.map((route, index) => (
                  <div 
                    key={route.id} 
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedRoute?.id === route.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: ROUTE_COLORS[index % ROUTE_COLORS.length] }}
                      ></div>
                      <div>
                        <div className="font-medium">{route.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {route.stations[0]?.name} to {route.stations[route.stations.length - 1]?.name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Route Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedRoute ? `Route Details: ${selectedRoute.name}` : 'Add New Route'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Route Name</label>
              <Input
                id="name"
                defaultValue={selectedRoute?.name}
                placeholder="e.g. Northeast Express"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="code" className="text-sm font-medium">Route Code</label>
                <Input
                  id="code"
                  defaultValue={selectedRoute?.code}
                  placeholder="e.g. NE-EXP"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="fare" className="text-sm font-medium">Base Fare ($)</label>
                <Input
                  id="fare"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={selectedRoute?.fare}
                  placeholder="e.g. 120.00"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input
                id="description"
                defaultValue={selectedRoute?.description}
                placeholder="Brief description of the route"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="duration" className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  defaultValue={selectedRoute?.duration}
                  placeholder="e.g. 120"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="distance" className="text-sm font-medium">Distance (km)</label>
                <Input
                  id="distance"
                  type="number"
                  min="0"
                  step="0.1"
                  defaultValue={selectedRoute?.distance}
                  placeholder="e.g. 250"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Stations</h4>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                {selectedRoute?.stations.map((station, index) => (
                  <div key={station.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <span className="bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center rounded-full text-xs">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium">{station.name}</div>
                      <div className="text-xs text-muted-foreground">{station.city}, {station.state}</div>
                    </div>
                  </div>
                ))}
                {!selectedRoute && (
                  <div className="text-sm text-muted-foreground italic">
                    You'll be able to add stations after creating the route.
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button>{selectedRoute ? 'Update Route' : 'Create Route'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

// Route colors - same as in RoutesMap for consistency
const ROUTE_COLORS = ['#9b87f5', '#F97316', '#0EA5E9', '#8B5CF6', '#ea384c'];

export default Routes;

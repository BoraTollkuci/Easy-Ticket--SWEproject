
import React from 'react';
import { Route } from '@/types/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign } from 'lucide-react';

interface RouteCardProps {
  route: Route;
  onClick?: () => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onClick }) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow" 
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{route.name}</CardTitle>
          <Badge variant="outline">{route.code}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{route.description}</p>
        
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 text-transport-500 mr-2" />
            <span className="font-medium">
              {route.stations[0].name} to {route.stations[route.stations.length - 1].name}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 text-transport-500 mr-2" />
            <span>{formatDuration(route.duration)}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <DollarSign className="h-4 w-4 text-transport-500 mr-2" />
            <span>${route.fare.toFixed(2)} base fare</span>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-1">
            {route.stations.map((station, index) => (
              <React.Fragment key={station.id}>
                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                  {station.code}
                </span>
                {index < route.stations.length - 1 && (
                  <span className="text-muted-foreground mx-0.5">•</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteCard;

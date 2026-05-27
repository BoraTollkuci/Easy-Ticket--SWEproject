
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketSearch from '@/components/tickets/TicketSearch';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Bus } from 'lucide-react';
import { SchedulesAPI, StationsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  id: string;
  route: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  duration: string;
}

const TicketPurchase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (searchData: any) => {
    setIsSearching(true);
    
    try {
      // Get all stations to find station IDs
      const stations = await StationsAPI.getAll();
      const fromStation = stations.find(s => s.name === searchData.from || s.code === searchData.from);
      const toStation = stations.find(s => s.name === searchData.to || s.code === searchData.to);
      
      if (!fromStation || !toStation) {
        toast({
          title: "Error",
          description: "Please select valid stations",
          variant: "destructive",
        });
        return;
      }

      // Search for schedules
      const schedules = await SchedulesAPI.search({
        from: fromStation._id,
        to: toStation._id,
        date: searchData.date
      });

      // Transform schedules to SearchResult format
      const results: SearchResult[] = schedules.map(schedule => ({
        id: schedule._id,
        route: `${fromStation.name} → ${toStation.name}`,
        departure: fromStation.name,
        arrival: toStation.name,
        departureTime: new Date(schedule.departureTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        arrivalTime: new Date(schedule.arrivalTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        price: schedule.route.fare,
        availableSeats: schedule.availableSeats,
        duration: `${Math.floor(schedule.route.duration / 60)}h ${schedule.route.duration % 60}m`
      }));
      
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "No available schedules found for your search criteria",
        });
      }
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message || "Failed to search for tickets",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookTicket = (result: SearchResult) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to book tickets",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    // Navigate to booking confirmation with schedule ID
    navigate(`/booking/${result.id}`);
  };

  return (
    <AdminLayout
      pageTitle="Purchase Tickets"
      pageSubtitle="Search and book your travel tickets"
    >
      <div className="space-y-6">
        <TicketSearch onSearch={handleSearch} />
        
        {isSearching && (
          <div className="text-center p-8">
            <div className="eta-primary-text">Searching for available tickets...</div>
          </div>
        )}
        
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Available Tickets</h3>
            {searchResults.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Bus className="h-4 w-4" />
                        {result.route}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 eta-primary-text" />
                        <span className="font-medium">{result.duration}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Departure</div>
                      <div className="font-medium">{result.departureTime}</div>
                      <div className="text-sm eta-primary-text">{result.departure}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Arrival</div>
                      <div className="font-medium">{result.arrivalTime}</div>
                      <div className="text-sm eta-primary-text">{result.arrival}</div>
                    </div>
                    
                    <div className="space-y-2 text-right">
                      <div className="text-2xl font-bold eta-primary-text">
                        {result.price} ALL
                      </div>
                      <Badge variant="outline" className="mb-2">
                        {result.availableSeats} seats left
                      </Badge>
                      <Button 
                        onClick={() => handleBookTicket(result)}
                        className="w-full eta-primary"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TicketPurchase;

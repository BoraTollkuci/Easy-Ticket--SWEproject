
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Calendar, Users, Search } from 'lucide-react';
import { StationsAPI } from '@/services/api';

interface TicketSearchProps {
  onSearch: (searchData: {
    from: string;
    to: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
    tripType: 'one-way' | 'round-trip';
  }) => void;
}

const TicketSearch: React.FC<TicketSearchProps> = ({ onSearch }) => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    tripType: 'one-way' as 'one-way' | 'round-trip'
  });

  // Fetch stations from API
  const { data: stations = [], isLoading: isLoadingStations } = useQuery({
    queryKey: ['stations'],
    queryFn: StationsAPI.getAll,
  });

  const handleInputChange = (field: string, value: string | number) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchData);
  };

  const swapLocations = () => {
    setSearchData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl eta-primary-text flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Tickets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Type */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant={searchData.tripType === 'one-way' ? 'default' : 'outline'}
              className={searchData.tripType === 'one-way' ? 'eta-primary' : ''}
              onClick={() => handleInputChange('tripType', 'one-way')}
            >
              One Way
            </Button>
            <Button
              type="button"
              variant={searchData.tripType === 'round-trip' ? 'default' : 'outline'}
              className={searchData.tripType === 'round-trip' ? 'eta-primary' : ''}
              onClick={() => handleInputChange('tripType', 'round-trip')}
            >
              Round Trip
            </Button>
          </div>

          {/* From/To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Select value={searchData.from} onValueChange={(value) => handleInputChange('from', value)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select departure city" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map(station => (
                      <SelectItem key={station._id} value={station.name}>
                        {station.name} ({station.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="to">To</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={swapLocations}
                  className="text-xs eta-primary-text"
                >
                  Swap
                </Button>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Select value={searchData.to} onValueChange={(value) => handleInputChange('to', value)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select destination city" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map(station => (
                      <SelectItem key={station._id} value={station.name}>
                        {station.name} ({station.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureDate">Departure Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="departureDate"
                  type="date"
                  value={searchData.departureDate}
                  onChange={(e) => handleInputChange('departureDate', e.target.value)}
                  className="pl-10"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {searchData.tripType === 'round-trip' && (
              <div className="space-y-2">
                <Label htmlFor="returnDate">Return Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="returnDate"
                    type="date"
                    value={searchData.returnDate}
                    onChange={(e) => handleInputChange('returnDate', e.target.value)}
                    className="pl-10"
                    min={searchData.departureDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Passengers */}
          <div className="space-y-2">
            <Label htmlFor="passengers">Passengers</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Select 
                value={searchData.passengers.toString()} 
                onValueChange={(value) => handleInputChange('passengers', parseInt(value))}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full eta-primary">
            <Search className="mr-2 h-4 w-4" />
            Search Tickets
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TicketSearch;

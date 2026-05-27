import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { 
  Clock, 
  MapPin, 
  Bus, 
  Users, 
  ArrowLeft,
  Filter,
  SortAsc,
  Star,
  Wifi,
  Coffee,
  Snowflake,
  Search,
  Calendar,
  User
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SchedulesAPI, StationsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';

interface SearchParams {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

interface ScheduleResult {
  _id: string;
  departureTime: string;
  arrivalTime: string;
  route: {
    _id: string;
    name: string;
    fare: number;
    duration: number;
    distance: number;
  };
  vehicleId: string;
  availableSeats: number;
  totalSeats: number;
  status: string;
}

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const searchParams: SearchParams = location.state?.searchParams || {
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
    passengers: 1
  };

  const [schedules, setSchedules] = useState<ScheduleResult[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSearchParams, setCurrentSearchParams] = useState<SearchParams>(searchParams);
  const [filters, setFilters] = useState({
    sortBy: 'departure',
    priceRange: '',
    amenities: [] as string[],
    timeRange: ''
  });

  // Fetch stations to get IDs for search
  const { data: stations = [], isLoading: isLoadingStations } = useQuery({
    queryKey: ['stations'],
    queryFn: StationsAPI.getAll,
  });

  const fetchSchedules = async (searchParams: SearchParams) => {
    if (!searchParams.from || !searchParams.to || !searchParams.date) {
      setLoading(false);
      return;
    }

    // Wait for stations to load
    if (!stations || stations.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Find station IDs
      const fromStation = stations.find(s => s.name === searchParams.from);
      const toStation = stations.find(s => s.name === searchParams.to);
      
      if (!fromStation || !toStation) {
        console.log('Available stations:', stations.map(s => s.name));
        console.log('Looking for:', searchParams.from, searchParams.to);
        toast({
          title: "Error",
          description: "Please select valid stations from the dropdown",
          variant: "destructive",
        });
        return;
      }

      // Search for schedules
      const results = await SchedulesAPI.search({
        from: fromStation._id,
        to: toStation._id,
        date: searchParams.date
      });

      setSchedules(results);
      setFilteredSchedules(results);
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message || "Failed to search for schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch schedules if stations are loaded and we have valid search params
    if (stations.length > 0 && currentSearchParams.from && currentSearchParams.to && currentSearchParams.date) {
      fetchSchedules(currentSearchParams);
    }
  }, [currentSearchParams.from, currentSearchParams.to, stations, toast]);

  useEffect(() => {
    let filtered = [...schedules];

    // Sort by selected option
    switch (filters.sortBy) {
      case 'departure':
        filtered.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
        break;
      case 'arrival':
        filtered.sort((a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime());
        break;
      case 'price':
        filtered.sort((a, b) => a.route.fare - b.route.fare);
        break;
      case 'duration':
        filtered.sort((a, b) => a.route.duration - b.route.duration);
        break;
    }

    // Filter by price range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(schedule => {
        const price = schedule.route.fare;
        return price >= min && (max ? price <= max : true);
      });
    }

    // Filter by time range
    if (filters.timeRange) {
      const now = new Date();
      const time = now.getHours();
      
      filtered = filtered.filter(schedule => {
        const departureHour = new Date(schedule.departureTime).getHours();
        
        switch (filters.timeRange) {
          case 'morning':
            return departureHour >= 6 && departureHour < 12;
          case 'afternoon':
            return departureHour >= 12 && departureHour < 18;
          case 'evening':
            return departureHour >= 18 && departureHour < 24;
          case 'night':
            return departureHour >= 0 && departureHour < 6;
          default:
            return true;
        }
      });
    }

    setFilteredSchedules(filtered);
  }, [schedules, filters]);

  const handleSearchParamsChange = (newParams: Partial<SearchParams>) => {
    setCurrentSearchParams(prev => ({ ...prev, ...newParams }));
  };

  const handleSearch = () => {
    fetchSchedules(currentSearchParams);
  };


  const handleBookTicket = (schedule: ScheduleResult) => {
    navigate('/booking', { 
      state: { 
        schedule,
        searchParams: currentSearchParams 
      } 
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading || isLoadingStations) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002c2b] mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoadingStations ? 'Loading stations...' : 'Searching for buses...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-[#002c2b] hover:bg-[#002c2b]/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="text-right flex-1">
              <p className="text-sm text-gray-600">{filteredSchedules.length} buses found</p>
            </div>
          </div>
          
          {/* Editable Search Form */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* From Station */}
                  <div>
                    <Label htmlFor="from" className="text-sm font-medium text-gray-700">From</Label>
                    <SearchableSelect
                      value={currentSearchParams.from}
                      onValueChange={(value) => handleSearchParamsChange({ from: value })}
                      placeholder="Select departure station"
                      options={stations.map(station => ({
                        value: station.name,
                        label: station.name,
                        code: station.code
                      }))}
                      icon={<MapPin className="h-4 w-4 text-gray-400" />}
                      className="mt-1"
                    />
                  </div>

                  {/* To Station */}
                  <div>
                    <Label htmlFor="to" className="text-sm font-medium text-gray-700">To</Label>
                    <SearchableSelect
                      value={currentSearchParams.to}
                      onValueChange={(value) => handleSearchParamsChange({ to: value })}
                      placeholder="Select destination station"
                      options={stations.map(station => ({
                        value: station.name,
                        label: station.name,
                        code: station.code
                      }))}
                      icon={<MapPin className="h-4 w-4 text-gray-400" />}
                      className="mt-1"
                    />
                  </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date */}
                  <div>
                    <Label htmlFor="date" className="text-sm font-medium text-gray-700">Date</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="date"
                        type="date"
                        value={currentSearchParams.date}
                        onChange={(e) => handleSearchParamsChange({ date: e.target.value })}
                        className="pl-9"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Passengers */}
                  <div>
                    <Label htmlFor="passengers" className="text-sm font-medium text-gray-700">Passengers</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="passengers"
                        type="number"
                        min="1"
                        max="10"
                        value={currentSearchParams.passengers}
                        onChange={(e) => handleSearchParamsChange({ passengers: parseInt(e.target.value) })}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <div>
                    <Button
                      onClick={handleSearch}
                      className="w-full bg-[#002c2b] hover:bg-[#003a37] text-white mt-6"
                      disabled={!currentSearchParams.from || !currentSearchParams.to || !currentSearchParams.date || isLoadingStations}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sort By */}
                <div>
                  <Label className="text-sm font-medium">Sort By</Label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#002c2b] focus:border-transparent"
                  >
                    <option value="departure">Departure Time</option>
                    <option value="arrival">Arrival Time</option>
                    <option value="price">Price (Low to High)</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="text-sm font-medium">Price Range</Label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#002c2b] focus:border-transparent"
                  >
                    <option value="">All Prices</option>
                    <option value="0-500">Under 500 ALL</option>
                    <option value="500-1000">500 - 1000 ALL</option>
                    <option value="1000-2000">1000 - 2000 ALL</option>
                    <option value="2000-9999">Above 2000 ALL</option>
                  </select>
                </div>

                {/* Time Range */}
                <div>
                  <Label className="text-sm font-medium">Departure Time</Label>
                  <select
                    value={filters.timeRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#002c2b] focus:border-transparent"
                  >
                    <option value="">Any Time</option>
                    <option value="morning">Morning (6AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 6PM)</option>
                    <option value="evening">Evening (6PM - 12AM)</option>
                    <option value="night">Night (12AM - 6AM)</option>
                  </select>
                </div>

                {/* Amenities */}
                <div>
                  <Label className="text-sm font-medium">Amenities</Label>
                  <div className="mt-2 space-y-2">
                    {[
                      { id: 'wifi', label: 'WiFi', icon: Wifi },
                      { id: 'coffee', label: 'Coffee', icon: Coffee },
                      { id: 'ac', label: 'Air Conditioning', icon: Snowflake }
                    ].map((amenity) => (
                      <label key={amenity.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                amenities: [...prev.amenities, amenity.id]
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                amenities: prev.amenities.filter(a => a !== amenity.id)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-[#002c2b] focus:ring-[#002c2b]"
                        />
                        <amenity.icon className="h-4 w-4" />
                        <span className="text-sm">{amenity.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {filteredSchedules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No buses found</h3>
                  <p className="text-gray-600 mb-4">
                    No buses available for your selected route and date. Try different dates or routes.
                  </p>
                  <Button onClick={() => navigate('/')} className="bg-[#002c2b] hover:bg-[#003a37]">
                    Search Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSchedules.map((schedule) => (
                  <Card key={schedule._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                        {/* Bus Info */}
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-[#002c2b]/10 rounded-lg flex items-center justify-center">
                              <Bus className="h-6 w-6 text-[#002c2b]" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-[#002c2b]">
                                {schedule.route.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Bus ID: {schedule.vehicleId}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">{formatTime(schedule.departureTime)}</p>
                                <p className="text-gray-500">Departure</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">{formatTime(schedule.arrivalTime)}</p>
                                <p className="text-gray-500">Arrival</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Journey Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{formatDuration(schedule.route.duration)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{schedule.availableSeats} seats available</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={schedule.status === 'scheduled' ? 'default' : 'secondary'}
                              className={schedule.status === 'scheduled' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {schedule.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Price and Book */}
                        <div className="text-right">
                          <div className="mb-4">
                            <p className="text-2xl font-bold text-[#002c2b]">
                              {schedule.route.fare} ALL
                            </p>
                            <p className="text-sm text-gray-500">per person</p>
                          </div>
                          <Button
                            onClick={() => handleBookTicket(schedule)}
                            className="w-full bg-[#002c2b] hover:bg-[#003a37] text-white"
                            disabled={schedule.availableSeats === 0}
                          >
                            {schedule.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;


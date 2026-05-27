import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  Bus, 
  Clock, 
  Star,
  Shield,
  Phone,
  Mail,
  ArrowRight,
  Route,
  Ticket,
  UserCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StationsAPI, RoutesAPI, SchedulesAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1
  });

  // Fetch stations and routes for search
  const { data: stations = [] } = useQuery({
    queryKey: ['stations'],
    queryFn: StationsAPI.getAll,
  });

  const { data: popularRoutes = [], isLoading: isLoadingPopularRoutes } = useQuery({
    queryKey: ['popular-routes'],
    queryFn: () => RoutesAPI.getPopular(6),
  });

  const handleSearch = () => {
    if (!searchData.from || !searchData.to || !searchData.date) {
      return;
    }
    navigate('/search', { 
      state: { 
        searchParams: searchData 
      } 
    });
  };

  const handlePopularRouteClick = async (route: any) => {
    try {
      const searchParams = {
        from: route.stations[0]?.name || '',
        to: route.stations[route.stations.length - 1]?.name || '',
        date: new Date().toISOString().split('T')[0],
        passengers: 1
      };

      // Fetch available schedules for this route and date
      const schedules = await SchedulesAPI.search(searchParams);
      
      if (schedules.length > 0) {
        // Use the first available schedule for direct booking
        const schedule = schedules[0];
        navigate('/booking', {
          state: {
            schedule,
            searchParams
          }
        });
      } else {
        // If no schedules available, redirect to search page
        navigate('/search', { 
          state: { 
            searchParams 
          } 
        });
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      // Fallback to search page if there's an error
      const searchParams = {
        from: route.stations[0]?.name || '',
        to: route.stations[route.stations.length - 1]?.name || '',
        date: new Date().toISOString().split('T')[0],
        passengers: 1
      };
      navigate('/search', { 
        state: { 
          searchParams 
        } 
      });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002c2b]/5 to-[#002c2b]/10">
      <Header showSearchButton={false} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-[#002c2b] mb-6">
              Travel Across Albania
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Book your bus tickets online and explore the beautiful cities of Albania 
              with our reliable and comfortable bus services.
            </p>
          </div>

          {/* Search Card */}
          <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-[#002c2b] flex items-center justify-center gap-2">
                <Search className="h-6 w-6" />
                Find Your Perfect Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From/To */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from" className="text-sm font-medium">From</Label>
                    <SearchableSelect
                      value={searchData.from}
                      onValueChange={(value) => setSearchData(prev => ({ ...prev, from: value }))}
                      placeholder="Select departure city"
                      options={stations.map(station => ({
                        value: station.name,
                        label: station.name,
                        code: station.code
                      }))}
                      icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to" className="text-sm font-medium">To</Label>
                    <SearchableSelect
                      value={searchData.to}
                      onValueChange={(value) => setSearchData(prev => ({ ...prev, to: value }))}
                      placeholder="Select destination city"
                      options={stations.map(station => ({
                        value: station.name,
                        label: station.name,
                        code: station.code
                      }))}
                      icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                    />
                  </div>
                </div>

              </div>

              {/* Date and Passengers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">Travel Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={searchData.date}
                      onChange={(e) => setSearchData(prev => ({ ...prev, date: e.target.value }))}
                      className="pl-10 h-12"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengers" className="text-sm font-medium">Passengers</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Select 
                      value={searchData.passengers.toString()} 
                      onValueChange={(value) => setSearchData(prev => ({ ...prev, passengers: parseInt(value) }))}
                    >
                      <SelectTrigger className="pl-10 h-12">
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
              </div>

              <Button 
                onClick={handleSearch}
                className="w-full h-12 bg-[#002c2b] hover:bg-[#003a37] text-white text-lg font-medium"
                disabled={!searchData.from || !searchData.to || !searchData.date}
              >
                <Search className="mr-2 h-5 w-5" />
                Search Buses
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#002c2b] mb-4">
              Why Choose E-Tickets Albania?
            </h2>
            <p className="text-lg text-gray-600">
              Experience the best in Albanian bus travel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-[#002c2b]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bus className="h-8 w-8 text-[#002c2b]" />
                </div>
                <h3 className="text-xl font-semibold text-[#002c2b] mb-2">Modern Fleet</h3>
                <p className="text-gray-600">Comfortable and well-maintained buses for a pleasant journey</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-[#002c2b]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-[#002c2b]" />
                </div>
                <h3 className="text-xl font-semibold text-[#002c2b] mb-2">On-Time Service</h3>
                <p className="text-gray-600">Reliable schedules and punctual departures across Albania</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-[#002c2b]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-[#002c2b]" />
                </div>
                <h3 className="text-xl font-semibold text-[#002c2b] mb-2">Safe & Secure</h3>
                <p className="text-gray-600">Your safety is our priority with experienced drivers</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-[#002c2b]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="h-8 w-8 text-[#002c2b]" />
                </div>
                <h3 className="text-xl font-semibold text-[#002c2b] mb-2">Easy Booking</h3>
                <p className="text-gray-600">Quick and simple online ticket booking system</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#002c2b] mb-4">
              Popular Routes
            </h2>
            <p className="text-lg text-gray-600">
              Discover the most traveled routes in Albania
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingPopularRoutes ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 bg-gray-300 rounded"></div>
                        <div className="h-4 w-24 bg-gray-300 rounded"></div>
                      </div>
                      <div className="h-6 w-16 bg-gray-300 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-300 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
                      <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : popularRoutes.length > 0 ? (
              popularRoutes.map((route) => (
                <Card key={route._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePopularRouteClick(route)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Route className="h-5 w-5 text-[#002c2b]" />
                        <span className="font-semibold text-[#002c2b]">{route.name}</span>
                      </div>
                      <Badge variant="secondary" className="bg-[#002c2b]/10 text-[#002c2b]">
                        {route.fare} ALL
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{route.stations[0]?.name} → {route.stations[route.stations.length - 1]?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{Math.floor(route.duration / 60)}h {route.duration % 60}m</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4" />
                        <span>{route.distance} km</span>
                      </div>
                      {route.ticketCount && (
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4" />
                          <span>{route.ticketCount} tickets sold</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Empty state
              <div className="col-span-full text-center py-12">
                <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Popular Routes Available</h3>
                <p className="text-gray-500">Check back later for popular routes.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#002c2b] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/uploads/36cb789c-33f7-4773-9d74-d74642c0307d.png" 
                  alt="ETA Logo" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold">E-Tickets Albania</span>
              </div>
              <p className="text-gray-300 text-sm">
                Your trusted partner for bus travel across Albania. 
                Book tickets online and enjoy comfortable journeys.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><button onClick={() => navigate('/search')} className="hover:text-white">Search Buses</button></li>
                <li><button onClick={() => navigate('/routes')} className="hover:text-white">All Routes</button></li>
                <li><button onClick={() => navigate('/contact')} className="hover:text-white">Contact Us</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><button onClick={() => navigate('/help')} className="hover:text-white">Help Center</button></li>
                <li><button onClick={() => navigate('/faq')} className="hover:text-white">FAQ</button></li>
                <li><button onClick={() => navigate('/terms')} className="hover:text-white">Terms & Conditions</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+355 69 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>info@etickets.al</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>&copy; 2024 E-Tickets Albania. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;


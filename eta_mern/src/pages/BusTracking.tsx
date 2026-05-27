import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin,
  Clock,
  Bus,
  Navigation,
  ArrowLeft,
  Search,
  Route,
  Wifi,
  Users
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SchedulesAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const BusTracking = () => {
  const navigate = useNavigate();
  const { scheduleId } = useParams();
  const { toast } = useToast();
  const [trackingData, setTrackingData] = useState({
    currentLocation: 'Tirana Central Station',
    nextStop: 'Elbasan Station',
    estimatedArrival: '14:30',
    delay: 0,
    speed: 65,
    passengers: 42,
    temperature: 22
  });

  // Fetch schedule data
  const { data: schedule, isLoading } = useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: () => SchedulesAPI.getById(scheduleId!),
    enabled: !!scheduleId,
  });

  // Simulate real-time updates
  useEffect(() => {
    if (!schedule) return;

    const interval = setInterval(() => {
      setTrackingData(prev => ({
        ...prev,
        speed: Math.floor(Math.random() * 20) + 60, // 60-80 km/h
        passengers: Math.floor(Math.random() * 10) + 40, // 40-50 passengers
        delay: Math.floor(Math.random() * 10), // 0-10 minutes delay
        temperature: Math.floor(Math.random() * 5) + 20 // 20-25°C
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [schedule]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002c2b] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bus tracking...</p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Schedule not found</h2>
          <Button onClick={() => navigate('/')} className="bg-[#002c2b] hover:bg-[#003a37]">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (delay: number) => {
    if (delay === 0) return 'bg-green-100 text-green-800';
    if (delay <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-[#002c2b] hover:bg-[#002c2b]/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-[#002c2b]">Live Bus Tracking</h1>
                <p className="text-sm text-gray-600">
                  Bus {schedule.vehicleId} • {schedule.route.name}
                </p>
              </div>
            </div>
            
            <Badge className={getStatusColor(trackingData.delay)}>
              {trackingData.delay === 0 ? 'On Time' : `${trackingData.delay} min delay`}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tracking Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#002c2b]/10 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-[#002c2b]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Location</p>
                        <p className="font-semibold text-[#002c2b]">{trackingData.currentLocation}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#002c2b]/10 rounded-lg flex items-center justify-center">
                        <Route className="h-6 w-6 text-[#002c2b]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Next Stop</p>
                        <p className="font-semibold text-[#002c2b]">{trackingData.nextStop}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#002c2b]/10 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-[#002c2b]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">ETA at Next Stop</p>
                        <p className="font-semibold text-[#002c2b]">{trackingData.estimatedArrival}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#002c2b]/10 rounded-lg flex items-center justify-center">
                        <Bus className="h-6 w-6 text-[#002c2b]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Speed</p>
                        <p className="font-semibold text-[#002c2b]">{trackingData.speed} km/h</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Journey Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Journey Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Route Visualization */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mb-2"></div>
                        <p className="text-sm font-medium">Departure</p>
                        <p className="text-xs text-gray-600">{formatTime(schedule.departureTime)}</p>
                      </div>
                      <div className="flex-1 h-1 bg-gray-200 mx-4 relative">
                        <div className="h-1 bg-[#002c2b] w-1/3 relative">
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-[#002c2b] rounded-full"></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="w-4 h-4 bg-gray-400 rounded-full mb-2"></div>
                        <p className="text-sm font-medium">Arrival</p>
                        <p className="text-xs text-gray-600">{formatTime(schedule.arrivalTime)}</p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Progress: 33% Complete</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Route Stops */}
            <Card>
              <CardHeader>
                <CardTitle>Route Stops</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedule.route.stations.map((station: any, index: number) => (
                    <div key={station._id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-green-500' : index === schedule.route.stations.length - 1 ? 'bg-gray-400' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-medium">{station.name}</p>
                        <p className="text-sm text-gray-600">{station.city}, {station.state}</p>
                      </div>
                      {index === 0 && (
                        <Badge className="bg-green-100 text-green-800">Departed</Badge>
                      )}
                      {index === 1 && (
                        <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Bus Details */}
            <Card>
              <CardHeader>
                <CardTitle>Bus Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Bus className="h-5 w-5 text-[#002c2b]" />
                  <div>
                    <p className="font-medium">Vehicle ID</p>
                    <p className="text-sm text-gray-600">{schedule.vehicleId}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#002c2b]" />
                  <div>
                    <p className="font-medium">Passengers</p>
                    <p className="text-sm text-gray-600">{trackingData.passengers} / {schedule.totalSeats}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Wifi className="h-5 w-5 text-[#002c2b]" />
                  <div>
                    <p className="font-medium">Amenities</p>
                    <p className="text-sm text-gray-600">WiFi, AC, USB Charging</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-blue-500 rounded"></div>
                  <div>
                    <p className="font-medium">Temperature</p>
                    <p className="text-sm text-gray-600">{trackingData.temperature}°C</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    For real-time assistance or emergencies, contact our support team.
                  </p>
                  <Button className="w-full bg-[#002c2b] hover:bg-[#003a37]">
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full">
                    Share Location
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Refresh Button */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="w-full"
                >
                  Refresh Location
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusTracking;



import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Clock,
  MapPin,
  Bus,
  User,
  Mail,
  Phone,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TicketsAPI, SchedulesAPI } from '@/services/api';
import Header from '@/components/layout/Header';

interface BookingData {
  schedule: {
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
  };
  searchParams: {
    from: string;
    to: string;
    date: string;
    passengers: number;
  };
}

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const bookingData: BookingData = location.state;
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerCount, setPassengerCount] = useState(bookingData?.searchParams?.passengers || 1);
  const [passengerInfo, setPassengerInfo] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isBooking, setIsBooking] = useState(false);
  const [seatAvailability, setSeatAvailability] = useState<{
    scheduleId: string;
    totalSeats: number;
    availableSeats: number;
    occupiedSeats: string[];
    seatLayout: Array<{
      number: string;
      index: number;
      available: boolean;
    }>;
  } | null>(null);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);

  // Fetch seat availability from API 
  const fetchSeatAvailability = async () => {
    if (!bookingData?.schedule?._id || seatAvailability) return; // Don't fetch if already fetched
    
    setIsLoadingSeats(true);
    try {
      const availability = await SchedulesAPI.getSeatAvailability(bookingData.schedule._id);
      setSeatAvailability(availability);
      
      // Update passenger count if it exceeds available seats
      const availableSeatsCount = availability.seatLayout.filter(seat => seat.available).length;
      if (passengerCount > availableSeatsCount) {
        setPassengerCount(availableSeatsCount);
        setSelectedSeats([]); // Clear selected seats if passenger count was reduced
        toast({
          title: "Passenger Count Adjusted",
          description: `Only ${availableSeatsCount} seats are available. Passenger count has been adjusted.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error fetching seat availability:', error);
      toast({
        title: "Error",
        description: "Failed to load seat availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSeats(false);
    }
  };

  // Generate seat layout from API data
  const generateSeatLayout = () => {
    if (!seatAvailability) {
      // Fallback to static layout if API data not available
      const seats = [];
      const totalRows = Math.ceil(bookingData.schedule.totalSeats / 4);
      
      for (let row = 1; row <= totalRows; row++) {
        const rowSeats = [];
        for (let col = 1; col <= 4; col++) {
          const seatNumber = `${String.fromCharCode(64 + col)}${row}`;
          const seatIndex = (row - 1) * 4 + col - 1;
          
          if (seatIndex < bookingData.schedule.totalSeats) {
            rowSeats.push({
              number: seatNumber,
              index: seatIndex,
              available: seatIndex < bookingData.schedule.availableSeats,
              selected: selectedSeats.includes(seatNumber)
            });
          }
        }
        seats.push(rowSeats);
      }
      return seats;
    }

    // Use API data to generate layout
    const seats = [];
    const totalRows = Math.ceil(seatAvailability.totalSeats / 4);
    
    for (let row = 1; row <= totalRows; row++) {
      const rowSeats = [];
      for (let col = 1; col <= 4; col++) {
        const seatNumber = `${String.fromCharCode(64 + col)}${row}`;
        const seatIndex = (row - 1) * 4 + col - 1;
        
        if (seatIndex < seatAvailability.totalSeats) {
          const seatData = seatAvailability.seatLayout.find(seat => seat.number === seatNumber);
          rowSeats.push({
            number: seatNumber,
            index: seatIndex,
            available: seatData?.available || false,
            selected: selectedSeats.includes(seatNumber)
          });
        }
      }
      seats.push(rowSeats);
    }
    
    return seats;
  };

  const seatLayout = generateSeatLayout();

  // Helper function to get maximum available seats
  const getMaxAvailableSeats = () => {
    return seatAvailability 
      ? seatAvailability.seatLayout.filter(seat => seat.available).length
      : bookingData.schedule.availableSeats;
  };

  useEffect(() => {
    if (!bookingData) {
      toast({
        title: "Invalid Booking",
        description: "No booking data found. Please search again.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
  }, [bookingData, navigate, toast]);

  // Fetch seat availability only when seat selection step is opened
  useEffect(() => {
    if (currentStep === 1 && bookingData?.schedule?._id) {
      fetchSeatAvailability();
    }
  }, [currentStep, bookingData?.schedule?._id]);

  const handleSeatSelect = (seatNumber: string) => {
    // Check if seat is available
    const seatData = seatAvailability?.seatLayout.find(seat => seat.number === seatNumber);
    if (!seatData?.available && !selectedSeats.includes(seatNumber)) {
      toast({
        title: "Seat Not Available",
        description: `Seat ${seatNumber} is already taken. Please select another seat.`,
        variant: "destructive",
      });
      return;
    }

    if (selectedSeats.length >= passengerCount) {
      if (selectedSeats.includes(seatNumber)) {
        setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
      }
      return;
    }

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
    } else {
      setSelectedSeats(prev => [...prev, seatNumber]);
    }
  };

  const handlePassengerCountChange = (newCount: number) => {
    const maxAvailableSeats = getMaxAvailableSeats();
    
    // Restrict to maximum available seats
    const restrictedCount = Math.min(newCount, maxAvailableSeats);
    
    if (restrictedCount !== newCount) {
      toast({
        title: "Maximum Seats Reached",
        description: `Only ${maxAvailableSeats} seats are available for this schedule.`,
        variant: "destructive",
      });
    }
    
    setPassengerCount(restrictedCount);
    
    // If the new count is less than currently selected seats, remove excess seats
    if (restrictedCount < selectedSeats.length) {
      setSelectedSeats(prev => prev.slice(0, restrictedCount));
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length !== passengerCount) {
      toast({
        title: "Seat Selection Required",
        description: `Please select ${passengerCount} seat(s)`,
        variant: "destructive",
      });
      return;
    }

    if (!passengerInfo.fullName || !passengerInfo.email || !passengerInfo.phone) {
      toast({
        title: "Information Required",
        description: "Please fill in all passenger information",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      // Create ticket for each selected seat
      const bookingPromises = selectedSeats.map(seatNumber => {
        const ticketData = {
          scheduleId: bookingData.schedule._id,
          passengerName: passengerInfo.fullName,
          passengerEmail: passengerInfo.email,
          passengerPhone: passengerInfo.phone,
          seatNumber,
          paymentMethod,
          price: bookingData.schedule.route.fare
        };

        // Use guest booking API if user is not authenticated
        return isAuthenticated 
          ? TicketsAPI.create(ticketData)
          : TicketsAPI.createGuest(ticketData);
      });

      const tickets = await Promise.all(bookingPromises);

      toast({
        title: "Booking Successful!",
        description: "Your tickets have been booked successfully",
      });

      navigate('/booking-success', { 
        state: { 
          tickets,
          bookingData 
        } 
      });
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalPrice = bookingData.schedule.route.fare * passengerCount;

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Booking</h2>
          <p className="text-gray-600 mb-4">No booking data found. Please search again.</p>
          <Button onClick={() => navigate('/')} className="bg-[#002c2b] hover:bg-[#003a37]">
            Search Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Booking Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/search')}
                className="text-[#002c2b] hover:bg-[#002c2b]/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Results
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-[#002c2b]">Book Your Tickets</h1>
                <p className="text-sm text-gray-600">
                  {bookingData.searchParams.from} → {bookingData.searchParams.to}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-[#002c2b] text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step < currentStep ? 'bg-[#002c2b]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Journey Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5" />
                  Journey Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Route</p>
                    <p className="font-semibold">{bookingData.schedule.route.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{formatDate(bookingData.searchParams.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bus ID</p>
                    <p className="font-semibold">{bookingData.schedule.vehicleId}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#002c2b]" />
                    <div>
                      <p className="text-sm text-gray-600">Departure</p>
                      <p className="font-semibold">{formatTime(bookingData.schedule.departureTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#002c2b]" />
                    <div>
                      <p className="text-sm text-gray-600">Arrival</p>
                      <p className="font-semibold">{formatTime(bookingData.schedule.arrivalTime)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 1: Seat Selection */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Your Seats</CardTitle>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Select {passengerCount} seat(s). Selected seats: {selectedSeats.join(', ')}
                    </p>
                    
                    {/* Passenger Count Selector */}
                    <div className="flex items-center gap-4">
                      <Label htmlFor="passengerCount" className="text-sm font-medium">
                        Number of Passengers:
                      </Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePassengerCountChange(Math.max(1, passengerCount - 1))}
                          disabled={passengerCount <= 1}
                          className="h-8 w-8 p-0"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">{passengerCount}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const maxAvailableSeats = getMaxAvailableSeats();
                            handlePassengerCountChange(Math.min(maxAvailableSeats, passengerCount + 1));
                          }}
                          disabled={passengerCount >= getMaxAvailableSeats()}
                          className="h-8 w-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                      <span className="text-xs text-gray-500">
                        (Max {getMaxAvailableSeats()} passengers available)
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Seat Legend */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded border"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#002c2b] rounded border"></div>
                        <span>Selected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-200 rounded border"></div>
                        <span>Occupied</span>
                      </div>
                    </div>

                    {/* Seat Layout */}
                    <div className="border rounded-lg p-6">
                      <div className="text-center mb-4">
                        <div className="w-8 h-8 bg-gray-300 rounded mb-2 mx-auto"></div>
                        <span className="text-sm text-gray-600">Front</span>
                      </div>
                      
                      {isLoadingSeats ? (
                        <div className="flex flex-col items-center space-y-4 py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002c2b]"></div>
                          <p className="text-sm text-gray-600">Loading seat availability...</p>
                        </div>
                      ) : (
                        seatLayout.map((row, rowIndex) => (
                          <div key={rowIndex} className="flex justify-center gap-2 mb-2">
                            {row.map((seat) => (
                              <button
                                key={seat.number}
                                onClick={() => seat.available && handleSeatSelect(seat.number)}
                                disabled={!seat.available}
                                className={`w-8 h-8 rounded border text-xs font-medium transition-colors ${
                                  seat.selected
                                    ? 'bg-[#002c2b] text-white border-[#002c2b]'
                                    : seat.available
                                    ? 'bg-white text-gray-700 border-gray-300 hover:border-[#002c2b] hover:bg-[#002c2b]/10'
                                    : 'bg-red-100 text-gray-400 border-red-200 cursor-not-allowed'
                                }`}
                              >
                                {seat.number}
                              </button>
                            ))}
                          </div>
                        ))
                      )}
                    </div>

                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={selectedSeats.length !== passengerCount}
                      className="w-full bg-[#002c2b] hover:bg-[#003a37]"
                    >
                      Continue to Passenger Information
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Passenger Information */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Passenger Information
                  </CardTitle>
                  {!isAuthenticated && (
                    <p className="text-sm text-gray-600">
                      Already have an account? <button 
                        onClick={() => navigate('/auth')} 
                        className="text-[#002c2b] hover:underline font-medium"
                      >
                        Sign in here
                      </button>
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          value={passengerInfo.fullName}
                          onChange={(e) => setPassengerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                          className="pl-10"
                          placeholder="Enter full name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={passengerInfo.phone}
                          onChange={(e) => setPassengerInfo(prev => ({ ...prev, phone: e.target.value }))}
                          className="pl-10"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={passengerInfo.email}
                        onChange={(e) => setPassengerInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      Back to Seat Selection
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 bg-[#002c2b] hover:bg-[#003a37]"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'credit_card', label: 'Credit Card' },
                        { id: 'debit_card', label: 'Debit Card' },
                        { id: 'bank_transfer', label: 'Bank Transfer' },
                        { id: 'cash', label: 'Cash on Board' }
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-4 border rounded-lg text-left transition-colors ${
                            paymentMethod === method.id
                              ? 'border-[#002c2b] bg-[#002c2b]/10'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1"
                    >
                      Back to Passenger Info
                    </Button>
                    <Button
                      onClick={handleBooking}
                      disabled={isBooking}
                      className="flex-1 bg-[#002c2b] hover:bg-[#003a37]"
                    >
                      {isBooking ? 'Processing...' : 'Complete Booking'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Route:</span>
                    <span className="font-medium">{bookingData.schedule.route.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Date:</span>
                    <span className="font-medium">{formatDate(bookingData.searchParams.date)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Passengers:</span>
                    <span className="font-medium">{passengerCount}</span>
                  </div>
                  {selectedSeats.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Seats:</span>
                      <span className="font-medium">{selectedSeats.join(', ')}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Price per ticket:</span>
                    <span>{bookingData.schedule.route.fare} ALL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Quantity:</span>
                    <span>{passengerCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes & Fees:</span>
                    <span>0 ALL</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{totalPrice} ALL</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;


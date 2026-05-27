import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { SchedulesAPI, TicketsAPI } from '@/services/api';
import { Schedule, Ticket } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  MapPin, 
  Users, 
  QrCode, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  Scan,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import QRScanner from '@/components/QRScanner';
import QRCodeDisplay from '@/components/ui/qr-code';
import UserLayout from '@/components/layout/UserLayout';

const BusmanDashboard: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showScheduleDetails, setShowScheduleDetails] = useState(false);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<Ticket | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('');

  // Fetch schedules for the assigned route and busman
  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['busman-schedules', user?._id],
    queryFn: () => SchedulesAPI.getBusmanSchedules(),
    enabled: !!user?._id
  });

  // Fetch tickets for the selected schedule
  const { data: selectedScheduleTicketsResponse } = useQuery({
    queryKey: ['busman-tickets', selectedSchedule?._id],
    queryFn: async () => {
      if (!selectedSchedule?._id) return { data: [] };
      return TicketsAPI.getBySchedule(selectedSchedule._id);
    },
    enabled: !!selectedSchedule?._id
  });

  const scheduleTickets = Array.isArray(selectedScheduleTicketsResponse)
    ? selectedScheduleTicketsResponse
    : Array.isArray(selectedScheduleTicketsResponse?.data)
    ? selectedScheduleTicketsResponse.data
    : [];

  const filteredScheduleTickets = scheduleTickets.filter((ticket: any) => {
    const query = scheduleSearch.trim().toLowerCase();
    if (!query) return true;
    const values = [ticket.passengerName, ticket.passengerEmail, ticket.seatNumber];
    return values.some(value => String(value ?? '').toLowerCase().includes(query));
  });

  const isSelectedSchedulePast = selectedSchedule
    ? new Date(selectedSchedule.arrivalTime) < new Date()
    : false;

  const scheduleFilterText = scheduleFilter.trim().toLowerCase();

  const scheduleMatchesSearch = (schedule: Schedule) => {
    if (!scheduleFilterText) return true;

    const routeName = typeof schedule.route === 'string' ? schedule.route : schedule.route?.name || '';
    const departureText = format(new Date(schedule.departureTime), 'MMM dd, yyyy HH:mm');
    const arrivalText = format(new Date(schedule.arrivalTime), 'MMM dd, yyyy HH:mm');

    return [routeName, departureText, arrivalText].some(value =>
      value.toLowerCase().includes(scheduleFilterText)
    );
  };

  const getUpcomingSchedules = () => {
    const now = new Date();
    return schedules.filter(schedule => new Date(schedule.departureTime) > now && scheduleMatchesSearch(schedule));
  };

  const getCurrentSchedules = () => {
    const now = new Date();
    return schedules.filter(schedule => {
      const departureTime = new Date(schedule.departureTime);
      const arrivalTime = new Date(schedule.arrivalTime);
      return departureTime <= now && arrivalTime >= now && scheduleMatchesSearch(schedule);
    });
  };

  const getPastSchedules = () => {
    const now = new Date();
    return schedules.filter(schedule => new Date(schedule.arrivalTime) < now);
  };

  const handleQRScanSuccess = async (qrData: string) => {
      console.log(qrData);

    try {
      setScanError(null);
      
      let ticketId = '';

      try {
        const parsed = JSON.parse(qrData);
        ticketId = parsed.ticketId || parsed.id || qrData;
        console.log('Extracted ticket ID from JSON:', qrData);
      } catch {
        ticketId = qrData;
      }

      // Fetch ticket details
      const ticket = await TicketsAPI.getById(ticketId);
      
      // Validate ticket
      if (!ticket) {
        setScanError('Ticket not found. Invalid QR code.');
        setShowQRScanner(false);
        toast({
          title: 'Scan Error',
          description: 'Ticket not found. Invalid QR code.',
          variant: 'destructive'
        });
        return;
      }

      if (ticket.status === 'completed') {
        setScanError('This ticket has already been checked in. The QR code is expired.');
        setShowQRScanner(false);
        toast({
          title: 'Expired Ticket',
          description: 'This ticket has already been checked in and cannot be processed again.',
          variant: 'destructive'
        });
        return;
      }

      if (ticket.status === 'cancelled') {
        setScanError('This ticket has been cancelled and cannot be used.');
        setShowQRScanner(false);
        toast({
          title: 'Cancelled Ticket',
          description: 'This ticket has been cancelled and cannot be checked in.',
          variant: 'destructive'
        });
        return;
      }

      const ticketScheduleId = typeof ticket.schedule === 'string'
        ? ticket.schedule
        : ticket.schedule?._id;

      if (ticketScheduleId !== selectedSchedule?._id) {
        setScanError('This ticket does not belong to the current schedule.');
        setShowQRScanner(false);
        toast({
          title: 'Invalid Schedule',
          description: 'This ticket is not valid for the selected schedule.',
          variant: 'destructive'
        });
        return;
      }

      setScannedTicket(ticket);
      setShowQRScanner(false);
      setShowTicketDetails(true);

      toast({
        title: 'Ticket Scanned Successfully',
        description: `Ticket for ${ticket.passengerName} has been verified.`,
      });
    } catch (error: any) {
      setScanError(error.message || 'Failed to verify ticket. Please try again.');
      toast({
        title: 'Scan Error',
        description: error.message || 'Failed to verify ticket.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkTicketUsed = async () => {
    if (!scannedTicket || !selectedSchedule) return;
    
    try {
      await TicketsAPI.checkIn(scannedTicket._id, selectedSchedule._id);
      
      setScannedTicket(null);
      setShowTicketDetails(false);
      
      toast({
        title: 'Success',
        description: 'Passenger boarding confirmed and QR code expired.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update ticket status.',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (isLoadingSchedules) {
    return (
      <UserLayout pageTitle="Busman Dashboard" pageSubtitle="Manage your assigned schedules">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002c2b]"></div>
        </div>
      </UserLayout>
    );
  }

  const upcomingSchedules = getUpcomingSchedules();
  const currentSchedules = getCurrentSchedules();
  const pastSchedules = getPastSchedules();

  return (
    <UserLayout pageTitle="Busman Dashboard" pageSubtitle="Manage your assigned schedules">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#002c2b]">Busman Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Assigned Route: <span className="font-semibold">{user?.assignedRoute?.name || 'Not assigned'}</span>
                </p>
              </div>
              <Badge className="bg-[#002c2b] text-white text-base px-4 py-2 mt-0 sm:mt-0">
                {schedules.length} Schedules
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {schedules.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schedules</h3>
                <p className="text-gray-600">No schedules have been assigned to you yet.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4">
                <Input
                  placeholder="Search schedules by route, departure or arrival"
                  value={scheduleFilter}
                  onChange={event => setScheduleFilter(event.target.value)}
                  className="w-full"
                />
              </div>
              <Tabs defaultValue="current" className="w-full">
              <TabsList className="flex h-auto w-full min-w-0 flex-col sm:flex-row gap-2 bg-white border p-3 rounded-lg overflow-x-auto">
                <TabsTrigger value="current" className="w-full min-w-0 flex items-center justify-between sm:justify-center text-left sm:text-center gap-2 whitespace-normal">
                  <span>Current</span>
                  {currentSchedules.length > 0 && (
                    <Badge variant="secondary" className="ml-2 sm:ml-0 sm:mt-1 bg-blue-100 text-blue-800 shrink-0">
                      {currentSchedules.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="w-full min-w-0 flex items-center justify-between sm:justify-center text-left sm:text-center gap-2 whitespace-normal">
                  <span>Upcoming</span>
                  {upcomingSchedules.length > 0 && (
                    <Badge variant="secondary" className="ml-2 sm:ml-0 sm:mt-1 bg-green-100 text-green-800 shrink-0">
                      {upcomingSchedules.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="past" className="w-full min-w-0 flex items-center justify-between sm:justify-center text-left sm:text-center gap-2 whitespace-normal">
                  <span>Past</span>
                  {pastSchedules.length > 0 && (
                    <Badge variant="secondary" className="ml-2 sm:ml-0 sm:mt-1 bg-gray-100 text-gray-800 shrink-0">
                      {pastSchedules.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Current Schedules */}
              <TabsContent value="current" className="space-y-4">
                {currentSchedules.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-600">
                      No active schedules at the moment.
                    </CardContent>
                  </Card>
                ) : (
                  currentSchedules.map(schedule => (
                    <ScheduleCard
                      key={schedule._id}
                      schedule={schedule}
                      onScanClick={() => {
                        setSelectedSchedule(schedule);
                        setShowQRScanner(true);
                        setScanError(null);
                      }}
                      onViewDetails={() => {
                        setSelectedSchedule(schedule);
                        setShowScheduleDetails(true);
                        setScanError(null);
                      }}
                    />
                  ))
                )}
              </TabsContent>

              {/* Upcoming Schedules */}
              <TabsContent value="upcoming" className="space-y-4">
                {upcomingSchedules.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-600">
                      No upcoming schedules.
                    </CardContent>
                  </Card>
                ) : (
                  upcomingSchedules.map(schedule => (
                    <ScheduleCard
                      key={schedule._id}
                      schedule={schedule}
                      onScanClick={() => {
                        setSelectedSchedule(schedule);
                        setShowQRScanner(true);
                        setScanError(null);
                      }}
                      onViewDetails={() => {
                        setSelectedSchedule(schedule);
                        setShowScheduleDetails(true);
                        setScanError(null);
                      }}
                      isFuture
                    />
                  ))
                )}
              </TabsContent>

              {/* Past Schedules */}
              <TabsContent value="past" className="space-y-4">
                {pastSchedules.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-600">
                      No past schedules.
                    </CardContent>
                  </Card>
                ) : (
                  pastSchedules.map(schedule => (
                    <ScheduleCard
                      key={schedule._id}
                      schedule={schedule}
                      onViewDetails={() => {
                        setSelectedSchedule(schedule);
                        setShowScheduleDetails(true);
                        setScanError(null);
                      }}
                      isPast
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>

            {selectedSchedule && showScheduleDetails && (
              <Dialog open={showScheduleDetails} onOpenChange={setShowScheduleDetails}>
                <DialogContent className="max-w-full sm:max-w-5xl" autoFocus={false}>
                  <DialogHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <DialogTitle>Schedule Details</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-[1fr_auto] mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {(typeof selectedSchedule.route === 'string' ? selectedSchedule.route : selectedSchedule.route?.name) || 'Schedule'}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {format(new Date(selectedSchedule.departureTime), 'MMM dd, HH:mm')} → {format(new Date(selectedSchedule.arrivalTime), 'HH:mm')} · {selectedSchedule.vehicleId}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {selectedSchedule.availableSeats}/{selectedSchedule.totalSeats} seats{typeof selectedSchedule.route === 'string' ? '' : ` · ${selectedSchedule.route?.distance ?? ''} km`}
                      </p>
                    </div>
                    <div className="flex items-start gap-2 sm:justify-end">
                      {!isSelectedSchedulePast && (
                        <Button
                          onClick={() => setShowQRScanner(true)}
                          className="bg-[#002c2b] hover:bg-[#003a37] px-3 py-2 text-sm h-9"
                        >
                          <Scan className="h-4 w-4 mr-2" />
                          New Scan
                        </Button>
                      )}
                      {isSelectedSchedulePast && (
                        <Badge className="bg-gray-100 text-gray-700 px-3 py-2 text-sm h-9 inline-flex items-center">
                          Past schedule — no new scans
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <Input
                      placeholder="Search tickets by name, email, or seat"
                      value={scheduleSearch}
                      onChange={event => setScheduleSearch(event.target.value)}
                    />
                  </div>

                  <div className="overflow-x-auto">
                    {filteredScheduleTickets.length === 0 ? (
                      <div className="p-6 text-center text-gray-600">
                        No tickets found for this schedule yet.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ticket ID</TableHead>
                            <TableHead>Passenger</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Seat</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Checked In</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredScheduleTickets.map((ticket: any) => (
                            <TableRow key={ticket._id}>
                              <TableCell>{ticket._id.slice(-8).toUpperCase()}</TableCell>
                              <TableCell>{ticket.passengerName}</TableCell>
                              <TableCell>{ticket.passengerEmail}</TableCell>
                              <TableCell>{ticket.seatNumber}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    ticket.status === 'completed'
                                      ? 'bg-blue-100 text-blue-800'
                                      : ticket.status === 'confirmed'
                                      ? 'bg-green-100 text-green-800'
                                      : ticket.status === 'cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }
                                >
                                  {ticket.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {ticket.checkedInAt ? format(new Date(ticket.checkedInAt), 'MMM dd, HH:mm') : '—'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScanSuccess={handleQRScanSuccess}
          onClose={() => {
            setShowQRScanner(false);
            setScanError(null);
          }}
        />
      )}

      {/* Ticket Details Modal */}
      <Dialog open={showTicketDetails} onOpenChange={setShowTicketDetails}>
        <DialogContent className="max-w-full sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scanned Ticket Details</DialogTitle>
            <DialogDescription>
              Verify and process the passenger boarding
            </DialogDescription>
          </DialogHeader>

          {scanError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{scanError}</AlertDescription>
            </Alert>
          )}

          {scannedTicket && (
            <div className="space-y-4">
              {/* Status Alert */}
              {scannedTicket.status === 'confirmed' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Ticket is valid and ready for boarding
                  </AlertDescription>
                </Alert>
              )}

              {scannedTicket.status === 'completed' && (
                <Alert className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    This ticket has already been used for boarding
                  </AlertDescription>
                </Alert>
              )}

              {scannedTicket.status === 'cancelled' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This ticket has been cancelled
                  </AlertDescription>
                </Alert>
              )}

              {/* Ticket Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Passenger Name</p>
                  <p className="font-semibold text-gray-900">{scannedTicket.passengerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Seat Number</p>
                  <p className="font-semibold text-gray-900">{scannedTicket.seatNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-mono text-sm text-gray-900">{scannedTicket.passengerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{scannedTicket.passengerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-semibold text-[#002c2b] text-lg">${scannedTicket.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge
                    className={
                      scannedTicket.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : scannedTicket.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {scannedTicket.status}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button
                  onClick={handleMarkTicketUsed}
                  disabled={scannedTicket.status === 'completed' || scannedTicket.status === 'cancelled'}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Boarding
                </Button>
                <Button
                  onClick={() => setShowTicketDetails(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
};

// Schedule Card Component
interface ScheduleCardProps {
  schedule: Schedule & { route: any };
  onScanClick?: () => void;
  onViewDetails?: () => void;
  isFuture?: boolean;
  isPast?: boolean;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onScanClick,
  onViewDetails,
  isFuture,
  isPast
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-6 overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[#002c2b] mb-1 truncate">
              {schedule.route?.name || 'Route'}
            </h3>
            <p className="text-sm text-gray-600">
              Vehicle: <span className="font-mono">{schedule.vehicleId}</span>
            </p>
          </div>
          <Badge
            className={
              schedule.status === 'scheduled'
                ? 'bg-blue-100 text-blue-800 shrink-0'
                : schedule.status === 'delayed'
                ? 'bg-yellow-100 text-yellow-800 shrink-0'
                : schedule.status === 'completed'
                ? 'bg-green-100 text-green-800 shrink-0'
                : 'bg-red-100 text-red-800 shrink-0'
            }
          >
            {schedule.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-gray-500 mt-1" />
            <div>
              <p className="text-xs text-gray-600">Departure</p>
              <p className="font-semibold">{format(new Date(schedule.departureTime), 'HH:mm')}</p>
              <p className="text-xs text-gray-600">{format(new Date(schedule.departureTime), 'MMM dd')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">Arrival</p>
              <p className="font-semibold">{format(new Date(schedule.arrivalTime), 'HH:mm')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">Seats</p>
              <p className="font-semibold">
                {schedule.availableSeats}/{schedule.totalSeats}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">Distance</p>
              <p className="font-semibold">{schedule.route?.distance} km</p>
            </div>
          </div>
        </div>

        {/* Scan QR Code Section - For current and upcoming schedules */}
        {!isPast && (
          <div className="space-y-2">
            <Button
              onClick={onScanClick}
              className="w-full bg-[#002c2b] hover:bg-[#003a37] whitespace-normal break-words"
            >
              <Scan className="h-4 w-4 mr-2" />
              Scan QR Code & Process Boarding
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={onViewDetails}
            >
              View Schedule Details
            </Button>
          </div>
        )}

        {isPast && onViewDetails && (
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={onViewDetails}
            >
              View Schedule Details
            </Button>
          </div>
        )}

        {isPast && !onViewDetails && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-800">Completed - No longer accepting passengers</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusmanDashboard;

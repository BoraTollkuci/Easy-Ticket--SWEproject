import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Ticket,
  Clock,
  MapPin,
  Bus,
  Search,
  Download,
  Eye,
  Calendar,
  User,
  Phone,
  Mail,
  Settings,
  LogOut,
  CheckCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { TicketsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import UserLayout from '@/components/layout/UserLayout';
import QRCodeDisplay from '@/components/ui/qr-code';
import jsPDF from 'jspdf';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch user's tickets
  const { data: ticketsData, isLoading, refetch } = useQuery({
    queryKey: ['userTickets'],
    queryFn: () => TicketsAPI.getMyTickets({ limit: 50 }),
  });

  const tickets = ticketsData || [];

  const getTicketSchedule = (ticket: any) => {
    const schedule = ticket?.schedule;
    if (!schedule || typeof schedule === 'string') return null;

    const route = schedule.route;
    const routeName = typeof route === 'string' ? route : route?.name;

    return {
      routeName,
      departureTime: schedule.departureTime,
      vehicleId: schedule.vehicleId
    };
  };

  const recentlyCheckedInTickets = tickets.filter(ticket => {
    return ticket.status === 'completed' && ticket.checkedInAt &&
      new Date(ticket.checkedInAt) > new Date(Date.now() - 1000 * 60 * 60 * 6);
  });

  const filteredTickets = tickets.filter(ticket => {
    const ticketSchedule = getTicketSchedule(ticket);
    const matchesSearch = ticket.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ticketSchedule?.routeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.seatNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCancelTicket = async (ticketId: string) => {
    try {
      await TicketsAPI.update(ticketId, {
        status: 'cancelled',
        cancellationReason: 'Cancelled by user'
      });
      
      toast({
        title: "Ticket Cancelled",
        description: "Your ticket has been cancelled successfully",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel ticket",
        variant: "destructive",
      });
    }
  };

  const handleDownloadTicket = async (ticket: any) => {

      toast({
        title: "Download Started",
        description: "Your ticket will be downloaded shortly",
      });

      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 20;
  
        // Add title
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('E-Tickets Albania - Booking Confirmation', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;
  
        // Add booking summary
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Route: ${getTicketSchedule(ticket)?.routeName || 'N/A'}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Date: ${ticket.purchaseDate}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Passengers: ${ticket.passengerCount || 1}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Total Amount: ${ticket.price} ALL`, 20, yPosition);
        yPosition += 15;

        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 20;
        }

      // Ticket header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Ticket `, 20, yPosition);
      yPosition += 10;

        // Ticket details
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Passenger: ${ticket.passengerName}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Email: ${ticket.passengerEmail}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Phone: ${ticket.passengerPhone}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Seat: ${ticket.seatNumber}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Price: ${ticket.price} ALL`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Status: ${ticket.status.toUpperCase()}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Ticket ID: ${ticket._id.slice(-8).toUpperCase()}`, 20, yPosition);
        yPosition += 15;

        // Add QR code if available
        if (ticket.qrCode) {
          try {
            // Convert base64 to image
            const img = new Image();
            img.src = ticket.qrCode;
            
            // Wait for image to load
            await new Promise((resolve) => {
              img.onload = resolve;
            });
            
            // Add QR code to PDF
            const qrSize = 30;
            const qrX = pageWidth - qrSize - 20;
            const qrY = yPosition - 40;
            
            pdf.addImage(ticket.qrCode, 'PNG', qrX, qrY, qrSize, qrSize);
            
            // Add QR code label
            pdf.setFontSize(8);
            pdf.text('QR Code', qrX, qrY + qrSize + 5);
          } catch (error) {
            console.error('Error adding QR code to PDF:', error);
          }
        }
  
        yPosition += 20;
  
        // Add footer
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Thank you for choosing E-Tickets Albania!', pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text('For support, contact: +355 69 123 4567', pageWidth / 2, pageHeight - 5, { align: 'center' });
  
        // Download the PDF
        pdf.save(`booking-confirmation-${new Date().toISOString().split('T')[0]}.pdf`);
        
        toast({
          title: "Download Complete",
          description: "Your booking confirmation has been downloaded as PDF",
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast({
          title: "Download Failed",
          description: "Failed to generate PDF. Please try again.",
          variant: "destructive",
        });
      }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingTickets = tickets.filter(ticket => 
    ticket.status === 'confirmed' || ticket.status === 'reserved'
  );

  const pastTickets = tickets.filter(ticket => 
    ticket.status === 'completed' || ticket.status === 'cancelled'
  );

  return (
    <UserLayout 
      pageTitle="My Dashboard" 
      pageSubtitle={`Welcome back, ${user?.fullName}`}
    >
      <div className="max-w-7xl mx-auto">
        {recentlyCheckedInTickets.length > 0 && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Boarding confirmed for {recentlyCheckedInTickets.length} ticket(s). Your QR code is now expired and cannot be reused.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-[#002c2b]">{tickets.length}</p>
                </div>
                <Ticket className="h-8 w-8 text-[#002c2b]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Trips</p>
                  <p className="text-2xl font-bold text-[#002c2b]">{upcomingTickets.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-[#002c2b]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-[#002c2b]">
                    {tickets.filter(t => t.status === 'completed').length}
                  </p>
                </div>
                <Bus className="h-8 w-8 text-[#002c2b]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-[#002c2b]">
                    {tickets.filter(t => t.status === 'cancelled').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-[#002c2b]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                My Tickets
              </CardTitle>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#002c2b] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="reserved">Reserved</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">Upcoming Trips ({upcomingTickets.length})</TabsTrigger>
                <TabsTrigger value="history">Trip History ({pastTickets.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002c2b] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tickets...</p>
                  </div>
                ) : upcomingTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming trips</h3>
                    <p className="text-gray-600 mb-4">You don't have any upcoming bus trips booked.</p>
                    <Button onClick={() => navigate('/')} className="bg-[#002c2b] hover:bg-[#003a37]">
                      Search for Buses
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingTickets
                      .filter(ticket => 
                        ticket.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (getTicketSchedule(ticket)?.routeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ticket.seatNumber.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((ticket) => {
                        const ticketSchedule = getTicketSchedule(ticket);
                        return (
                      <Card key={ticket._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
                                <div className="w-12 h-12 bg-[#002c2b]/10 rounded-lg flex items-center justify-center">
                                  <Bus className="h-6 w-6 text-[#002c2b]" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg text-[#002c2b]">
                                    {ticketSchedule?.routeName || 'Route unavailable'}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    Ticket #{ticket._id.slice(-8).toUpperCase()}
                                  </p>
                                </div>
                                <Badge className={getStatusColor(ticket.status)}>
                                  {ticket.status}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">{ticketSchedule ? formatDate(ticketSchedule.departureTime) : 'Loading...'}</p>
                                    <p className="text-gray-500">Travel Date</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">{ticketSchedule ? formatTime(ticketSchedule.departureTime) : 'Loading...'}</p>
                                    <p className="text-gray-500">Departure</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">Seat {ticket.seatNumber}</p>
                                    <p className="text-gray-500">Bus {ticketSchedule?.vehicleId || 'Loading...'}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">{ticket.passengerName}</p>
                                    <p className="text-gray-500">{ticket.price} ALL</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 ml-6">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadTicket(ticket)}
                                className="text-[#002c2b] border-[#002c2b] hover:bg-[#002c2b] hover:text-white"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              
                              {ticket.status === 'confirmed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelTicket(ticket._id)}
                                  className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                        );
                      })}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                {pastTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No trip history</h3>
                    <p className="text-gray-600">Your completed and cancelled trips will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastTickets
                      .filter(ticket => 
                        ticket.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (getTicketSchedule(ticket)?.routeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ticket.seatNumber.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((ticket) => {
                        const ticketSchedule = getTicketSchedule(ticket);
                        return (
                      <Card key={ticket._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Bus className="h-6 w-6 text-gray-500" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900">
                                    {ticketSchedule?.routeName || 'Loading...'}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    Ticket #{ticket._id.slice(-8).toUpperCase()}
                                  </p>
                                </div>
                                <Badge className={getStatusColor(ticket.status)}>
                                  {ticket.status}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">{ticketSchedule ? formatDate(ticketSchedule.departureTime) : 'Loading...'}</p>
                                    <p className="text-gray-500">Travel Date</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">{ticketSchedule ? formatTime(ticketSchedule.departureTime) : 'Loading...'}</p>
                                    <p className="text-gray-500">Departure</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">Seat {ticket.seatNumber}</p>
                                    <p className="text-gray-500">Bus {ticketSchedule?.vehicleId || 'Loading...'}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">{ticket.passengerName}</p>
                                    <p className="text-gray-500">{ticket.price} ALL</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 ml-6">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadTicket(ticket)}
                                className="text-[#002c2b] border-[#002c2b] hover:bg-[#002c2b] hover:text-white"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                        );
                      })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default UserDashboard;


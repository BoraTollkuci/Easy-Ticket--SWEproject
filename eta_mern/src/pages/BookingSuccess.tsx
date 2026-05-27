import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle,
  Download,
  Home,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Bus,
  User,
  Mail,
  Phone
} from 'lucide-react';
import QRCodeDisplay from '@/components/ui/qr-code';
import Header from '@/components/layout/Header';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { tickets, bookingData } = location.state || {};

  if (!tickets || !Array.isArray(tickets) || tickets.length === 0 || !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No booking data found</h2>
          <p className="text-gray-600 mb-4">Please complete a booking to view your tickets.</p>
          <Button onClick={() => navigate('/')} className="bg-[#002c2b] hover:bg-[#003a37]">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

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

  const handleDownloadAll = async () => {
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
      pdf.text(`Route: ${bookingData.schedule.route.name}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Date: ${formatDate(bookingData.searchParams.date)}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Passengers: ${bookingData.searchParams.passengers}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Total Amount: ${totalAmount} ALL`, 20, yPosition);
      yPosition += 15;

      // Add each ticket
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 20;
        }

        // Ticket header
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Ticket ${i + 1}`, 20, yPosition);
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
      }

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

  const totalAmount = tickets.reduce((sum: number, ticket: any) => sum + (ticket.price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Success Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#002c2b] mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">
              Your tickets have been booked successfully. You will receive a confirmation email shortly.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Booking Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-[#002c2b] mb-2">Journey Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-gray-500" />
                    <span>{bookingData.schedule.route.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(bookingData.searchParams.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{formatTime(bookingData.schedule.departureTime)} - {formatTime(bookingData.schedule.arrivalTime)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-[#002c2b] mb-2">Passenger Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{tickets[0].passengerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{tickets[0].passengerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{tickets[0].passengerPhone}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-[#002c2b] mb-2">Payment</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tickets ({tickets.length}):</span>
                    <span>{totalAmount} ALL</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Fees:</span>
                    <span>0 ALL</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Paid:</span>
                      <span>{totalAmount} ALL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Tickets */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#002c2b]">Your Tickets</h2>
            <Button
              onClick={handleDownloadAll}
              className="bg-[#002c2b] hover:bg-[#003a37]"
            >
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>

          {tickets.map((ticket: any, index: number) => (
            <Card key={ticket._id} className="hover:shadow-xl transition-all duration-300 border-2 border-[#002c2b]/10">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Ticket Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#002c2b]/20 to-[#002c2b]/10 rounded-xl flex items-center justify-center">
                        <Bus className="h-8 w-8 text-[#002c2b]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-[#002c2b]">
                          {ticket.schedule?.route?.name || bookingData.schedule.route.name}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          Ticket #{ticket._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 px-3 py-1 text-sm font-semibold">
                        ✓ Confirmed
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-[#002c2b]" />
                        <div>
                          <p className="font-semibold text-gray-900">{formatDate(ticket.schedule?.departureTime || bookingData.schedule.departureTime)}</p>
                          <p className="text-sm text-gray-600">Travel Date</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-5 w-5 text-[#002c2b]" />
                        <div>
                          <p className="font-semibold text-gray-900">{formatTime(ticket.schedule?.departureTime || bookingData.schedule.departureTime)}</p>
                          <p className="text-sm text-gray-600">Departure Time</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-[#002c2b]" />
                        <div>
                          <p className="font-semibold text-gray-900">Seat {ticket.seatNumber}</p>
                          <p className="text-sm text-gray-600">Bus {ticket.schedule?.vehicleId || bookingData.schedule.vehicleId}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <User className="h-5 w-5 text-[#002c2b]" />
                        <div>
                          <p className="font-semibold text-gray-900">{ticket.passengerName}</p>
                          <p className="text-sm text-gray-600">{ticket.price} ALL</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* QR Code - More Prominent */}
                  <div className="flex justify-center xl:justify-end">
                    <QRCodeDisplay
                      qrCodeImage={ticket.qrCode}
                      ticketId={ticket._id}
                      seatNumber={ticket.seatNumber}
                      passengerName={ticket.passengerName}
                      className="w-full max-w-80"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Important Information */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Important Information</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <ul className="space-y-2 text-sm">
              <li>• Please arrive at the bus station at least 15 minutes before departure time.</li>
              <li>• Bring a valid ID and your ticket (digital or printed) for boarding.</li>
              <li>• In case of any issues, contact our customer support at +355 69 123 4567.</li>
              <li>• You can cancel your tickets up to 2 hours before departure through your dashboard.</li>
              <li>• Check your email for the booking confirmation and ticket details.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="text-[#002c2b] border-[#002c2b] hover:bg-[#002c2b] hover:text-white"
          >
            View My Tickets
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="bg-[#002c2b] hover:bg-[#003a37]"
          >
            <Home className="h-4 w-4 mr-2" />
            Book Another Trip
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;



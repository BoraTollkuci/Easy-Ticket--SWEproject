import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TicketsAPI, SchedulesAPI } from '@/services/api';
import { Ticket, Schedule } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, User, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import jsPDF from 'jspdf';

const AdminTickets: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [ticketDialogMode, setTicketDialogMode] = useState<'update' | 'payment'>('update');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>('');
  const [ticketForm, setTicketForm] = useState({
    status: 'confirmed' as Ticket['status'],
    paymentStatus: 'pending' as Ticket['paymentStatus'],
    paymentMethod: 'credit_card' as Ticket['paymentMethod'],
    paymentReference: '',
    cancellationReason: ''
  });
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch data
  const { data: ticketsData, isLoading: isLoadingTickets } = useQuery({
    queryKey: ['admin-tickets', filters],
    queryFn: () => {
      const queryParams: any = {};
      if (filters.status && filters.status !== 'all') queryParams.status = filters.status;
      if (filters.dateFrom && filters.dateTo) {
        queryParams.startDate = filters.dateFrom;
        queryParams.endDate = filters.dateTo;
      }
      return TicketsAPI.getAll(queryParams);
    }
  });

  const tickets = Array.isArray(ticketsData)
    ? ticketsData
    : ((ticketsData as any)?.data || []);

  // Mutations
  const refundTicketMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => TicketsAPI.refund(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      setIsRefundDialogOpen(false);
      setSelectedTicket(null);
      setRefundAmount(0);
      setRefundReason('');
      toast({ title: 'Success', description: 'Ticket refunded successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to refund ticket' });
    }
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => TicketsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      setIsTicketDialogOpen(false);
      setSelectedTicket(null);
      toast({ title: 'Success', description: 'Ticket updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update ticket' });
    }
  });

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
        pdf.text(`Route: ${ticket.schedule.route?.name}`, 20, yPosition);
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

  const cancelTicketMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => TicketsAPI.cancel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      toast({ title: 'Success', description: 'Ticket cancelled successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to cancel ticket' });
    }
  });

  const handleRefund = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setRefundAmount(ticket.price);
    setRefundReason('');
    setIsRefundDialogOpen(true);
  };

  const confirmRefund = () => {
    if (selectedTicket) {
      refundTicketMutation.mutate({
        id: selectedTicket._id,
        data: {
          refundAmount,
          refundReason
        }
      });
    }
  };

  const handleCancel = (ticket: Ticket) => {
    if (window.confirm('Are you sure you want to cancel this ticket?')) {
      cancelTicketMutation.mutate({
        id: ticket._id,
        data: {
          cancellationReason: 'Cancelled by admin'
        }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScheduleInfo = (schedule: Schedule | string) => {
    if (!schedule || typeof schedule === 'string') return null;
    return {
      vehicleId: schedule.vehicleId,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      routeName: schedule?.route?.name
    };
  };

  const getRouteName = (ticket: Ticket) => {
    if (!ticket.schedule || typeof ticket.schedule === 'string') return '';
    if (!ticket.schedule.route || typeof ticket.schedule.route === 'string') return '';
    return ticket.schedule.route.name;
  };

  const openTicketDialog = (ticket: Ticket, mode: 'update' | 'payment') => {
    setSelectedTicket(ticket);
    setTicketDialogMode(mode);
    setTicketForm({
      status: mode === 'payment' ? 'confirmed' : ticket.status,
      paymentStatus: mode === 'payment' ? 'completed' : ticket.paymentStatus,
      paymentMethod: ticket.paymentMethod,
      paymentReference: ticket.paymentReference || '',
      cancellationReason: ticket.cancellationReason || ''
    });
    setIsTicketDialogOpen(true);
  };

  const submitTicketDialog = () => {
    if (!selectedTicket) return;

    const payload: Record<string, any> = {
      status: ticketDialogMode === 'payment' ? 'confirmed' : ticketForm.status,
      paymentStatus: ticketDialogMode === 'payment' ? 'completed' : ticketForm.paymentStatus,
      paymentMethod: ticketForm.paymentMethod,
      paymentReference: ticketForm.paymentReference
    };

    if (payload.status === 'cancelled') {
      payload.cancellationReason = ticketForm.cancellationReason || 'Cancelled by admin';
    }

    updateTicketMutation.mutate({
      id: selectedTicket._id,
      data: payload
    });
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        ticket.passengerName.toLowerCase().includes(searchTerm) ||
        ticket.passengerEmail.toLowerCase().includes(searchTerm) ||
        ticket.passengerPhone.toLowerCase().includes(searchTerm) ||
        ticket.seatNumber.toLowerCase().includes(searchTerm) ||
        getRouteName(ticket).toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  if (isLoadingTickets) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading tickets...</div>
      </div>
    );
  }

  return (
    <AdminLayout
      pageTitle="Ticket Management"
      pageSubtitle="View and manage all tickets"
    >
      <div className="space-y-6">

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets ({filteredTickets.length})</CardTitle>
          <CardDescription>
            Manage and monitor all ticket bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => {
                  const scheduleInfo = getScheduleInfo(ticket.schedule);
                  return (
                    <TableRow key={ticket._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ticket.passengerName}</div>
                          <div className="text-sm text-muted-foreground">{ticket.passengerEmail}</div>
                          <div className="text-sm text-muted-foreground">{ticket.passengerPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{scheduleInfo?.routeName || 'Loading...'}</div>
                          <div className="text-sm text-muted-foreground">
                            {scheduleInfo
                              ? `${format(new Date(scheduleInfo.departureTime), 'MMM dd, HH:mm')} - ${format(new Date(scheduleInfo.arrivalTime), 'MMM dd, HH:mm')}`
                              : 'Loading...'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                          <div className="font-medium">{scheduleInfo?.vehicleId || 'Loading...'}</div>
                        <Badge variant="outline">{ticket.seatNumber}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{ticket.price} ALL</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getPaymentStatusColor(ticket.paymentStatus)}>
                            {ticket.paymentStatus}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {ticket.paymentMethod}
                          </div>
                          {ticket.paymentReference && (
                            <div className="text-xs text-muted-foreground">
                              Ref: {ticket.paymentReference}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(ticket.purchaseDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(ticket.purchaseDate), 'HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTicketDialog(ticket, 'update')}
                          >
                            Update Status
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleDownloadTicket(ticket);
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refund Ticket</DialogTitle>
            <DialogDescription>
              Process a refund for the cancelled ticket
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTicket && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium">{selectedTicket.passengerName}</div>
                <div className="text-sm text-muted-foreground">
                  Seat: {selectedTicket.seatNumber} | Price: {selectedTicket.price} ALL
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="refundAmount">Refund Amount (ALL)</Label>
              <Input
                id="refundAmount"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="refundReason">Refund Reason</Label>
              <Input
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason for refund"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmRefund} disabled={refundTicketMutation.isPending}>
                {refundTicketMutation.isPending ? 'Processing...' : 'Process Refund'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Update Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {ticketDialogMode === 'payment' ? 'Confirm Payment' : 'Update Ticket Status'}
            </DialogTitle>
            <DialogDescription>
              {ticketDialogMode === 'payment'
                ? 'Add payment details and confirm the ticket.'
                : 'Update ticket status and related payment information.'}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="rounded-lg bg-gray-50 p-4 space-y-1">
              <div className="font-medium">{selectedTicket.passengerName}</div>
              <div className="text-sm text-muted-foreground">
                Seat: {selectedTicket.seatNumber} | Route: {getRouteName(selectedTicket) || 'Loading...'}
              </div>
            </div>
          )}

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={ticketForm.status}
                onValueChange={(value: Ticket['status']) => setTicketForm({ ...ticketForm, status: value })}
                disabled={ticketDialogMode === 'payment'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Payment Status</Label>
              <Select
                value={ticketForm.paymentStatus}
                onValueChange={(value: Ticket['paymentStatus']) => setTicketForm({ ...ticketForm, paymentStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <Select
                value={ticketForm.paymentMethod}
                onValueChange={(value: Ticket['paymentMethod']) => setTicketForm({ ...ticketForm, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentReference">Payment Reference</Label>
              <Input
                id="paymentReference"
                value={ticketForm.paymentReference}
                onChange={(e) => setTicketForm({ ...ticketForm, paymentReference: e.target.value })}
                placeholder="PAY-001-2024"
              />
            </div>

            {ticketForm.status === 'cancelled' && (
              <div className="grid gap-2">
                <Label htmlFor="cancellationReason">Cancellation Reason</Label>
                <Input
                  id="cancellationReason"
                  value={ticketForm.cancellationReason}
                  onChange={(e) => setTicketForm({ ...ticketForm, cancellationReason: e.target.value })}
                  placeholder="Reason for cancellation"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsTicketDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitTicketDialog} disabled={updateTicketMutation.isPending}>
              {updateTicketMutation.isPending
                ? 'Saving...'
                : ticketDialogMode === 'payment'
                  ? 'Confirm Payment'
                  : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
};


export default AdminTickets;
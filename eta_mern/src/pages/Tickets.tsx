
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TicketsAPI } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Search, Download, QrCode, Calendar, MapPin, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const Tickets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 6;

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: TicketsAPI.getAll,
  });

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const filteredTickets = tickets?.filter(ticket => {
    const matchesSearch = 
      ticket.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.passengerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.schedule.route.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil((filteredTickets?.length || 0) / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const paginatedTickets = filteredTickets?.slice(startIndex, startIndex + ticketsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDownloadTicket = (ticketId: string) => {
    console.log('Downloading ticket:', ticketId);
    // TODO: Implement PDF download
  };

  const handleShowQR = (ticketId: string) => {
    console.log('Showing QR code for ticket:', ticketId);
    // TODO: Implement QR code modal
  };

  return (
    <AdminLayout
      pageTitle="My Tickets"
      pageSubtitle="View and manage your booked tickets"
      actions={
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export All
        </Button>
      }
    >
      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets by route, passenger name or ticket ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tickets Grid */}
      {isLoading ? (
        <div className="text-center p-8">Loading tickets...</div>
      ) : paginatedTickets?.length === 0 ? (
        <div className="text-center p-8">No tickets found matching your search</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedTickets?.map(ticket => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg eta-primary-text">{ticket.schedule.route.name}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={cn("capitalize", getStatusColor(ticket.status))}
                  >
                    {ticket.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{ticket.schedule.route.code}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 eta-primary-text" />
                    <span>{formatDateTime(ticket.schedule.departureTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 eta-primary-text" />
                    <span>{ticket.schedule.route.stations[0]?.name} → {ticket.schedule.route.stations[ticket.schedule.route.stations.length - 1]?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 eta-primary-text" />
                    <span>Seat: {ticket.seatNumber}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-lg eta-primary-text">${ticket.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">{ticket.paymentMethod}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleShowQR(ticket.id)}
                    >
                      <QrCode className="h-4 w-4 mr-1" />
                      QR Code
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDownloadTicket(ticket.id)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <p>Passenger: {ticket.passengerName}</p>
                  <p>Ticket ID: {ticket.id}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(i + 1);
                  }}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </AdminLayout>
  );
};

export default Tickets;

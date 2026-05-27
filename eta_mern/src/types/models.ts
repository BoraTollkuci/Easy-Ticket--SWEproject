
export interface Station {
  _id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  _id: string;
  name: string;
  code: string;
  description: string;
  stations: Station[];
  distance: number; // km
  duration: number; // min
  fare: number; // base fare
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  _id: string;
  route: string | Route; // Can be ID or populated Route object
  departureTime: string; // ISO string
  arrivalTime: string; // ISO string
  status: 'scheduled' | 'delayed' | 'cancelled' | 'completed';
  vehicleId: string;
  availableSeats: number;
  totalSeats: number;
  assignedBusman?: string | {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  }; // Can be ID or populated Busman object
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  _id: string;
  schedule: string | Schedule; // Can be ID or populated Schedule object
  user: string; // User ID
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  seatNumber: string;
  price: number;
  status: 'reserved' | 'confirmed' | 'cancelled' | 'completed';
  purchaseDate: string; // ISO string
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentReference?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  checkedInAt?: string;
  checkedInBy?: string;
  qrCode?: string;
  qrCodeData?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRoutes: number;
  activeSchedules: number;
  availableTickets: number;
  todayBookings: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  popularRoutes: Array<{
    routeName: string;
    bookingCount: number;
  }>;
  recentTransactions: Array<{
    id: string;
    customerName: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending' | 'failed';
  }>;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
}

export interface RevenueByRoute {
  routeName: string;
  revenue: number;
}

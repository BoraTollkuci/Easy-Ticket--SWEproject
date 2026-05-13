const Ticket = require('../models/Ticket');
const Schedule = require('../models/Schedule');
const User = require('../models/User');

const ticketData = [
  {
    scheduleVehicleId: 'BUS-001',
    userEmail: 'john@gmail.com',
    passengerName: 'John Smith',
    passengerEmail: 'john@gmail.com',
    passengerPhone: '+355 69 234 5678',
    seatNumber: 'A12',
    price: 150,
    status: 'confirmed',
    purchaseDate: new Date('2024-01-14T10:23:00.000Z'),
    paymentMethod: 'credit_card',
    paymentStatus: 'completed',
    paymentReference: 'PAY-001-2024'
  },
  {
    scheduleVehicleId: 'BUS-001',
    userEmail: 'jane@gmail.com',
    passengerName: 'Jane Doe',
    passengerEmail: 'jane@gmail.com',
    passengerPhone: '+355 69 345 6789',
    seatNumber: 'B15',
    price: 150,
    status: 'confirmed',
    purchaseDate: new Date('2024-01-14T11:45:00.000Z'),
    paymentMethod: 'credit_card',
    paymentStatus: 'completed',
    paymentReference: 'PAY-002-2024'
  },
  {
    scheduleVehicleId: 'BUS-101',
    userEmail: 'michael@gmail.com',
    passengerName: 'Michael Johnson',
    passengerEmail: 'michael@gmail.com',
    passengerPhone: '+355 69 456 7890',
    seatNumber: 'C22',
    price: 350,
    status: 'confirmed',
    purchaseDate: new Date('2024-01-14T16:30:00.000Z'),
    paymentMethod: 'credit_card',
    paymentStatus: 'completed',
    paymentReference: 'PAY-003-2024'
  },
  {
    scheduleVehicleId: 'BUS-301',
    userEmail: 'emily@gmail.com',
    passengerName: 'Emily Brown',
    passengerEmail: 'emily@gmail.com',
    passengerPhone: '+355 69 567 8901',
    seatNumber: 'D8',
    price: 450,
    status: 'confirmed',
    purchaseDate: new Date('2024-01-14T12:15:00.000Z'),
    paymentMethod: 'credit_card',
    paymentStatus: 'completed',
    paymentReference: 'PAY-004-2024'
  },
  {
    scheduleVehicleId: 'BUS-001',
    userEmail: 'david@gmail.com',
    passengerName: 'David Wilson',
    passengerEmail: 'david@gmail.com',
    passengerPhone: '+355 69 678 9012',
    seatNumber: 'A15',
    price: 150,
    status: 'cancelled',
    purchaseDate: new Date('2024-01-13T09:00:00.000Z'),
    paymentMethod: 'credit_card',
    paymentStatus: 'refunded',
    paymentReference: 'PAY-005-2024',
    cancellationReason: 'Change of plans',
    cancelledAt: new Date('2024-01-13T14:30:00.000Z')
  },
  {
    scheduleVehicleId: 'BUS-201',
    userEmail: 'sarah@gmail.com',
    passengerName: 'Sarah Davis',
    passengerEmail: 'sarah@gmail.com',
    passengerPhone: '+355 69 789 0123',
    seatNumber: 'E5',
    price: 200,
    status: 'confirmed',
    purchaseDate: new Date('2024-01-14T08:20:00.000Z'),
    paymentMethod: 'debit_card',
    paymentStatus: 'completed',
    paymentReference: 'PAY-006-2024'
  },
  {
    scheduleVehicleId: 'BUS-401',
    userEmail: 'robert@gmail.com',
    passengerName: 'Robert Miller',
    passengerEmail: 'robert@gmail.com',
    passengerPhone: '+355 69 890 1234',
    seatNumber: 'F12',
    price: 600,
    status: 'confirmed',
    purchaseDate: new Date('2024-01-14T14:45:00.000Z'),
    paymentMethod: 'bank_transfer',
    paymentStatus: 'completed',
    paymentReference: 'PAY-007-2024'
  },
  {
    scheduleVehicleId: 'BUS-002',
    userEmail: 'john@gmail.com',
    passengerName: 'John Smith',
    passengerEmail: 'john@gmail.com',
    passengerPhone: '+355 69 234 5678',
    seatNumber: 'A8',
    price: 150,
    status: 'reserved',
    purchaseDate: new Date('2024-01-14T15:30:00.000Z'),
    paymentMethod: 'credit_card',
    paymentStatus: 'pending',
    paymentReference: 'PAY-008-2024'
  },
  {
    scheduleVehicleId: 'BUS-102',
    userEmail: 'jane@gmail.com',
    passengerName: 'Jane Doe',
    passengerEmail: 'jane@gmail.com',
    passengerPhone: '+355 69 345 6789',
    seatNumber: 'B20',
    price: 350,
    status: 'confirmed',
    purchaseDate: new Date('2024-01-14T13:15:00.000Z'),
    paymentMethod: 'paypal',
    paymentStatus: 'completed',
    paymentReference: 'PAY-009-2024'
  },
  {
    scheduleVehicleId: 'BUS-601',
    userEmail: 'michael@gmail.com',
    passengerName: 'Michael Johnson',
    passengerEmail: 'michael@gmail.com',
    passengerPhone: '+355 69 456 7890',
    seatNumber: 'C7',
    price: 320,
    status: 'confirmed',
    purchaseDate: new Date('2024-01-14T11:30:00.000Z'),
    paymentMethod: 'credit_card',
    paymentStatus: 'completed',
    paymentReference: 'PAY-010-2024'
  }
];

const seedTickets = async () => {
  try {
    // Clear existing tickets
    await Ticket.deleteMany({});
    console.log('Cleared existing tickets');

    // Get all schedules and users for ticket assignment
    const schedules = await Schedule.find({});
    const users = await User.find({});
    
    const scheduleMap = {};
    const userMap = {};
    
    schedules.forEach(schedule => {
      scheduleMap[schedule.vehicleId] = schedule._id;
    });
    
    users.forEach(user => {
      userMap[user.email] = user._id;
    });

    // Assign schedules and users to tickets
    const ticketsWithReferences = ticketData.map(ticket => {
      const scheduleId = scheduleMap[ticket.scheduleVehicleId];
      const userId = userMap[ticket.userEmail];
      
      if (!scheduleId) {
        throw new Error(`Schedule with vehicle ID ${ticket.scheduleVehicleId} not found`);
      }
      
      if (!userId) {
        throw new Error(`User with email ${ticket.userEmail} not found`);
      }

      return {
        schedule: scheduleId,
        user: userId,
        passengerName: ticket.passengerName,
        passengerEmail: ticket.passengerEmail,
        passengerPhone: ticket.passengerPhone,
        seatNumber: ticket.seatNumber,
        price: ticket.price,
        status: ticket.status,
        purchaseDate: ticket.purchaseDate,
        paymentMethod: ticket.paymentMethod,
        paymentStatus: ticket.paymentStatus,
        paymentReference: ticket.paymentReference,
        cancellationReason: ticket.cancellationReason,
        cancelledAt: ticket.cancelledAt
      };
    });

    // Create tickets
    const tickets = await Ticket.insertMany(ticketsWithReferences);
    console.log(`Created ${tickets.length} tickets`);

    return tickets;
  } catch (error) {
    console.error('Error seeding tickets:', error);
    throw error;
  }
};

module.exports = { seedTickets, ticketData };


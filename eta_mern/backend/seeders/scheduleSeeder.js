const Schedule = require('../models/Schedule');
const Route = require('../models/Route');

const scheduleData = [
  // Tirana-Durrës Express schedules
  {
    routeCode: 'TIR-DUR-EXP',
    departureTime: new Date('2025-11-15T06:00:00.000Z'),
    arrivalTime: new Date('2025-11-15T06:45:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-001',
    totalSeats: 50,
    availableSeats: 35
  },
  {
    routeCode: 'TIR-DUR-EXP',
    departureTime: new Date('2025-11-15T08:00:00.000Z'),
    arrivalTime: new Date('2025-11-15T08:45:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-002',
    totalSeats: 50,
    availableSeats: 42
  },
  {
    routeCode: 'TIR-DUR-EXP',
    departureTime: new Date('2025-11-15T10:00:00.000Z'),
    arrivalTime: new Date('2025-11-15T10:45:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-003',
    totalSeats: 50,
    availableSeats: 28
  },
  {
    routeCode: 'TIR-DUR-EXP',
    departureTime: new Date('2025-11-15T14:00:00.000Z'),
    arrivalTime: new Date('2025-11-15T14:45:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-004',
    totalSeats: 50,
    availableSeats: 50
  },
  {
    routeCode: 'TIR-DUR-EXP',
    departureTime: new Date('2025-11-15T16:00:00.000Z'),
    arrivalTime: new Date('2025-11-15T16:45:00.000Z'),
    status: 'delayed',
    vehicleId: 'BUS-005',
    totalSeats: 50,
    availableSeats: 15
  },

  // Tirana-Shkodra Regional schedules
  {
    routeCode: 'TIR-SHK-REG',
    departureTime: new Date('2025-11-15T07:00:00.000Z'),
    arrivalTime: new Date('2025-11-15T09:00:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-101',
    totalSeats: 45,
    availableSeats: 30
  },
  {
    routeCode: 'TIR-SHK-REG',
    departureTime: new Date('2025-11-15T13:00:00.000Z'),
    arrivalTime: new Date('2025-11-15T15:00:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-102',
    totalSeats: 45,
    availableSeats: 38
  },
  {
    routeCode: 'TIR-SHK-REG',
    departureTime: new Date('2025-11-15T17:00:00.000Z'),
    arrivalTime: new Date('2025-11-15T19:00:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-103',
    totalSeats: 45,
    availableSeats: 12
  },

  // Tirana-Elbasan Local schedules
  {
    routeCode: 'TIR-ELB-LOC',
    departureTime: new Date('2025-11-15T06:30:00.000Z'),
    arrivalTime: new Date('2025-11-15T07:45:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-201',
    totalSeats: 40,
    availableSeats: 25
  },
  {
    routeCode: 'TIR-ELB-LOC',
    departureTime: new Date('2025-11-15T09:30:00.000Z'),
    arrivalTime: new Date('2025-11-15T10:45:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-202',
    totalSeats: 40,
    availableSeats: 40
  },
  {
    routeCode: 'TIR-ELB-LOC',
    departureTime: new Date('2025-11-15T15:30:00.000Z'),
    arrivalTime: new Date('2025-11-15T16:45:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-203',
    totalSeats: 40,
    availableSeats: 18
  },

  // Tirana-Vlorë Coastal schedules
  {
    routeCode: 'TIR-VLO-COA',
    departureTime: new Date('2025-11-15T08:30:00.000Z'),
    arrivalTime: new Date('2025-11-15T11:00:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-301',
    totalSeats: 55,
    availableSeats: 33
  },
  {
    routeCode: 'TIR-VLO-COA',
    departureTime: new Date('2025-11-15T14:30:00.000Z'),
    arrivalTime: new Date('2025-11-15T17:00:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-302',
    totalSeats: 55,
    availableSeats: 55
  },

  // Tirana-Korçë Mountain schedules
  {
    routeCode: 'TIR-KOR-MNT',
    departureTime: new Date('2025-11-15T06:00:00.000Z'),
    arrivalTime: new Date('2025-11-15T09:30:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-401',
    totalSeats: 50,
    availableSeats: 22
  },
  {
    routeCode: 'TIR-KOR-MNT',
    departureTime: new Date('2025-11-15T16:00:00.000Z'),
    arrivalTime: new Date('2025-11-15T19:30:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-402',
    totalSeats: 50,
    availableSeats: 41
  },

  // Durrës-Fier Industrial schedules
  {
    routeCode: 'DUR-FIE-IND',
    departureTime: new Date('2025-11-15T07:15:00.000Z'),
    arrivalTime: new Date('2025-11-15T08:45:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-501',
    totalSeats: 45,
    availableSeats: 28
  },
  {
    routeCode: 'DUR-FIE-IND',
    departureTime: new Date('2025-11-15T13:15:00.000Z'),
    arrivalTime: new Date('2025-11-15T14:45:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-502',
    totalSeats: 45,
    availableSeats: 45
  },

  // Vlorë-Gjirokastër Heritage schedules
  {
    routeCode: 'VLO-GJI-HER',
    departureTime: new Date('2025-11-15T09:00:00.000Z'),
    arrivalTime: new Date('2025-11-15T11:00:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-601',
    totalSeats: 40,
    availableSeats: 15
  },
  {
    routeCode: 'VLO-GJI-HER',
    departureTime: new Date('2025-11-15T15:00:00.000Z'),
    arrivalTime: new Date('2025-11-15T17:00:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-602',
    totalSeats: 40,
    availableSeats: 32
  },

  // Berat-Korçë Cultural schedules
  {
    routeCode: 'BER-KOR-CUL',
    departureTime: new Date('2025-11-15T10:30:00.000Z'),
    arrivalTime: new Date('2025-11-15T13:00:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-701',
    totalSeats: 45,
    availableSeats: 19
  },
  {
    routeCode: 'BER-KOR-CUL',
    departureTime: new Date('2025-11-15T16:30:00.000Z'),
    arrivalTime: new Date('2025-11-15T19:00:00.000Z'),
    status: 'scheduled',
    vehicleId: 'BUS-702',
    totalSeats: 45,
    availableSeats: 45
  }
];

const seedSchedules = async () => {
  try {
    // Clear existing schedules
    await Schedule.deleteMany({});
    console.log('Cleared existing schedules');

    // Get all routes for schedule assignment
    const routes = await Route.find({});
    const routeMap = {};
    routes.forEach(route => {
      routeMap[route.code] = route._id;
    });

    // Assign routes to schedules
    const schedulesWithRoutes = scheduleData.map(schedule => {
      const routeId = routeMap[schedule.routeCode];
      if (!routeId) {
        throw new Error(`Route with code ${schedule.routeCode} not found`);
      }

      return {
        route: routeId,
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
        status: schedule.status,
        vehicleId: schedule.vehicleId,
        totalSeats: schedule.totalSeats,
        availableSeats: schedule.availableSeats,
        isActive: true
      };
    });

    // Create schedules
    const schedules = await Schedule.insertMany(schedulesWithRoutes);
    console.log(`Created ${schedules.length} schedules`);

    return schedules;
  } catch (error) {
    console.error('Error seeding schedules:', error);
    throw error;
  }
};

module.exports = { seedSchedules, scheduleData };


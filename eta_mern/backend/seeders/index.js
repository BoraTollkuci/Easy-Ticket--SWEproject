const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/database');
const { seedUsers } = require('./userSeeder');
const { seedStations } = require('./stationSeeder');
const { seedRoutes } = require('./routeSeeder');
const { seedSchedules } = require('./scheduleSeeder');
const { seedTickets } = require('./ticketSeeder');

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    console.log('\nStarting database seeding...\n');

    // 1. Seed users first no dependencies
    console.log('1️.Seeding users...');
    await seedUsers();

    // 2. Seed stations no dependencies
    console.log('2️.Seeding stations...');
    await seedStations();

    // 3. Seed routes depends on stations
    console.log('3️.Seeding routes...');
    await seedRoutes();

    // 4. Seed schedules depends on routes
    console.log('4️.Seeding schedules...');
    await seedSchedules();

    // 5. Seed tickets depends on schedules and users
    console.log('5️.Seeding tickets...');
    await seedTickets();

    console.log('\nDatabase seeding completed successfully!');
    console.log('\nSummary:');
    console.log('- Users: 8 (1 admin, 7 regular users)');
    console.log('- Stations: 10 (major Albanian cities)');
    console.log('- Routes: 8 (connecting various cities)');
    console.log('- Schedules: 25 (multiple daily services)');
    console.log('- Tickets: 10 (sample bookings)');
    console.log('\nYou can now start the server and use the application!');

  } catch (error) {
    console.error('\nDatabase seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run the seeder
seedDatabase();


const User = require('../models/User');
const bcrypt = require('bcryptjs');

User.deleteMany({}); 

const userData = [
  {
    fullName: 'Admin User',
    email: 'admin@gmail.com',
    phone: '+355 69 123 4567',
    password: 'password',
    role: 'admin',
    isActive: true
  },
  {
    fullName: 'John Smith',
    email: 'john@gmail.com',
    phone: '+355 69 234 5678',
    password: 'password',
    role: 'user',
    isActive: true
  },
  {
    fullName: 'Jane Doe',
    email: 'jane@gmail.com',
    phone: '+355 69 345 6789',
    password: 'password',
    role: 'user',
    isActive: true
  },
  {
    fullName: 'Michael Johnson',
    email: 'michael@gmail.com',
    phone: '+355 69 456 7890',
    password: 'password123',
    role: 'user',
    isActive: true
  },
  {
    fullName: 'Emily Brown',
    email: 'emily@gmail.com',
    phone: '+355 69 567 8901',
    password: 'password123',
    role: 'user',
    isActive: true
  },
  {
    fullName: 'David Wilson',
    email: 'david@gmail.com',
    phone: '+355 69 678 9012',
    password: 'password',
    role: 'user',
    isActive: true
  },
  {
    fullName: 'Sarah Davis',
    email: 'sarah@gmail.com',
    phone: '+355 69 789 0123',
    password: 'password',
    role: 'user',
    isActive: true
  },
  {
    fullName: 'Robert Miller',
    email: 'robert@gmail.com',
    phone: '+355 69 890 1234',
    password: 'password',
    role: 'user',
    isActive: true
  }
];

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash passwords before insert
    const saltRounds = 10;
    const hashedUserData = await Promise.all(
      userData.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        return { ...user, password: hashedPassword };
      })
    );

    // Insert users
    const users = await User.insertMany(hashedUserData);
    console.log(`Created ${users.length} users`);

    return users;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

module.exports = { seedUsers, userData };

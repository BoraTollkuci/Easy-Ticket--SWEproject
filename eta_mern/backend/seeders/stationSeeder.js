const Station = require('../models/Station');

const stationData = [
  {
    name: 'Tirana Central Station',
    code: 'TIR',
    city: 'Tirana',
    state: 'Tirana',
    address: 'Rruga Durrësit, Tirana, Albania',
    location: {
      latitude: 41.3275,
      longitude: 19.8187
    },
    isActive: true
  },
  {
    name: 'Durrës Station',
    code: 'DUR',
    city: 'Durrës',
    state: 'Durrës',
    address: 'Rruga Taulantia, Durrës, Albania',
    location: {
      latitude: 41.3236,
      longitude: 19.4548
    },
    isActive: true
  },
  {
    name: 'Shkodra Station',
    code: 'SHK',
    city: 'Shkodra',
    state: 'Shkodra',
    address: 'Rruga Marin Barleti, Shkodra, Albania',
    location: {
      latitude: 42.0682,
      longitude: 19.5126
    },
    isActive: true
  },
  {
    name: 'Elbasan Station',
    code: 'ELB',
    city: 'Elbasan',
    state: 'Elbasan',
    address: 'Rruga Rrogozhina, Elbasan, Albania',
    location: {
      latitude: 41.1127,
      longitude: 20.0822
    },
    isActive: true
  },
  {
    name: 'Vlorë Station',
    code: 'VLO',
    city: 'Vlorë',
    state: 'Vlorë',
    address: 'Rruga Ismail Qemali, Vlorë, Albania',
    location: {
      latitude: 40.4686,
      longitude: 19.4914
    },
    isActive: true
  },
  {
    name: 'Korçë Station',
    code: 'KOR',
    city: 'Korçë',
    state: 'Korçë',
    address: 'Rruga Fan Noli, Korçë, Albania',
    location: {
      latitude: 40.6148,
      longitude: 20.7778
    },
    isActive: true
  },
  {
    name: 'Gjirokastër Station',
    code: 'GJI',
    city: 'Gjirokastër',
    state: 'Gjirokastër',
    address: 'Rruga Ismail Kadare, Gjirokastër, Albania',
    location: {
      latitude: 40.0755,
      longitude: 20.1389
    },
    isActive: true
  },
  {
    name: 'Berat Station',
    code: 'BER',
    city: 'Berat',
    state: 'Berat',
    address: 'Rruga Antipatrea, Berat, Albania',
    location: {
      latitude: 40.7048,
      longitude: 19.9497
    },
    isActive: true
  },
  {
    name: 'Fier Station',
    code: 'FIE',
    city: 'Fier',
    state: 'Fier',
    address: 'Rruga Gjergj Kastrioti, Fier, Albania',
    location: {
      latitude: 40.7275,
      longitude: 19.5621
    },
    isActive: true
  },
  {
    name: 'Lushnjë Station',
    code: 'LUS',
    city: 'Lushnjë',
    state: 'Fier',
    address: 'Rruga 28 Nëntori, Lushnjë, Albania',
    location: {
      latitude: 40.9419,
      longitude: 19.7050
    },
    isActive: true
  }
];

const seedStations = async () => {
  try {
    // Clear existing stations
    await Station.deleteMany({});
    console.log('Cleared existing stations');

    // Create stations
    const stations = await Station.insertMany(stationData);
    console.log(`Created ${stations.length} stations`);

    return stations;
  } catch (error) {
    console.error('Error seeding stations:', error);
    throw error;
  }
};

module.exports = { seedStations, stationData };


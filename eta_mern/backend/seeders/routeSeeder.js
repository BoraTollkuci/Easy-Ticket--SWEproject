const Route = require('../models/Route');
const Station = require('../models/Station');

const routeData = [
  {
    name: 'Tirana-Durrës Express',
    code: 'TIR-DUR-EXP',
    description: 'Express service between Tirana and Durrës',
    distance: 38,
    duration: 45, 
    fare: 150, 
    isActive: true
  },
  {
    name: 'Tirana-Shkodra Regional',
    code: 'TIR-SHK-REG',
    description: 'Regional service from Tirana to Shkodra',
    distance: 105,
    duration: 120, 
    fare: 350,
    isActive: true
  },
  {
    name: 'Tirana-Elbasan Local',
    code: 'TIR-ELB-LOC',
    description: 'Local service between Tirana and Elbasan',
    distance: 54,
    duration: 75, 
    fare: 200,
    isActive: true
  },
  {
    name: 'Tirana-Vlorë Coastal',
    code: 'TIR-VLO-COA',
    description: 'Coastal route from Tirana to Vlorë',
    distance: 135,
    duration: 150,
    fare: 450,
    isActive: true
  },
  {
    name: 'Tirana-Korçë Mountain',
    code: 'TIR-KOR-MNT',
    description: 'Mountain route from Tirana to Korçë',
    distance: 178,
    duration: 210,
    fare: 600,
    isActive: true
  },
  {
    name: 'Durrës-Fier Industrial',
    code: 'DUR-FIE-IND',
    description: 'Industrial corridor service',
    distance: 85,
    duration: 90, 
    fare: 280,
    isActive: true
  },
  {
    name: 'Vlorë-Gjirokastër Heritage',
    code: 'VLO-GJI-HER',
    description: 'Heritage route connecting UNESCO cities',
    distance: 95,
    duration: 120, 
    fare: 320,
    isActive: true
  },
  {
    name: 'Berat-Korçë Cultural',
    code: 'BER-KOR-CUL',
    description: 'Cultural route between historic cities',
    distance: 125,
    duration: 150, 
    fare: 400,
    isActive: true
  }
];

const seedRoutes = async () => {
  try {
    // Clear existing routes
    await Route.deleteMany({});
    console.log('Cleared existing routes');

    // Get all stations for route assignment
    const stations = await Station.find({});
    const stationMap = {};
    stations.forEach(station => {
      stationMap[station.code] = station._id;
    });

    // Assign stations to routes
    const routesWithStations = routeData.map(route => {
      let stations = [];
      
      switch (route.code) {
        case 'TIR-DUR-EXP':
          stations = [stationMap['TIR'], stationMap['DUR']];
          break;
        case 'TIR-SHK-REG':
          stations = [stationMap['TIR'], stationMap['SHK']];
          break;
        case 'TIR-ELB-LOC':
          stations = [stationMap['TIR'], stationMap['ELB']];
          break;
        case 'TIR-VLO-COA':
          stations = [stationMap['TIR'], stationMap['VLO']];
          break;
        case 'TIR-KOR-MNT':
          stations = [stationMap['TIR'], stationMap['KOR']];
          break;
        case 'DUR-FIE-IND':
          stations = [stationMap['DUR'], stationMap['FIE']];
          break;
        case 'VLO-GJI-HER':
          stations = [stationMap['VLO'], stationMap['GJI']];
          break;
        case 'BER-KOR-CUL':
          stations = [stationMap['BER'], stationMap['KOR']];
          break;
        default:
          stations = [stationMap['TIR'], stationMap['DUR']];
      }

      return {
        ...route,
        stations
      };
    });

    // Create routes
    const routes = await Route.insertMany(routesWithStations);
    console.log(`Created ${routes.length} routes`);

    return routes;
  } catch (error) {
    console.error('Error seeding routes:', error);
    throw error;
  }
};

module.exports = { seedRoutes, routeData };


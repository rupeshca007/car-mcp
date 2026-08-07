import express from 'express';

const app = express();
const PORT = process.env.MOCK_PORT || 3009;

app.use(express.json());

// Helper function to introduce latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// MG Website / API mock data
const mgCars = [
  { "car": "MG Astor", "hp": 110, "price": 1050000 },
  { "car": "MG Astor Turbo", "hp": 140, "price": 1400000 },
  { "car": "MG Astor Sport (Mock)", "hp": 200, "price": 1950000 },
  { "car": "MG Hector", "hp": 143, "price": 1500000 },
  { "car": "MG Hector Plus", "hp": 170, "price": 1800000 },
  { "car": "MG ZS EV", "hp": 176, "price": 2200000 },
  { "car": "MG Gloster", "hp": 215, "price": 3800000 }
];

// Hyundai API mock data
const hyundaiCars = [
  { "model": "Hyundai Grand i10 Nios", "horsePower": 83, "cost": 600000 },
  { "model": "Hyundai i20 N Line", "horsePower": 120, "cost": 1000000 },
  { "model": "Hyundai Creta", "horsePower": 115, "cost": 1100000 },
  { "model": "Hyundai Creta Turbo", "horsePower": 160, "cost": 1700000 },
  { "model": "Hyundai Verna Turbo", "horsePower": 160, "cost": 1750000 },
  { "model": "Hyundai Verna N-Line (Mock)", "horsePower": 205, "cost": 1850000 },
  { "model": "Hyundai Tucson", "horsePower": 186, "cost": 2900000 },
  { "model": "Hyundai Ioniq 5", "horsePower": 228, "cost": 4600000 }
];

// Suzuki API mock data
const suzukiCars = [
  { "vehicle": "Suzuki Alto K10", "enginePower": 67, "amount": 400000 },
  { "vehicle": "Suzuki Swift", "enginePower": 82, "amount": 650000 },
  { "vehicle": "Suzuki Baleno", "enginePower": 90, "amount": 830000 },
  { "vehicle": "Suzuki Brezza", "enginePower": 103, "amount": 850000 },
  { "vehicle": "Suzuki Fronx Turbo", "enginePower": 100, "amount": 1000000 },
  { "vehicle": "Suzuki Grand Vitara", "enginePower": 103, "amount": 1100000 },
  { "vehicle": "Suzuki Grand Vitara Sport (Mock)", "enginePower": 195, "amount": 1900000 },
  { "vehicle": "Suzuki Grand Vitara Hybrid", "enginePower": 116, "amount": 1850000 },
  { "vehicle": "Suzuki Jimny", "enginePower": 105, "amount": 1270000 }
];

app.get('/api/mg', async (req, res) => {
  const latency = Math.floor(Math.random() * 100) + 100; // 100-200ms delay
  console.log(`[MG API] GET /api/mg - Simulating ${latency}ms latency`);
  await delay(latency);
  res.json(mgCars);
});

app.get('/api/hyundai', async (req, res) => {
  const latency = Math.floor(Math.random() * 100) + 100; // 100-200ms delay
  console.log(`[Hyundai API] GET /api/hyundai - Simulating ${latency}ms latency`);
  await delay(latency);
  res.json(hyundaiCars);
});

app.get('/api/suzuki', async (req, res) => {
  const latency = Math.floor(Math.random() * 100) + 100; // 100-200ms delay
  console.log(`[Suzuki API] GET /api/suzuki - Simulating ${latency}ms latency`);
  await delay(latency);
  res.json(suzukiCars);
});

app.listen(PORT, () => {
  console.log(`Mock Car Manufacturer APIs listening at http://localhost:${PORT}`);
});

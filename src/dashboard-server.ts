import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
app.use(express.static(path.join(rootDir, 'public')));

// Helper function to invoke MCP server stdio tools
function invokeMcpTool(toolName: string, toolArgs: Record<string, any>): Promise<any> {
  return new Promise((resolve, reject) => {
    const mcpProcessPath = path.join(__dirname, 'index.js');
    const mcpProcess = spawn('node', [mcpProcessPath]);

    let stdoutData = '';
    let stderrData = '';

    mcpProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    mcpProcess.on('error', (err) => {
      reject(err);
    });

    mcpProcess.on('close', (code) => {
      try {
        if (!stdoutData.trim()) {
          return reject(new Error(`Empty output from MCP server. Stderr: ${stderrData}`));
        }

        const jsonRpcResponse = JSON.parse(stdoutData);
        if (jsonRpcResponse.error) {
          return reject(new Error(jsonRpcResponse.error.message));
        }

        const toolTextResult = jsonRpcResponse.result?.content?.[0]?.text;
        if (!toolTextResult) {
          return reject(new Error('Invalid response payload structure from MCP tool call'));
        }

        const parsedData = JSON.parse(toolTextResult);
        resolve(parsedData);
      } catch (err) {
        reject(err);
      }
    });

    const jsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: toolArgs
      },
      id: Date.now()
    };

    mcpProcess.stdin.write(JSON.stringify(jsonRpcRequest) + '\n');
    mcpProcess.stdin.end();
  });
}

// 1. Endpoint for compare_cars
app.get('/api/compare', async (req, res) => {
  const { horsepower, budget, sortBy, sortOrder } = req.query;

  const toolArgs: Record<string, any> = {};
  if (horsepower && horsepower !== '') toolArgs.horsepower = Number(horsepower);
  if (budget && budget !== '') toolArgs.budget = Number(budget);
  if (sortBy && sortBy !== '') toolArgs.sortBy = String(sortBy);
  if (sortOrder && sortOrder !== '') toolArgs.sortOrder = String(sortOrder);

  try {
    const data = await invokeMcpTool('compare_cars', toolArgs);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Endpoint for compare_spec_sheet
app.get('/api/compare-specs', async (req, res) => {
  const { models } = req.query;
  let modelList: string[] = [];

  if (typeof models === 'string') {
    modelList = models.split(',').map(m => m.trim()).filter(Boolean);
  } else if (Array.isArray(models)) {
    modelList = models.map(m => String(m).trim()).filter(Boolean);
  }

  try {
    const data = await invokeMcpTool('compare_spec_sheet', { models: modelList });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Endpoint for calculate_tco
app.get('/api/tco', async (req, res) => {
  const { carPrice, downPaymentPercent, annualKm, loanTenureYears, interestRate, fuelType } = req.query;

  const toolArgs: Record<string, any> = {
    carPrice: Number(carPrice || 1500000)
  };
  if (downPaymentPercent) toolArgs.downPaymentPercent = Number(downPaymentPercent);
  if (annualKm) toolArgs.annualKm = Number(annualKm);
  if (loanTenureYears) toolArgs.loanTenureYears = Number(loanTenureYears);
  if (interestRate) toolArgs.interestRate = Number(interestRate);
  if (fuelType) toolArgs.fuelType = String(fuelType);

  try {
    const data = await invokeMcpTool('calculate_tco', toolArgs);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Endpoint for calculate_ev_savings
app.get('/api/ev-savings', async (req, res) => {
  const { dailyKm, evPrice, petrolPrice, electricityRatePerKwh, petrolPricePerLiter, ownershipYears } = req.query;

  const toolArgs: Record<string, any> = {
    dailyKm: Number(dailyKm || 50),
    evPrice: Number(evPrice || 1500000),
    petrolPrice: Number(petrolPrice || 1350000)
  };
  if (electricityRatePerKwh) toolArgs.electricityRatePerKwh = Number(electricityRatePerKwh);
  if (petrolPricePerLiter) toolArgs.petrolPricePerLiter = Number(petrolPricePerLiter);
  if (ownershipYears) toolArgs.ownershipYears = Number(ownershipYears);

  try {
    const data = await invokeMcpTool('calculate_ev_savings', toolArgs);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Endpoint for book_test_drive
app.post('/api/book-test-drive', async (req, res) => {
  const { carModel, customerName, customerPhone, pincode, preferredDate, timeSlot } = req.body;

  try {
    const data = await invokeMcpTool('book_test_drive', {
      carModel,
      customerName,
      customerPhone,
      pincode,
      preferredDate,
      timeSlot
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Endpoint for calculate_match_score
app.get('/api/match-score', async (req, res) => {
  const { useCase, familySize, annualKm, maxBudget } = req.query;

  try {
    const data = await invokeMcpTool('calculate_match_score', {
      useCase: String(useCase || 'City Commuting'),
      familySize: Number(familySize || 4),
      annualKm: Number(annualKm || 12000),
      maxBudget: Number(maxBudget || 2000000)
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Endpoint for get_on_road_price
app.get('/api/on-road-price', async (req, res) => {
  const { carPrice, city, fuelType } = req.query;

  try {
    const data = await invokeMcpTool('get_on_road_price', {
      carPrice: Number(carPrice || 1500000),
      city: String(city || 'Bangalore'),
      fuelType: String(fuelType || 'Petrol')
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Endpoint for check_dealer_inventory
app.get('/api/dealer-inventory', async (req, res) => {
  const { carModel, pincode } = req.query;

  try {
    const data = await invokeMcpTool('check_dealer_inventory', {
      carModel: String(carModel || 'Hyundai Creta'),
      pincode: String(pincode || '560001')
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Endpoint for estimate_trade_in_value
app.get('/api/trade-in-value', async (req, res) => {
  const { currentCarModel, purchaseYear, odometerKm, condition } = req.query;

  try {
    const data = await invokeMcpTool('estimate_trade_in_value', {
      currentCarModel: String(currentCarModel || '2019 Maruti Swift'),
      purchaseYear: Number(purchaseYear || 2019),
      odometerKm: Number(odometerKm || 55000),
      condition: String(condition || 'Good')
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Endpoint for evaluate_safety_rating
app.get('/api/safety-rating', async (req, res) => {
  const { carModel } = req.query;

  try {
    const data = await invokeMcpTool('evaluate_safety_rating', {
      carModel: String(carModel || 'Tata Nexon')
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Endpoint for export_buying_dossier
app.get('/api/export-dossier', async (req, res) => {
  const { carModel, customerName, city, downPaymentPercent, loanTenureYears } = req.query;

  try {
    const data = await invokeMcpTool('export_buying_dossier', {
      carModel: String(carModel || 'Hyundai Creta'),
      customerName: String(customerName || 'Valued Buyer'),
      city: String(city || 'Bangalore'),
      downPaymentPercent: Number(downPaymentPercent || 20),
      loanTenureYears: Number(loanTenureYears || 5)
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Endpoint for manage_wishlist
app.get('/api/wishlist', async (req, res) => {
  try {
    const data = await invokeMcpTool('manage_wishlist', { action: 'list' });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wishlist', async (req, res) => {
  const { action, carModel } = req.body;
  try {
    const data = await invokeMcpTool('manage_wishlist', { action: action || 'add', carModel });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Embedded AI Chat Endpoint for Web Dashboard Drawer
app.post('/api/ai-chat', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Valid prompt string is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  try {
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });

      const compare_cars_tool = {
        name: "compare_cars",
        description: "Compare and filter cars across 10 major brands by horsepower and maximum budget.",
        parameters: {
          type: "OBJECT",
          properties: {
            horsepower: { type: "INTEGER", description: "Target horsepower (e.g. 180)." },
            budget: { type: "INTEGER", description: "Maximum budget in INR (e.g. 2000000)." }
          }
        }
      };

      const system_instruction = "You are an expert car buying advisor. Provide clear, concise, bulleted Markdown advice with actionable car recommendations.";

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: system_instruction,
          tools: [{ functionDeclarations: [compare_cars_tool as any] }],
          temperature: 0.3
        }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        const toolName = call.name || 'compare_cars';
        const args = (call.args || {}) as Record<string, any>;
        const mcpResult = await invokeMcpTool(toolName, args);

        const summaryResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `User Query: ${prompt}\n\nTool '${toolName}' executed result:\n${JSON.stringify(mcpResult, null, 2)}\n\nSynthesize this into a helpful, direct automotive recommendation response for the user.`,
          config: { systemInstruction: system_instruction }
        });

        return res.json({ reply: summaryResponse.text, toolCalled: toolName });
      }

      return res.json({ reply: response.text });
    }

    const carsRes = await invokeMcpTool('compare_cars', { budget: 2000000 });
    const topCar = carsRes.cars?.[0] || { company: 'Hyundai', model: 'Creta', formattedPrice: '₹14.5 Lakh', horsepower: 115 };
    return res.json({
      reply: `### 🌟 Recommended Vehicle Recommendation\n\nBased on your query, the **${topCar.company} ${topCar.model}** is an outstanding match!\n\n- **Showroom Price**: ${topCar.formattedPrice}\n- **Horsepower**: ${topCar.horsepower} HP\n- **Mileage**: ${topCar.mileage || '17 km/l'}\n- **Fuel Type**: ${topCar.fuelType || 'Petrol'}\n\n*Tip: Use the side-by-side comparison drawer to compare up to 3 cars live on your dashboard!*`,
      toolCalled: 'compare_cars'
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process AI query' });
  }
});

app.listen(PORT, () => {
  console.log(`Car Aggregator Dashboard client listening at http://localhost:${PORT}`);
});

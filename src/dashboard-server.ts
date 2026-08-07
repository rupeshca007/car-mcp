import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.listen(PORT, () => {
  console.log(`Car Aggregator Dashboard client listening at http://localhost:${PORT}`);
});

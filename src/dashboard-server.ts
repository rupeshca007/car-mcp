import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files from 'public' directory
// Since this file runs from 'dist/dashboard-server.js', 'public' is located two levels up in development (or one level up depending on output)
// Let's resolve the root path cleanly
const rootDir = path.resolve(__dirname, '..');
app.use(express.static(path.join(rootDir, 'public')));

app.get('/api/compare', (req, res) => {
  const { horsepower, budget, sortBy, sortOrder } = req.query;

  console.log(`[Dashboard Backend] GET /api/compare: hp=${horsepower}, budget=${budget}, sortBy=${sortBy}, sortOrder=${sortOrder}`);

  // Build the JSON-RPC arguments object
  const toolArgs: Record<string, any> = {};
  if (horsepower && horsepower !== '') {
    toolArgs.horsepower = Number(horsepower);
  }
  if (budget && budget !== '') {
    toolArgs.budget = Number(budget);
  }
  if (sortBy && sortBy !== '') {
    toolArgs.sortBy = String(sortBy);
  }
  if (sortOrder && sortOrder !== '') {
    toolArgs.sortOrder = String(sortOrder);
  }

  const jsonRpcRequest = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'compare_cars',
      arguments: toolArgs
    },
    id: Date.now()
  };

  // Spawn the MCP server process (dist/index.js)
  const mcpProcessPath = path.join(__dirname, 'index.js');
  console.log(`[Dashboard Backend] Spawning MCP server at: ${mcpProcessPath}`);
  
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
    console.error('[Dashboard Backend] Failed to start MCP process:', err);
    res.status(500).json({ error: 'Failed to start MCP backend process' });
  });

  mcpProcess.on('close', (code) => {
    console.log(`[Dashboard Backend] MCP process exited with code ${code}`);
    try {
      if (stdoutData.trim() === '') {
        console.error('[Dashboard Backend] Empty stdout. Stderr was:', stderrData);
        return res.status(500).json({ error: 'Empty output from MCP server', details: stderrData });
      }

      // Parse the outer JSON-RPC wrapper
      const jsonRpcResponse = JSON.parse(stdoutData);

      if (jsonRpcResponse.error) {
        console.error('[Dashboard Backend] JSON-RPC Error:', jsonRpcResponse.error);
        return res.status(500).json({ error: jsonRpcResponse.error.message });
      }

      // Extract content -> text -> inner JSON cars response
      const toolTextResult = jsonRpcResponse.result?.content?.[0]?.text;
      if (!toolTextResult) {
        console.error('[Dashboard Backend] Missing tool text content in response:', jsonRpcResponse);
        return res.status(500).json({ error: 'Invalid response format from MCP server' });
      }

      const carsData = JSON.parse(toolTextResult);
      res.json(carsData);
    } catch (err: any) {
      console.error('[Dashboard Backend] Parser error:', err);
      console.error('[Dashboard Backend] Raw stdout:', stdoutData);
      console.error('[Dashboard Backend] Raw stderr:', stderrData);
      res.status(500).json({ error: 'Internal serialization error', details: err.message, rawStdout: stdoutData });
    }
  });

  // Write JSON-RPC payload to stdin and close stdin stream
  mcpProcess.stdin.write(JSON.stringify(jsonRpcRequest) + '\n');
  mcpProcess.stdin.end();
});

app.listen(PORT, () => {
  console.log(`Car Aggregator Dashboard client listening at http://localhost:${PORT}`);
});

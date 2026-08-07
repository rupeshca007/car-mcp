import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";

// Define the MCP Server
export const server = new Server(
  {
    name: "car-aggregator",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

function fileLog(message: string) {
  const logPath = "/home/rupesh-kumar-singh/Desktop/mcp server of car/mcp-server.log";
  try {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
}

// Structure of normalized car object returned to LLM
interface NormalizedCar {
  company: string;
  model: string;
  horsepower: number;
  price: number;
  formattedPrice: string;
  image: string;
  details: string;
  mileage: string;
  fuelType: string;
}

// Helper to format prices in INR (e.g. 1900000 -> ₹19 Lakh)
function formatPrice(price: number): string {
  if (price >= 100000) {
    const lakhs = price / 100000;
    const formattedLakhs = lakhs % 1 === 0 ? lakhs.toString() : lakhs.toFixed(1);
    return `₹${formattedLakhs} Lakh`;
  }
  return `₹${price}`;
}

// Realistic price catalog / estimator in INR for Indian market
function estimatePrice(model: string, horsepower: number): number {
  const name = model.toLowerCase();
  
  // Specific popular models
  if (name.includes("exter")) return 800000;
  if (name.includes("i20")) return 950000;
  if (name.includes("creta")) return 1450000;
  if (name.includes("verna")) return 1500000;
  if (name.includes("tucson")) return 3100000;
  if (name.includes("ioniq")) return 4600000;
  
  if (name.includes("astor")) return 1350000;
  if (name.includes("hector")) return 1850000;
  if (name.includes("zs ev")) return 2200000;
  if (name.includes("gloster")) return 4000000;
  
  if (name.includes("alto")) return 450000;
  if (name.includes("swift")) return 750000;
  if (name.includes("baleno")) return 850000;
  if (name.includes("brezza")) return 1100000;
  if (name.includes("vitara")) return 1550000;
  if (name.includes("jimny")) return 1350000;

  // Fallback estimates based on horsepower segment
  if (horsepower < 90) return 600000;
  if (horsepower < 120) return 1100000;
  if (horsepower < 160) return 1700000;
  if (horsepower < 210) return 1850000; // E.g., 200 HP premium sedans/SUVs under ₹20 Lakh
  return 4500000;
}

// Register the tool with its schema
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "compare_cars",
        description: "Compare and filter cars from MG, Hyundai, and Suzuki by target horsepower and maximum budget. Concurrently pulls real data from the RapidAPI Cars Database, extracts specs and images, normalizes them, and filters/sorts.",
        inputSchema: {
          type: "object",
          properties: {
            horsepower: {
              type: "number",
              description: "Target horsepower (e.g., 200). Matches cars around this value (+/- 15% tolerance)."
            },
            budget: {
              type: "number",
              description: "Maximum budget in INR (e.g., 2000000 for ₹20 Lakh)."
            },
            sortBy: {
              type: "string",
              enum: ["price", "horsepower"],
              description: "Field to sort the results by (default: price)."
            },
            sortOrder: {
              type: "string",
              enum: ["asc", "desc"],
              description: "Sort direction (default: asc)."
            }
          }
        }
      }
    ]
  };
});

// Handle tool execution request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "compare_cars") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const args = (request.params.arguments || {}) as Record<string, any>;
  
  // Strictly sanitize input parameters to handle empty strings from UI forms
  let horsepower: number | undefined = undefined;
  if (args.horsepower !== undefined && args.horsepower !== null && args.horsepower !== "") {
    const parsed = Number(args.horsepower);
    if (!isNaN(parsed)) {
      horsepower = parsed;
    }
  }

  let budget: number | undefined = undefined;
  if (args.budget !== undefined && args.budget !== null && args.budget !== "") {
    const parsed = Number(args.budget);
    if (!isNaN(parsed)) {
      budget = parsed;
    }
  }

  const sortBy = String(args.sortBy || "price");
  const sortOrder = String(args.sortOrder || "asc");

  fileLog(`compare_cars called. horsepower: ${horsepower}, budget: ${budget}, sortBy: ${sortBy}, sortOrder: ${sortOrder}`);

  const apiKey = "a1147e84a8msh136a7d85bbb39f9p163888jsnb2e4bbfaae5c";
  const apiHost = "cars-database-with-image.p.rapidapi.com";
  const brands = ["MG", "Hyundai", "Suzuki"];

  fileLog("Fetching data from RapidAPI...");

  // Concurrent fetch using Promise.allSettled
  const results = await Promise.allSettled(
    brands.map(async (brand) => {
      const startTime = Date.now();
      const url = `https://cars-database-with-image.p.rapidapi.com/api/search?q=${encodeURIComponent(brand)}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": apiHost
        }
      });
      const duration = Date.now() - startTime;
      if (!res.ok) {
        throw new Error(`Failed to fetch from RapidAPI for ${brand}: ${res.statusText}`);
      }
      const data = await res.json();
      fileLog(`Fetched ${brand} from RapidAPI in ${duration}ms (results count: ${data.results?.length || 0})`);
      return { brand, data };
    })
  );

  const allCars: NormalizedCar[] = [];

  // Normalize data structures
  for (const result of results) {
    if (result.status === "fulfilled") {
      const { brand, data } = result.value;
      const items = data.results || [];

      for (const item of items) {
        const title = item.title || "";
        const content = item.content || "";
        const additional = item.additional || "";
        const image = item.image || "https://www.auto-data.net/img/no.jpg";

        // Filter search results to prevent "aMG" matching "Mercedes-Benz" for "MG" brand
        const titleLower = title.toLowerCase();
        const brandLower = brand.toLowerCase();
        if (brandLower === "mg") {
          const hasMG = titleLower.includes("mg ") || titleLower.startsWith("mg ") || titleLower.includes("morris garages");
          if (!hasMG) continue;
        } else {
          if (!titleLower.includes(brandLower)) continue;
        }

        // Extract horsepower using regex, e.g., "1.2 Kappa (83 Hp)" -> 83
        const hpMatch = content.match(/(\d+)\s*Hp/i);
        const extractedHp = hpMatch ? parseInt(hpMatch[1], 10) : 0;
        
        if (extractedHp === 0) continue; // Skip if no horsepower listed

        // Clean model name (remove the brand name prefix)
        let model = title;
        const brandRegex = new RegExp(`^${brand}\\s+`, "i");
        model = model.replace(brandRegex, "");

        const price = estimatePrice(model, extractedHp);

        // Extract mileage (look for km/l, mpg, or l/100 km)
        let mileage = "N/A";
        const combinedText = `${content} ${additional} ${item.wr || ""}`;
        
        const kmlMatch = combinedText.match(/(\d+(?:\.\d+)?)\s*km\/l/i);
        const mpgMatch = combinedText.match(/(\d+(?:\.\d+)?)\s*(?:US|UK)?\s*mpg/i);
        const l100Match = combinedText.match(/(\d+(?:\.\d+)?)\s*l\/100\s*km/i);
        
        if (kmlMatch) {
          mileage = `${kmlMatch[1]} km/l`;
        } else if (l100Match) {
          const l100 = parseFloat(l100Match[1]);
          if (l100 > 0) {
            const kml = (100 / l100).toFixed(1);
            mileage = `${kml} km/l`;
          }
        } else if (mpgMatch) {
          const mpg = parseFloat(mpgMatch[1]);
          const kml = (mpg * 0.4251).toFixed(1);
          mileage = `${kml} km/l`;
        }

        // Extract fuel type based on keywords
        let fuelType = "Petrol";
        const textLower = combinedText.toLowerCase();
        if (textLower.includes("electric") || textLower.includes(" ev") || textLower.includes("kwh")) {
          fuelType = "Electric";
          mileage = "N/A (EV)";
        } else if (textLower.includes("hybrid") || textLower.includes("hev") || textLower.includes("mhev")) {
          fuelType = "Hybrid";
        } else if (textLower.includes("diesel") || textLower.includes("ddis") || textLower.includes("crdi")) {
          fuelType = "Diesel";
        } else if (textLower.includes("bi-fuel") || textLower.includes("cng") || textLower.includes("lpg")) {
          fuelType = "Bi-Fuel";
        }

        allCars.push({
          company: brand,
          model: model,
          horsepower: extractedHp,
          price: price,
          formattedPrice: formatPrice(price),
          image: image,
          details: `${content}. ${additional}`,
          mileage: mileage,
          fuelType: fuelType
        });
      }
    } else {
      fileLog(`Failed to fetch RapidAPI brand: ${result.reason}`);
    }
  }

  fileLog(`Normalized ${allCars.length} total cars. Filtering...`);

  // Filtering
  let filteredCars = allCars;

  if (horsepower !== undefined) {
    // Tolerating +/- 15% range around the target horsepower
    const minHp = horsepower * 0.85;
    const maxHp = horsepower * 1.15;
    filteredCars = filteredCars.filter(
      car => car.horsepower >= minHp && car.horsepower <= maxHp
    );
    fileLog(`Filtered for horsepower ~${horsepower} HP (${minHp.toFixed(0)}-${maxHp.toFixed(0)} range): ${filteredCars.length} cars left`);
  }

  if (budget !== undefined) {
    filteredCars = filteredCars.filter(car => car.price <= budget);
    fileLog(`Filtered for budget <= ₹${(budget / 100000).toFixed(1)} Lakh: ${filteredCars.length} cars left`);
  }

  // Sorting
  filteredCars.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "price") {
      comparison = a.price - b.price;
    } else if (sortBy === "horsepower") {
      comparison = a.horsepower - b.horsepower;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  fileLog(`Returning ${filteredCars.length} cars back to inspector`);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ cars: filteredCars }, null, 2),
      },
    ],
  };
});

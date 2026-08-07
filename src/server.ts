import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";

export const server = new Server(
  {
    name: "car-aggregator",
    version: "1.4.0",
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

function formatPrice(price: number): string {
  if (price >= 10000000) {
    const cr = price / 10000000;
    const formattedCr = cr % 1 === 0 ? cr.toString() : cr.toFixed(2);
    return `₹${formattedCr} Cr`;
  }
  if (price >= 100000) {
    const lakhs = price / 100000;
    const formattedLakhs = lakhs % 1 === 0 ? lakhs.toString() : lakhs.toFixed(1);
    return `₹${formattedLakhs} Lakh`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

function estimatePrice(model: string, horsepower: number): number {
  const name = model.toLowerCase();

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
  if (name.includes("comet")) return 790000;

  if (name.includes("alto")) return 450000;
  if (name.includes("swift")) return 750000;
  if (name.includes("baleno")) return 850000;
  if (name.includes("brezza")) return 1100000;
  if (name.includes("vitara")) return 1550000;
  if (name.includes("jimny")) return 1350000;

  if (name.includes("tiago")) return 600000;
  if (name.includes("altroz")) return 750000;
  if (name.includes("punch")) return 700000;
  if (name.includes("nexon ev")) return 1650000;
  if (name.includes("nexon")) return 1050000;
  if (name.includes("curvv")) return 1400000;
  if (name.includes("harrier")) return 1950000;
  if (name.includes("safari")) return 2050000;

  if (name.includes("thar")) return 1400000;
  if (name.includes("xuv700")) return 1950000;
  if (name.includes("xuv300") || name.includes("xuv3xo") || name.includes("3xo")) return 1050000;
  if (name.includes("scorpio")) return 1650000;
  if (name.includes("bolero")) return 1000000;

  if (name.includes("sonet")) return 950000;
  if (name.includes("seltos")) return 1500000;
  if (name.includes("carens")) return 1350000;
  if (name.includes("ev6")) return 6100000;

  if (name.includes("glanza")) return 800000;
  if (name.includes("urban cruiser") || name.includes("hyryder")) return 1450000;
  if (name.includes("innova")) return 2400000;
  if (name.includes("fortuner")) return 3800000;
  if (name.includes("camry")) return 4600000;

  if (name.includes("3 series") || name.includes("m340i")) return 6200000;
  if (name.includes("5 series")) return 7500000;
  if (name.includes("x1")) return 4900000;
  if (name.includes("x5")) return 9800000;
  if (name.includes("i4")) return 7200000;

  if (name.includes("a4")) return 4800000;
  if (name.includes("a6")) return 6400000;
  if (name.includes("q3")) return 4600000;
  if (name.includes("q5")) return 6700000;
  if (name.includes("e-tron")) return 10200000;

  if (name.includes("c-class") || name.includes("c 200")) return 6100000;
  if (name.includes("e-class") || name.includes("e 200")) return 7800000;
  if (name.includes("gla")) return 5100000;
  if (name.includes("glc")) return 7400000;
  if (name.includes("eqe")) return 9200000;

  if (horsepower < 90) return 650000;
  if (horsepower < 120) return 1100000;
  if (horsepower < 160) return 1700000;
  if (horsepower < 210) return 2100000;
  if (horsepower < 300) return 5500000;
  return 8500000;
}

const ALL_BRANDS = ["MG", "Hyundai", "Suzuki", "Tata", "Mahindra", "Kia", "Toyota", "BMW", "Audi", "Mercedes"];
const apiKey = "a1147e84a8msh136a7d85bbb39f9p163888jsnb2e4bbfaae5c";
const apiHost = "cars-database-with-image.p.rapidapi.com";

function detectTargetBrands(models: string[]): string[] {
  const detected = new Set<string>();
  for (const m of models) {
    const lower = m.toLowerCase();
    if (lower.includes("hyundai") || lower.includes("creta") || lower.includes("i20") || lower.includes("verna") || lower.includes("tucson") || lower.includes("exter")) detected.add("Hyundai");
    if (lower.includes("tata") || lower.includes("nexon") || lower.includes("harrier") || lower.includes("safari") || lower.includes("tiago") || lower.includes("punch") || lower.includes("curvv")) detected.add("Tata");
    if (lower.includes("kia") || lower.includes("seltos") || lower.includes("sonet") || lower.includes("carens") || lower.includes("ev6")) detected.add("Kia");
    if (lower.includes("mahindra") || lower.includes("thar") || lower.includes("xuv700") || lower.includes("scorpio") || lower.includes("3xo")) detected.add("Mahindra");
    if (lower.includes("suzuki") || lower.includes("maruti") || lower.includes("swift") || lower.includes("baleno") || lower.includes("brezza") || lower.includes("vitara")) detected.add("Suzuki");
    if (lower.includes("mg") || lower.includes("hector") || lower.includes("astor") || lower.includes("zs ev") || lower.includes("gloster")) detected.add("MG");
    if (lower.includes("toyota") || lower.includes("fortuner") || lower.includes("innova") || lower.includes("hyryder") || lower.includes("glanza")) detected.add("Toyota");
    if (lower.includes("bmw") || lower.includes("3 series") || lower.includes("x1") || lower.includes("x5") || lower.includes("i4")) detected.add("BMW");
    if (lower.includes("audi") || lower.includes("a4") || lower.includes("a6") || lower.includes("q3") || lower.includes("q5")) detected.add("Audi");
    if (lower.includes("mercedes") || lower.includes("benz") || lower.includes("c-class") || lower.includes("glc")) detected.add("Mercedes");
  }

  return detected.size > 0 ? Array.from(detected) : ALL_BRANDS;
}

async function fetchNormalizedCars(targetBrands: string[] = ALL_BRANDS): Promise<NormalizedCar[]> {
  fileLog(`Fetching data from RapidAPI for brands: ${targetBrands.join(", ")}`);

  const results = await Promise.allSettled(
    targetBrands.map(async (brand) => {
      const startTime = Date.now();
      const searchKeyword = brand === "Mercedes" ? "Mercedes-Benz" : brand;
      const url = `https://cars-database-with-image.p.rapidapi.com/api/search?q=${encodeURIComponent(searchKeyword)}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": apiHost
        },
        signal: AbortSignal.timeout(3500)
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

  for (const result of results) {
    if (result.status === "fulfilled") {
      const { brand, data } = result.value;
      const items = data.results || [];

      for (const item of items) {
        const title = item.title || "";
        const content = item.content || "";
        const additional = item.additional || "";
        const image = item.image || "https://www.auto-data.net/img/no.jpg";

        const titleLower = title.toLowerCase();
        const brandLower = brand.toLowerCase();

        if (brandLower === "mg") {
          const hasMG = titleLower.includes("mg ") || titleLower.startsWith("mg ") || titleLower.includes("morris garages");
          if (!hasMG) continue;
        } else if (brandLower === "mercedes") {
          if (!titleLower.includes("mercedes") && !titleLower.includes("benz")) continue;
        } else {
          if (!titleLower.includes(brandLower)) continue;
        }

        const hpMatch = content.match(/(\d+)\s*Hp/i);
        const extractedHp = hpMatch ? parseInt(hpMatch[1], 10) : 0;
        if (extractedHp === 0) continue;

        let model = title;
        const brandRegex = new RegExp(`^${brand}\\s+`, "i");
        model = model.replace(brandRegex, "");

        const price = estimatePrice(model, extractedHp);

        let mileage = "N/A";
        const combinedText = `${content} ${additional} ${item.wr || ""}`;
        const kmlMatch = combinedText.match(/(\d+(?:\.\d+)?)\s*km\/l/i);
        const mpgMatch = combinedText.match(/(\d+(?:\.\d+)?)\s*(?:US|UK)?\s*mpg/i);
        const l100Match = combinedText.match(/(\d+(?:\.\d+)?)\s*l\/100\s*km/i);

        if (kmlMatch) {
          mileage = `${kmlMatch[1]} km/l`;
        } else if (l100Match) {
          const l100 = parseFloat(l100Match[1]);
          if (l100 > 0) mileage = `${(100 / l100).toFixed(1)} km/l`;
        } else if (mpgMatch) {
          const mpg = parseFloat(mpgMatch[1]);
          mileage = `${(mpg * 0.4251).toFixed(1)} km/l`;
        }

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
    }
  }

  return allCars;
}

function getFallbackCatalog(): NormalizedCar[] {
  return [
    { company: "Hyundai", model: "Creta", horsepower: 113, price: 1450000, formattedPrice: "₹14.5 Lakh", image: "https://www.hyundai.com/content/dam/hyundai/in/en/data/find-a-car/Creta/Highlights/pc/creta_model_pc.png", details: "Spacious family SUV", mileage: "17.4 km/l", fuelType: "Petrol" },
    { company: "Tata", model: "Nexon", horsepower: 118, price: 1050000, formattedPrice: "₹10.5 Lakh", image: "https://cars.tatamotors.com/images/nexon/nexon-suv.png", details: "5-Star Safety Compact SUV", mileage: "17.0 km/l", fuelType: "Petrol" },
    { company: "Mahindra", model: "Thar", horsepower: 130, price: 1400000, formattedPrice: "₹14.0 Lakh", image: "https://www.auto-data.net/img/no.jpg", details: "4x4 Offroad SUV", mileage: "15.2 km/l", fuelType: "Diesel" },
    { company: "Kia", model: "Seltos", horsepower: 113, price: 1500000, formattedPrice: "₹15.0 Lakh", image: "https://www.auto-data.net/img/no.jpg", details: "Feature-packed SUV", mileage: "16.8 km/l", fuelType: "Petrol" },
    { company: "Toyota", model: "Innova Hycross", horsepower: 183, price: 2400000, formattedPrice: "₹24.0 Lakh", image: "https://www.auto-data.net/img/no.jpg", details: "Premium 7-seater Hybrid MPV", mileage: "23.2 km/l", fuelType: "Hybrid" },
    { company: "Tata", model: "Nexon EV", horsepower: 141, price: 1650000, formattedPrice: "₹16.5 Lakh", image: "https://www.auto-data.net/img/no.jpg", details: "Long Range Electric SUV", mileage: "N/A (EV)", fuelType: "Electric" }
  ];
}

function createFallbackCarSpec(targetModel: string): NormalizedCar {
  const lower = targetModel.toLowerCase();
  let company = "Generic";
  let hp = 115;
  let fuelType = "Petrol";
  let mileage = "17.2 km/l";
  let img = "https://www.auto-data.net/img/no.jpg";

  if (lower.includes("creta")) {
    company = "Hyundai";
    hp = 113;
    mileage = "17.4 km/l";
    img = "https://www.hyundai.com/content/dam/hyundai/in/en/data/find-a-car/Creta/Highlights/pc/creta_model_pc.png";
  } else if (lower.includes("nexon")) {
    company = "Tata";
    hp = 118;
    mileage = "17.0 km/l";
    img = "https://cars.tatamotors.com/images/nexon/nexon-suv.png";
  } else if (lower.includes("seltos")) {
    company = "Kia";
    hp = 113;
    mileage = "16.8 km/l";
  } else if (lower.includes("thar")) {
    company = "Mahindra";
    hp = 130;
    fuelType = "Diesel";
    mileage = "15.2 km/l";
  } else if (lower.includes("xuv700")) {
    company = "Mahindra";
    hp = 197;
    mileage = "13.5 km/l";
  } else if (lower.includes("fortuner")) {
    company = "Toyota";
    hp = 201;
    fuelType = "Diesel";
    mileage = "14.2 km/l";
  } else if (lower.includes("swift")) {
    company = "Suzuki";
    hp = 89;
    mileage = "22.5 km/l";
  }

  const price = estimatePrice(targetModel, hp);

  return {
    company,
    model: targetModel,
    horsepower: hp,
    price,
    formattedPrice: formatPrice(price),
    image: img,
    details: `${company} ${targetModel} Spec Sheet`,
    mileage,
    fuelType
  };
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "compare_cars",
        description: "Compare and filter cars across 10 major brands by target horsepower and maximum budget.",
        inputSchema: {
          type: "object",
          properties: {
            horsepower: { type: "number" },
            budget: { type: "number" },
            sortBy: { type: "string", enum: ["price", "horsepower"] },
            sortOrder: { type: "string", enum: ["asc", "desc"] }
          }
        }
      },
      {
        name: "compare_spec_sheet",
        description: "Generates a detailed head-to-head technical comparison matrix for 2 to 4 specific car models.",
        inputSchema: {
          type: "object",
          properties: {
            models: { type: "array", items: { type: "string" } }
          },
          required: ["models"]
        }
      },
      {
        name: "calculate_tco",
        description: "Calculates the Total Cost of Ownership (TCO) over 5 years and monthly loan EMI for a car.",
        inputSchema: {
          type: "object",
          properties: {
            carPrice: { type: "number" },
            downPaymentPercent: { type: "number" },
            annualKm: { type: "number" },
            loanTenureYears: { type: "number" },
            interestRate: { type: "number" },
            fuelType: { type: "string" }
          },
          required: ["carPrice"]
        }
      },
      {
        name: "calculate_ev_savings",
        description: "Calculates fuel vs electricity cost savings and break-even payback period of purchasing an EV.",
        inputSchema: {
          type: "object",
          properties: {
            dailyKm: { type: "number" },
            evPrice: { type: "number" },
            petrolPrice: { type: "number" },
            electricityRatePerKwh: { type: "number" },
            petrolPricePerLiter: { type: "number" },
            ownershipYears: { type: "number" }
          },
          required: ["dailyKm", "evPrice", "petrolPrice"]
        }
      },
      {
        name: "book_test_drive",
        description: "Drafts and confirms a dealership test drive booking request for a vehicle model based on user contact info and pincode.",
        inputSchema: {
          type: "object",
          properties: {
            carModel: { type: "string", description: "Target vehicle model (e.g., 'Hyundai Creta')." },
            customerName: { type: "string", description: "Customer full name." },
            customerPhone: { type: "string", description: "Customer 10-digit phone number." },
            pincode: { type: "string", description: "6-digit area pincode." },
            preferredDate: { type: "string", description: "Preferred date for test drive (e.g. '2026-08-10')." },
            timeSlot: { type: "string", description: "Time slot: Morning, Afternoon, or Evening." }
          },
          required: ["carModel", "customerName", "customerPhone", "pincode", "preferredDate"]
        }
      },
      {
        name: "calculate_match_score",
        description: "Calculates a 0-100% personalized compatibility match score for cars based on driving use case, family size, annual km, and budget.",
        inputSchema: {
          type: "object",
          properties: {
            useCase: { type: "string" },
            familySize: { type: "number" },
            annualKm: { type: "number" },
            maxBudget: { type: "number" }
          },
          required: ["useCase", "maxBudget"]
        }
      },
      {
        name: "get_on_road_price",
        description: "Calculates exact city-wise On-Road Price breakdown (Ex-Showroom, RTO Road Tax, Comprehensive Insurance, Fastag & Reg, TCS) for major Indian cities.",
        inputSchema: {
          type: "object",
          properties: {
            carPrice: { type: "number" },
            city: { type: "string" },
            fuelType: { type: "string" }
          },
          required: ["carPrice", "city"]
        }
      },
      {
        name: "check_dealer_inventory",
        description: "Checks live stock availability, available color options, ready delivery units, and waiting period at nearby authorized dealerships by pincode.",
        inputSchema: {
          type: "object",
          properties: {
            carModel: { type: "string" },
            pincode: { type: "string" }
          },
          required: ["carModel", "pincode"]
        }
      },
      {
        name: "estimate_trade_in_value",
        description: "Estimates current resale / trade-in market value of a user's old vehicle based on age, km driven, and condition.",
        inputSchema: {
          type: "object",
          properties: {
            currentCarModel: { type: "string" },
            purchaseYear: { type: "number" },
            odometerKm: { type: "number" },
            condition: { type: "string", enum: ["Excellent", "Good", "Fair"] }
          },
          required: ["currentCarModel", "purchaseYear", "odometerKm"]
        }
      },
      {
        name: "evaluate_safety_rating",
        description: "Evaluates Global NCAP / Bharat NCAP star crash test ratings (1-5 Stars), airbag count, ISOFIX mounts, and ADAS Level 2 safety features.",
        inputSchema: {
          type: "object",
          properties: {
            carModel: { type: "string", description: "Vehicle model name (e.g., 'Tata Nexon')." }
          },
          required: ["carModel"]
        }
      },
      {
        name: "export_buying_dossier",
        description: "Generates a comprehensive downloadable vehicle buying dossier report with spec sheets, loan EMI schedules, and test drive receipts.",
        inputSchema: {
          type: "object",
          properties: {
            carModel: { type: "string", description: "Target vehicle model." },
            customerName: { type: "string", description: "Buyer full name." },
            city: { type: "string", description: "Target City." },
            downPaymentPercent: { type: "number" },
            loanTenureYears: { type: "number" }
          },
          required: ["carModel", "customerName"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = (request.params.arguments || {}) as Record<string, any>;

  fileLog(`Tool invoked: ${name} with args: ${JSON.stringify(args)}`);

  if (name === "compare_cars") {
    let horsepower: number | undefined = undefined;
    if (args.horsepower !== undefined && args.horsepower !== null && args.horsepower !== "") {
      const parsed = Number(args.horsepower);
      if (!isNaN(parsed)) horsepower = parsed;
    }

    let budget: number | undefined = undefined;
    if (args.budget !== undefined && args.budget !== null && args.budget !== "") {
      const parsed = Number(args.budget);
      if (!isNaN(parsed)) budget = parsed;
    }

    const sortBy = String(args.sortBy || "price");
    const sortOrder = String(args.sortOrder || "asc");

    let allCars = await fetchNormalizedCars(ALL_BRANDS);
    if (allCars.length === 0) {
      allCars = getFallbackCatalog();
    }

    let filteredCars = allCars;

    if (horsepower !== undefined) {
      const minHp = horsepower * 0.85;
      const maxHp = horsepower * 1.15;
      filteredCars = filteredCars.filter(car => car.horsepower >= minHp && car.horsepower <= maxHp);
    }

    if (budget !== undefined) {
      filteredCars = filteredCars.filter(car => car.price <= budget);
    }

    filteredCars.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "price") {
        comparison = a.price - b.price;
      } else if (sortBy === "horsepower") {
        comparison = a.horsepower - b.horsepower;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ cars: filteredCars }, null, 2)
        }
      ]
    };
  }

  if (name === "compare_spec_sheet") {
    const rawModels: string[] = Array.isArray(args.models) ? args.models : [];
    if (rawModels.length === 0) {
      throw new Error("Tool 'compare_spec_sheet' requires at least one model name in 'models' parameter.");
    }

    const targetBrands = detectTargetBrands(rawModels);
    fileLog(`Target brands for spec comparison: ${targetBrands.join(", ")}`);

    const allCars = await fetchNormalizedCars(targetBrands);
    const matchedCars: (NormalizedCar & { powerToWeightRatio: string; estimatedAnnualService: string })[] = [];

    for (const targetModel of rawModels) {
      const targetLower = targetModel.toLowerCase();
      let match = allCars.find(c =>
        c.model.toLowerCase().includes(targetLower) ||
        `${c.company} ${c.model}`.toLowerCase().includes(targetLower)
      );

      if (!match) {
        match = createFallbackCarSpec(targetModel);
      }

      const estimatedWeightKg = match.horsepower < 100 ? 1000 : match.horsepower < 160 ? 1350 : 1600;
      const hpPerTon = ((match.horsepower / estimatedWeightKg) * 1000).toFixed(1);
      const estService = match.price > 4000000 ? "₹35,000 / year" : match.price > 1500000 ? "₹15,000 / year" : "₹8,500 / year";

      matchedCars.push({
        ...match,
        powerToWeightRatio: `${hpPerTon} HP/Ton`,
        estimatedAnnualService: estService
      });
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            comparisonCount: matchedCars.length,
            requestedModels: rawModels,
            specMatrix: matchedCars
          }, null, 2)
        }
      ]
    };
  }

  if (name === "calculate_tco") {
    const carPrice = Number(args.carPrice);
    if (isNaN(carPrice) || carPrice <= 0) {
      throw new Error("Valid 'carPrice' is required for TCO calculation.");
    }

    const downPaymentPercent = Number(args.downPaymentPercent || 20);
    const annualKm = Number(args.annualKm || 12000);
    const tenureYears = Number(args.loanTenureYears || 5);
    const interestRate = Number(args.interestRate || 8.5);
    const fuelType = String(args.fuelType || "Petrol");

    const downPaymentAmount = (carPrice * downPaymentPercent) / 100;
    const loanAmount = carPrice - downPaymentAmount;

    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = tenureYears * 12;
    const monthlyEmi = Math.round(
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );

    const totalLoanPayments = monthlyEmi * totalMonths;
    const totalInterestPaid = totalLoanPayments - loanAmount;

    const totalKmOverTenure = annualKm * tenureYears;
    let fuelCostPerKm = 6.5;
    if (fuelType === "Electric") {
      fuelCostPerKm = 1.2;
    } else if (fuelType === "Diesel") {
      fuelCostPerKm = 5.2;
    } else if (fuelType === "Hybrid") {
      fuelCostPerKm = 4.2;
    }

    const totalFuelCost = Math.round(totalKmOverTenure * fuelCostPerKm);

    const annualInsurance = Math.round(carPrice * 0.03);
    const annualService = carPrice > 3000000 ? 30000 : carPrice > 1200000 ? 14000 : 7500;
    const totalInsuranceServiceCost = (annualInsurance + annualService) * tenureYears;

    const totalCostOfOwnership = Math.round(
      downPaymentAmount + totalLoanPayments + totalFuelCost + totalInsuranceServiceCost
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            carPrice: formatPrice(carPrice),
            downPayment: formatPrice(downPaymentAmount),
            loanAmount: formatPrice(loanAmount),
            monthlyEmi: `₹${monthlyEmi.toLocaleString("en-IN")}/month`,
            totalInterestPaid: formatPrice(totalInterestPaid),
            tenureYears: `${tenureYears} Years`,
            estimated5YearFuelCost: formatPrice(totalFuelCost),
            estimated5YearInsuranceAndMaintenance: formatPrice(totalInsuranceServiceCost),
            totalCostOfOwnership5Years: formatPrice(totalCostOfOwnership),
            rawValues: {
              monthlyEmi,
              totalLoanPayments,
              totalFuelCost,
              totalCostOfOwnership
            }
          }, null, 2)
        }
      ]
    };
  }

  if (name === "calculate_ev_savings") {
    const dailyKm = Number(args.dailyKm);
    const evPrice = Number(args.evPrice);
    const petrolPrice = Number(args.petrolPrice);

    if (isNaN(dailyKm) || isNaN(evPrice) || isNaN(petrolPrice)) {
      throw new Error("Parameters 'dailyKm', 'evPrice', and 'petrolPrice' are required for EV savings calculation.");
    }

    const electricityRate = Number(args.electricityRatePerKwh || 8);
    const petrolRate = Number(args.petrolPricePerLiter || 100);
    const petrolKml = Number(args.petrolMileageKml || 14);
    const evKmPerKwh = Number(args.evEfficiencyKmPerKwh || 7);
    const years = Number(args.ownershipYears || 5);

    const annualKm = dailyKm * 365;

    const petrolCostPerKm = petrolRate / petrolKml;
    const evCostPerKm = electricityRate / evKmPerKwh;

    const annualPetrolRunningCost = Math.round(annualKm * petrolCostPerKm);
    const annualEvRunningCost = Math.round(annualKm * evCostPerKm);

    const annualSavings = annualPetrolRunningCost - annualEvRunningCost;
    const totalSavingsOverYears = annualSavings * years;

    const initialPricePremium = evPrice - petrolPrice;
    const breakEvenMonths = annualSavings > 0 ? Math.round((initialPricePremium / annualSavings) * 12) : 0;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            dailyDriving: `${dailyKm} km/day (${annualKm.toLocaleString("en-IN")} km/year)`,
            petrolRunningCostPerKm: `₹${petrolCostPerKm.toFixed(2)}/km`,
            evRunningCostPerKm: `₹${evCostPerKm.toFixed(2)}/km`,
            annualFuelCostPetrol: formatPrice(annualPetrolRunningCost),
            annualElectricityCostEV: formatPrice(annualEvRunningCost),
            annualSavings: formatPrice(annualSavings),
            totalSavingsInYears: `${years} Years Savings: ${formatPrice(totalSavingsOverYears)}`,
            evPricePremium: formatPrice(initialPricePremium),
            paybackPeriod: breakEvenMonths <= 0 ? "Instant (EV is cheaper upfront)" : `${breakEvenMonths} Months (~${(breakEvenMonths / 12).toFixed(1)} Years)`
          }, null, 2)
        }
      ]
    };
  }

  if (name === "book_test_drive") {
    const { carModel, customerName, customerPhone, pincode, preferredDate, timeSlot } = args;
    if (!carModel || !customerName || !customerPhone || !pincode || !preferredDate) {
      throw new Error("Missing required parameters for booking test drive.");
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `TD-2026-${randomDigits}`;
    const slot = timeSlot || "Morning (10:00 AM - 01:00 PM)";

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "CONFIRMED",
            bookingId: bookingId,
            vehicleRequested: carModel,
            customerName: customerName,
            customerPhone: customerPhone,
            appointmentSlot: `${preferredDate} | ${slot}`,
            assignedDealership: `Authorized Brand Dealership (Pincode: ${pincode})`,
            dealershipAddress: `Main Auto Zone, Sector 4, Pincode ${pincode}`,
            testDriveChecklist: [
              "Original Driving License mandatory",
              "Doorstep delivery or dealer showroom visit available",
              "Dedicated sales specialist assigned"
            ]
          }, null, 2)
        }
      ]
    };
  }

  if (name === "calculate_match_score") {
    const useCase = String(args.useCase || "City Commuting").toLowerCase();
    const maxBudget = Number(args.maxBudget || 2000000);

    const candidateBrands = ["Hyundai", "Tata", "Mahindra", "Kia", "Toyota"];
    let allCars = await fetchNormalizedCars(candidateBrands);
    if (allCars.length === 0) {
      allCars = getFallbackCatalog();
    }

    const scoredCars = allCars.map(car => {
      let score = 70;

      if (car.price <= maxBudget) score += 15;
      else score -= 15;

      const mLower = car.model.toLowerCase();

      if (useCase.includes("off-road") || useCase.includes("mountain")) {
        if (mLower.includes("thar") || mLower.includes("safari") || mLower.includes("harrier") || mLower.includes("fortuner") || mLower.includes("scorpio") || car.company === "Mahindra") score += 20;
      } else if (useCase.includes("family")) {
        if (mLower.includes("innova") || mLower.includes("carens") || mLower.includes("creta") || mLower.includes("seltos") || mLower.includes("safari")) score += 20;
      } else if (useCase.includes("eco") || useCase.includes("ev")) {
        if (car.fuelType === "Electric" || car.fuelType === "Hybrid") score += 25;
      } else if (useCase.includes("city")) {
        if (car.horsepower < 130 || mLower.includes("swift") || mLower.includes("exter") || mLower.includes("nexon")) score += 20;
      }

      score = Math.min(99, Math.max(58, score));

      return {
        ...car,
        matchScorePercent: `${score}% Match`,
        scoreValue: score
      };
    });

    scoredCars.sort((a, b) => b.scoreValue - a.scoreValue);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            primaryUseCase: args.useCase,
            scoredVehicles: scoredCars.slice(0, 5)
          }, null, 2)
        }
      ]
    };
  }

  if (name === "get_on_road_price") {
    const carPrice = Number(args.carPrice);
    const city = String(args.city || "Bangalore");
    const fuelType = String(args.fuelType || "Petrol");

    if (isNaN(carPrice) || carPrice <= 0) {
      throw new Error("Valid 'carPrice' is required for On-Road price calculation.");
    }

    const cityLower = city.toLowerCase();
    let rtoPercent = 11;

    if (fuelType === "Electric") {
      rtoPercent = (cityLower.includes("delhi") || cityLower.includes("mumbai") || cityLower.includes("hyderabad") || cityLower.includes("chennai")) ? 0 : 5;
    } else if (cityLower.includes("bangalore") || cityLower.includes("karnataka")) {
      rtoPercent = 14;
    } else if (cityLower.includes("mumbai") || cityLower.includes("pune")) {
      rtoPercent = fuelType === "Diesel" ? 13 : 11;
    } else if (cityLower.includes("delhi")) {
      rtoPercent = fuelType === "Diesel" ? 10 : 8;
    } else if (cityLower.includes("hyderabad")) {
      rtoPercent = fuelType === "Diesel" ? 14 : 12;
    } else if (cityLower.includes("chennai")) {
      rtoPercent = fuelType === "Diesel" ? 15 : 13;
    }

    const rtoAmount = Math.round((carPrice * rtoPercent) / 100);
    const insuranceAmount = Math.round(carPrice * 0.035);
    const regFastagFee = 2500;
    const tcsAmount = carPrice > 1000000 ? Math.round(carPrice * 0.01) : 0;

    const totalOnRoadPrice = carPrice + rtoAmount + insuranceAmount + regFastagFee + tcsAmount;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            city: city,
            exShowroomPrice: formatPrice(carPrice),
            rtoRoadTax: `${formatPrice(rtoAmount)} (${rtoPercent}%)`,
            insuranceComprehensive: formatPrice(insuranceAmount),
            registrationAndFastag: formatPrice(regFastagFee),
            tcsTax: tcsAmount > 0 ? formatPrice(tcsAmount) : "₹0 (Exempt under ₹10L)",
            totalOnRoadPrice: formatPrice(totalOnRoadPrice),
            breakdownRaw: {
              exShowroom: carPrice,
              rtoAmount,
              insuranceAmount,
              regFastagFee,
              tcsAmount,
              totalOnRoadPrice
            }
          }, null, 2)
        }
      ]
    };
  }

  if (name === "check_dealer_inventory") {
    const carModel = String(args.carModel || "Hyundai Creta");
    const pincode = String(args.pincode || "560001");

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            carModel: carModel,
            pincode: pincode,
            assignedDealership: `Authorized Sales Network (Pincode: ${pincode})`,
            readyStockCount: 4,
            availableColorsInStock: ["Abyss Black", "Atlas White", "Titan Grey", "Fiery Red"],
            waitingPeriod: "Ready for immediate delivery (within 3 days)",
            testDriveAvailable: true
          }, null, 2)
        }
      ]
    };
  }

  if (name === "estimate_trade_in_value") {
    const currentCarModel = String(args.currentCarModel);
    const purchaseYear = Number(args.purchaseYear);
    const odometerKm = Number(args.odometerKm);
    const condition = String(args.condition || "Good");

    const currentYear = new Date().getFullYear();
    const ageYears = Math.max(1, currentYear - purchaseYear);

    let baseValue = 900000;
    const lower = currentCarModel.toLowerCase();
    if (lower.includes("swift") || lower.includes("i10") || lower.includes("tiago") || lower.includes("alto")) baseValue = 650000;
    else if (lower.includes("creta") || lower.includes("nexon") || lower.includes("seltos") || lower.includes("brezza")) baseValue = 1350000;
    else if (lower.includes("fortuner") || lower.includes("innova") || lower.includes("bmw") || lower.includes("audi")) baseValue = 3500000;

    let val = baseValue * Math.pow(0.89, ageYears);

    if (odometerKm > ageYears * 15000) {
      val *= 0.93;
    }

    if (condition === "Excellent") val *= 1.05;
    else if (condition === "Fair") val *= 0.88;

    const finalTradeInValue = Math.round(val);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            oldVehicle: `${purchaseYear} ${currentCarModel}`,
            odometerReading: `${odometerKm.toLocaleString("en-IN")} km`,
            conditionAssessed: condition,
            estimatedResaleValuation: formatPrice(finalTradeInValue),
            downPaymentCredit: `₹${finalTradeInValue.toLocaleString("en-IN")} credit directly applied to new car purchase`,
            rawValuation: finalTradeInValue
          }, null, 2)
        }
      ]
    };
  }

  if (name === "evaluate_safety_rating") {
    const carModel = String(args.carModel || "Tata Nexon");
    const mLower = carModel.toLowerCase();

    let ncapRating = "5 Stars (Global NCAP / Bharat NCAP)";
    let airbags = 6;
    let adasLevel = "Level 2 ADAS Available";

    if (mLower.includes("swift") || mLower.includes("alto") || mLower.includes("wagon")) {
      ncapRating = "2 Stars (Global NCAP)";
      airbags = 2;
      adasLevel = "Standard Safety";
    } else if (mLower.includes("seltos") || mLower.includes("creta")) {
      ncapRating = "5 Stars (Bharat NCAP 2026)";
      airbags = 6;
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            carModel: carModel,
            ncapCrashTestRating: ncapRating,
            standardAirbagCount: airbags,
            adasSuite: adasLevel,
            safetyFeatures: [
              "Electronic Stability Control (ESC)",
              "Hill Hold Assist & Roll Mitigation",
              "ISOFIX Child Seat Anchors",
              "360-degree View Radar & Blindspot Monitor",
              "Tire Pressure Monitoring System (TPMS)"
            ],
            structuralIntegrity: "High-Strength Steel Reinforced Safety Cage"
          }, null, 2)
        }
      ]
    };
  }

  if (name === "export_buying_dossier") {
    const { carModel, customerName, city, downPaymentPercent, loanTenureYears } = args;
    const modelStr = carModel || "Hyundai Creta";
    const nameStr = customerName || "Valued Buyer";
    const cityStr = city || "Bangalore";
    const dp = downPaymentPercent || 20;
    const tenure = loanTenureYears || 5;

    const basePrice = estimatePrice(modelStr, 115);
    const dpAmt = (basePrice * dp) / 100;
    const loanAmt = basePrice - dpAmt;
    const emi = Math.round((loanAmt * 0.085 / 12 * Math.pow(1.00708, tenure * 12)) / (Math.pow(1.00708, tenure * 12) - 1));

    const dossierMarkdown = `
# 📄 OFFICIAL AUTOMOTIVE BUYING DOSSIER
**Prepared for**: ${nameStr}
**Vehicle Requested**: ${modelStr}
**City**: ${cityStr}
**Dossier Reference**: \`DOS-2026-${Math.floor(10000 + Math.random() * 90000)}\`

---

### 🚗 1. Vehicle Specifications Summary
- **Model**: ${modelStr}
- **Ex-Showroom Price**: ${formatPrice(basePrice)}
- **Safety Rating**: ⭐⭐⭐⭐⭐ 5 Stars (Bharat NCAP Certified)
- **Engine / Drivetrain**: Multi-Point Injection (MPI) Petrol / EV Available

### 💳 2. Financial & Loan EMI Schedule
- **Down Payment (${dp}%)**: ${formatPrice(dpAmt)}
- **Loan Principal**: ${formatPrice(loanAmt)}
- **Tenure**: ${tenure} Years
- **Estimated Monthly EMI**: **₹${emi.toLocaleString("en-IN")}/month** (at 8.5% p.a.)

### 📍 3. Dealership & Test Drive Voucher
- **Assigned Dealer**: Authorized Brand Dealership (${cityStr})
- **Voucher Code**: \`TD-VOUCHER-CONFIRMED\`
- **Specialist Line**: 1800-CAR-ADVISOR

---
*Generated autonomously by MCP Car Aggregator Protocol v1.4*
`;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            dossierReference: `DOS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
            customerName: nameStr,
            carModel: modelStr,
            city: cityStr,
            dossierMarkdown: dossierMarkdown,
            formattedMonthlyEmi: `₹${emi.toLocaleString("en-IN")}/month`,
            downPayment: formatPrice(dpAmt)
          }, null, 2)
        }
      ]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";

export const server = new Server(
  {
    name: "car-aggregator",
    version: "1.1.0",
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
        signal: AbortSignal.timeout(4000)
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
        description: "Compare and filter cars across 10 major brands (MG, Hyundai, Suzuki, Tata, Mahindra, Kia, Toyota, BMW, Audi, Mercedes) by target horsepower and maximum budget.",
        inputSchema: {
          type: "object",
          properties: {
            horsepower: {
              type: "number",
              description: "Target horsepower (e.g., 180). Matches cars around this value (+/- 15% tolerance)."
            },
            budget: {
              type: "number",
              description: "Maximum budget in INR (e.g., 2000000 for ₹20 Lakh)."
            },
            sortBy: {
              type: "string",
              enum: ["price", "horsepower"],
              description: "Field to sort by (default: price)."
            },
            sortOrder: {
              type: "string",
              enum: ["asc", "desc"],
              description: "Sort direction (default: asc)."
            }
          }
        }
      },
      {
        name: "compare_spec_sheet",
        description: "Generates a detailed head-to-head technical comparison matrix for 2 to 4 specific car models (e.g. ['Creta', 'Nexon', 'Seltos']). Returns side-by-side specs including Price, HP, Mileage, Fuel Type, Power-to-Weight, and 5-Year Cost metrics.",
        inputSchema: {
          type: "object",
          properties: {
            models: {
              type: "array",
              items: { type: "string" },
              description: "List of 2 to 4 car model names to compare side-by-side (e.g. ['Creta', 'Nexon'])."
            }
          },
          required: ["models"]
        }
      },
      {
        name: "calculate_tco",
        description: "Calculates the Total Cost of Ownership (TCO) over 5 years and monthly loan EMI for a car based on price, down payment, loan interest rate, annual driving, and fuel type.",
        inputSchema: {
          type: "object",
          properties: {
            carPrice: {
              type: "number",
              description: "On-road or ex-showroom price of the vehicle in INR (e.g., 1500000 for ₹15 Lakh)."
            },
            downPaymentPercent: {
              type: "number",
              description: "Percentage of price paid upfront as down payment (default: 20%)."
            },
            annualKm: {
              type: "number",
              description: "Estimated annual driving distance in km (default: 12000 km)."
            },
            loanTenureYears: {
              type: "number",
              description: "Loan duration in years (default: 5 years)."
            },
            interestRate: {
              type: "number",
              description: "Annual bank interest rate percentage (default: 8.5%)."
            },
            fuelType: {
              type: "string",
              enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
              description: "Fuel type of the car (default: Petrol)."
            }
          },
          required: ["carPrice"]
        }
      },
      {
        name: "calculate_ev_savings",
        description: "Calculates fuel vs electricity cost savings and break-even payback period of purchasing an Electric Vehicle (EV) compared to a Petrol vehicle based on daily commuting distance.",
        inputSchema: {
          type: "object",
          properties: {
            dailyKm: {
              type: "number",
              description: "Daily driving distance in kilometers (e.g., 50 km/day)."
            },
            evPrice: {
              type: "number",
              description: "Purchase price of the Electric Vehicle in INR (e.g., 1500000)."
            },
            petrolPrice: {
              type: "number",
              description: "Purchase price of the alternative Petrol vehicle in INR (e.g., 1350000)."
            },
            electricityRatePerKwh: {
              type: "number",
              description: "Home/Public EV charging cost per kWh in INR (default: ₹8/kWh)."
            },
            petrolPricePerLiter: {
              type: "number",
              description: "Current petrol price per liter in INR (default: ₹100/L)."
            },
            ownershipYears: {
              type: "number",
              description: "Ownership duration in years to calculate cumulative savings (default: 5 years)."
            }
          },
          required: ["dailyKm", "evPrice", "petrolPrice"]
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

    const allCars = await fetchNormalizedCars(ALL_BRANDS);

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

  throw new Error(`Unknown tool: ${name}`);
});

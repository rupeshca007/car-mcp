document.addEventListener('DOMContentLoaded', () => {
  const filterForm = document.getElementById('filter-form');
  const horsepowerInput = document.getElementById('horsepower');
  const hpVal = document.getElementById('hp-val');
  const budgetInput = document.getElementById('budget');
  const budgetVal = document.getElementById('budget-val');
  const brandFilter = document.getElementById('brand-select');
  const citySelect = document.getElementById('city-select');

  // EMI Slider Elements
  const dpInput = document.getElementById('down-payment');
  const dpVal = document.getElementById('dp-val');
  const irInput = document.getElementById('interest-rate');
  const irVal = document.getElementById('ir-val');
  const tenureInput = document.getElementById('loan-tenure');
  const tenureVal = document.getElementById('tenure-val');

  // Layout Containers
  const carsGrid = document.getElementById('cars-grid');
  const resultsHeader = document.getElementById('results-count');
  
  // Selection & Compare Elements
  const viewCompareBtn = document.getElementById('view-compare-btn');
  const compareCountSpan = document.getElementById('compare-count');
  const compareBar = document.getElementById('compare-bar');
  const openSpecModalBtn = document.getElementById('open-spec-modal-btn');
  const specModal = document.getElementById('spec-modal');
  const modalBody = document.getElementById('modal-body');
  const closeModalBtn = document.getElementById('close-modal-btn');

  // Gallery Modal Elements
  const galleryModal = document.getElementById('gallery-modal');
  const galleryTitle = document.getElementById('gallery-title');
  const galleryActiveImg = document.getElementById('gallery-active-img');
  const galleryThumbs = document.getElementById('gallery-thumbs');
  const closeGalleryBtn = document.getElementById('close-gallery-btn');

  // Floating AI Drawer Elements
  const aiFab = document.getElementById('ai-fab');
  const aiDrawer = document.getElementById('ai-drawer');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatHistory = document.getElementById('chat-history');

  let currentCarsData = [];
  let selectedCarsToCompare = new Set();
  let selectedFuelType = 'ALL';

  // Event Listeners for Filters
  horsepowerInput.addEventListener('input', (e) => {
    hpVal.textContent = `${e.target.value} HP`;
  });

  budgetInput.addEventListener('input', (e) => {
    budgetVal.textContent = `₹${e.target.value} Lakh`;
  });

  // EMI slider updates
  dpInput.addEventListener('input', (e) => {
    dpVal.textContent = `${e.target.value}%`;
    recalculateAllEmis();
  });

  irInput.addEventListener('input', (e) => {
    irVal.textContent = `${e.target.value}%`;
    recalculateAllEmis();
  });

  tenureInput.addEventListener('input', (e) => {
    tenureVal.textContent = `${e.target.value} Years`;
    recalculateAllEmis();
  });

  // Fuel Pills event listener
  const fuelPills = document.querySelectorAll('.fuel-pill');
  fuelPills.forEach(pill => {
    pill.addEventListener('click', () => {
      fuelPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedFuelType = pill.dataset.fuel;
      renderCars(currentCarsData);
    });
  });

  brandFilter.addEventListener('change', () => {
    renderCars(currentCarsData);
  });

  citySelect.addEventListener('change', () => {
    renderCars(currentCarsData);
  });

  // Calculate Monthly EMI
  function calculateMonthlyEmi(price, dpPercent, interestRate, tenureYears) {
    const downPayment = (price * dpPercent) / 100;
    const loanAmount = price - downPayment;
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = tenureYears * 12;

    const emi = Math.round(
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );

    return `₹${emi.toLocaleString('en-IN')}/mo`;
  }

  // Calculate City On-Road Price estimate
  function calculateOnRoadPrice(price, fuelType, cityName) {
    let rtoPercent = 11;
    const cLower = cityName.toLowerCase();
    if (fuelType === 'Electric') rtoPercent = 2;
    else if (cLower.includes('bangalore')) rtoPercent = 14;
    else if (cLower.includes('mumbai') || cLower.includes('pune')) rtoPercent = 12;
    else if (cLower.includes('delhi')) rtoPercent = 9;

    const rto = (price * rtoPercent) / 100;
    const insurance = price * 0.035;
    const reg = 2500;
    const total = Math.round(price + rto + insurance + reg);

    if (total >= 10000000) return `₹${(total / 10000000).toFixed(2)} Cr On-Road`;
    return `₹${(total / 100000).toFixed(1)} Lakh On-Road (${cityName})`;
  }

  function recalculateAllEmis() {
    const dp = Number(dpInput.value);
    const ir = Number(irInput.value);
    const tenure = Number(tenureInput.value);

    document.querySelectorAll('.car-card').forEach(card => {
      const price = Number(card.dataset.price);
      const emiElem = card.querySelector('.card-emi-badge');
      if (price && emiElem) {
        emiElem.textContent = calculateMonthlyEmi(price, dp, ir, tenure);
      }
    });
  }

  // Fetch cars from backend
  async function fetchCars(params = {}) {
    carsGrid.innerHTML = '<div class="spinner"></div><p style="color:#94a3b8; text-align:center;">Fetching database...</p>';

    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`/api/compare?${queryParams.toString()}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch comparison data');
      }

      const data = await response.json();
      currentCarsData = data.cars || [];
      renderCars(currentCarsData);
    } catch (err) {
      carsGrid.innerHTML = `<div class="error-msg">${err.message}</div>`;
    }
  }

  // Render car cards
  function renderCars(cars) {
    carsGrid.innerHTML = '';
    
    const selectedBrand = brandFilter.value;
    let filtered = cars;

    if (selectedBrand !== 'ALL') {
      filtered = filtered.filter(c => c.company.toLowerCase() === selectedBrand.toLowerCase());
    }

    if (selectedFuelType !== 'ALL') {
      filtered = filtered.filter(c => c.fuelType.toLowerCase().includes(selectedFuelType.toLowerCase()));
    }

    resultsHeader.textContent = `Found ${filtered.length} matching models`;

    if (filtered.length === 0) {
      carsGrid.innerHTML = '<p class="empty-state">No vehicles matched your filter parameters.</p>';
      return;
    }

    const dp = Number(dpInput.value);
    const ir = Number(irInput.value);
    const tenure = Number(tenureInput.value);
    const cityName = citySelect.value;

    filtered.forEach(car => {
      const emiText = calculateMonthlyEmi(car.price, dp, ir, tenure);
      const onRoadText = calculateOnRoadPrice(car.price, car.fuelType, cityName);
      const isChecked = selectedCarsToCompare.has(car.model);

      const isFiveStar = !car.model.toLowerCase().includes('swift') && !car.model.toLowerCase().includes('alto');
      const starTag = isFiveStar ? '⭐ 5-Star Safety' : '⭐ 3-Star Safety';

      const card = document.createElement('div');
      card.className = 'car-card';
      card.dataset.price = car.price;
      card.dataset.model = car.model;

      card.innerHTML = `
        <div class="card-image-wrapper">
          <img src="${car.image}" alt="${car.company} ${car.model}" onerror="this.src='https://www.auto-data.net/img/no.jpg'">
          <span class="company-badge">${car.company}</span>
          <span class="fuel-badge">${car.fuelType}</span>
          <button class="gallery-btn" data-title="${car.company} ${car.model}" data-img="${car.image}" style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.7); color:#fff; border:none; border-radius:6px; padding:4px 8px; font-size:0.75rem; cursor:pointer;"><i class="bx bx-camera"></i> 360° View</button>
        </div>
        <div class="card-body">
          <h3 class="car-model-title">${car.company} ${car.model}</h3>
          <div class="car-price-row">
            <span class="car-price">${car.formattedPrice} <small style="font-size:0.75rem; color:#94a3b8;">Ex-Showroom</small></span>
            <span class="card-emi-badge">${emiText}</span>
          </div>
          <p class="on-road-tag"><i class="bx bx-map-pin"></i> ${onRoadText}</p>
          <p class="safety-badge-pill" style="font-size:0.75rem; color:#10b981; font-weight:600; margin-top:2px;">${starTag} | 6 Airbags</p>

          <div class="card-specs-grid">
            <div class="spec-item">
              <i class="bx bx-tachometer"></i>
              <span>${car.horsepower} HP</span>
            </div>
            <div class="spec-item">
              <i class="bx bx-gas-pump"></i>
              <span>${car.mileage || '16.5 km/l'}</span>
            </div>
          </div>

          <div class="card-actions">
            <label class="compare-checkbox-label">
              <input type="checkbox" class="compare-checkbox" data-model="${car.model}" ${isChecked ? 'checked' : ''}>
              <span>+ Compare</span>
            </label>
          </div>
        </div>
      `;

      carsGrid.appendChild(card);
    });

    attachCompareCheckboxListeners();
    attachGalleryListeners();
  }

  function attachGalleryListeners() {
    document.querySelectorAll('.gallery-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = btn.dataset.title;
        const mainImg = btn.dataset.img;

        galleryTitle.textContent = `📷 ${title} - 360° Photo Gallery`;
        galleryActiveImg.src = mainImg;

        galleryThumbs.innerHTML = `
          <img src="${mainImg}" style="width:60px; height:45px; object-fit:cover; border-radius:6px; cursor:pointer; border:2px solid #3b82f6;" onclick="document.getElementById('gallery-active-img').src='${mainImg}'">
          <img src="https://www.auto-data.net/img/no.jpg" style="width:60px; height:45px; object-fit:cover; border-radius:6px; cursor:pointer;" onclick="document.getElementById('gallery-active-img').src='https://www.auto-data.net/img/no.jpg'">
        `;

        galleryModal.classList.remove('hidden');
      });
    });
  }

  closeGalleryBtn.addEventListener('click', () => galleryModal.classList.add('hidden'));

  function attachCompareCheckboxListeners() {
    document.querySelectorAll('.compare-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const model = e.target.dataset.model;
        if (e.target.checked) {
          if (selectedCarsToCompare.size >= 3) {
            alert('You can compare up to 3 cars at a time.');
            e.target.checked = false;
            return;
          }
          selectedCarsToCompare.add(model);
        } else {
          selectedCarsToCompare.delete(model);
        }
        updateCompareState();
      });
    });
  }

  function updateCompareState() {
    const count = selectedCarsToCompare.size;
    compareCountSpan.textContent = count;

    if (count > 0) {
      viewCompareBtn.disabled = false;
      compareBar.classList.remove('hidden');
    } else {
      viewCompareBtn.disabled = true;
      compareBar.classList.add('hidden');
    }
  }

  // Spec Modal Handlers
  viewCompareBtn.addEventListener('click', openSpecMatrixModal);
  openSpecModalBtn.addEventListener('click', openSpecMatrixModal);
  closeModalBtn.addEventListener('click', () => specModal.classList.add('hidden'));

  async function openSpecMatrixModal() {
    if (selectedCarsToCompare.size === 0) return;
    specModal.classList.remove('hidden');
    modalBody.innerHTML = '<div class="spinner"></div><p style="text-align:center; color:#94a3b8;">Generating Head-to-Head Spec Matrix...</p>';

    try {
      const modelsList = Array.from(selectedCarsToCompare).join(',');
      const res = await fetch(`/api/compare-specs?models=${encodeURIComponent(modelsList)}`);
      const data = await res.json();
      
      const specs = data.specMatrix || [];

      let tableHtml = `
        <table class="spec-matrix-table">
          <thead>
            <tr>
              <th>Specification</th>
              ${specs.map(s => `<th>${s.company} ${s.model}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Ex-Showroom Price</strong></td>
              ${specs.map(s => `<td class="price-cell">${s.formattedPrice}</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Horsepower</strong></td>
              ${specs.map(s => `<td>${s.horsepower} HP</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Mileage / Efficiency</strong></td>
              ${specs.map(s => `<td>${s.mileage}</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Power-to-Weight</strong></td>
              ${specs.map(s => `<td><span class="matrix-badge">${s.powerToWeightRatio}</span></td>`).join('')}
            </tr>
            <tr>
              <td><strong>Fuel Type</strong></td>
              ${specs.map(s => `<td>${s.fuelType}</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Est. Annual Maintenance</strong></td>
              ${specs.map(s => `<td>${s.estimatedAnnualService}</td>`).join('')}
            </tr>
          </tbody>
        </table>
      `;

      modalBody.innerHTML = tableHtml;
    } catch (err) {
      modalBody.innerHTML = `<div class="error-msg">Failed to load spec comparison matrix: ${err.message}</div>`;
    }
  }

  // Floating AI Chat Assistant Drawer
  aiFab.addEventListener('click', () => aiDrawer.classList.toggle('hidden'));
  closeDrawerBtn.addEventListener('click', () => aiDrawer.classList.add('hidden'));

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = chatInput.value.trim();
    if (!prompt) return;

    appendChatMessage('user', prompt);
    chatInput.value = '';

    const thinkingElem = appendChatMessage('bot', 'Thinking & executing MCP tool calls...');

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      thinkingElem.innerHTML = data.reply.replace(/\n/g, '<br>');
    } catch (err) {
      thinkingElem.textContent = `Error: ${err.message}`;
    }
  });

  function appendChatMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `chat-message ${role}`;
    msg.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
    chatHistory.appendChild(msg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return msg.querySelector('p');
  }

  // Form Submit
  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const params = {
      horsepower: horsepowerInput.value,
      budget: Number(budgetInput.value) * 100000,
      sortBy: document.getElementById('sortBy').value,
      sortOrder: document.querySelector('input[name="sortOrder"]:checked').value
    };
    fetchCars(params);
  });

  // Initial Load
  fetchCars({ horsepower: 150, budget: 2000000, sortBy: 'price', sortOrder: 'asc' });
});

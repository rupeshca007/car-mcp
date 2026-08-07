document.addEventListener('DOMContentLoaded', () => {
  const filterForm = document.getElementById('filter-form');
  const hpInput = document.getElementById('horsepower');
  const hpVal = document.getElementById('hp-val');
  const budgetInput = document.getElementById('budget');
  const budgetVal = document.getElementById('budget-val');
  const brandFilter = document.getElementById('brand-filter');
  const fuelPills = document.querySelectorAll('.fuel-pill');
  
  // EMI sliders
  const dpInput = document.getElementById('down-payment');
  const dpVal = document.getElementById('dp-val');
  const irInput = document.getElementById('interest-rate');
  const irVal = document.getElementById('ir-val');
  const tenureInput = document.getElementById('tenure-years');
  const tenureVal = document.getElementById('tenure-val');

  // Containers & Elements
  const carsGrid = document.getElementById('cars-grid');
  const loading = document.getElementById('loading');
  const errorBox = document.getElementById('error-box');
  const errorText = document.getElementById('error-text');
  const emptyState = document.getElementById('empty-state');
  const resultCount = document.getElementById('result-count');

  // Compare Bar & Modal
  const compareBar = document.getElementById('compare-bar');
  const compareCount = document.getElementById('compare-count');
  const clearCompareBtn = document.getElementById('clear-compare-btn');
  const openCompareModalBtn = document.getElementById('open-compare-modal-btn');
  const compareModal = document.getElementById('compare-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalMatrixContainer = document.getElementById('modal-matrix-container');

  // AI Chat FAB & Drawer
  const aiChatFab = document.getElementById('ai-chat-fab');
  const aiChatDrawer = document.getElementById('ai-chat-drawer');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const promptChips = document.querySelectorAll('.prompt-chip');

  let currentCarsData = [];
  let selectedFuelType = 'ALL';
  let selectedCarsToCompare = new Set();

  // Helper to calculate EMI
  function calculateMonthlyEmi(price, dpPercent, interestRate, tenureYears) {
    const downPayment = (price * dpPercent) / 100;
    const loanAmount = price - downPayment;
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = tenureYears * 12;

    const emi = Math.round(
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
    return emi > 0 ? `₹${emi.toLocaleString('en-IN')}/mo` : 'N/A';
  }

  // Update slider badge values
  hpInput.addEventListener('input', () => hpVal.textContent = `${hpInput.value} HP`);
  budgetInput.addEventListener('input', () => budgetVal.textContent = `₹${budgetInput.value} Lakh`);
  dpInput.addEventListener('input', () => {
    dpVal.textContent = `${dpInput.value}%`;
    recalculateAllEmis();
  });
  irInput.addEventListener('input', () => {
    irVal.textContent = `${irInput.value}%`;
    recalculateAllEmis();
  });
  tenureInput.addEventListener('input', () => {
    tenureVal.textContent = `${tenureInput.value} Yrs`;
    recalculateAllEmis();
  });

  // Fuel Pills event listener
  fuelPills.forEach(pill => {
    pill.addEventListener('click', () => {
      fuelPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedFuelType = pill.dataset.fuel;
      renderCars(currentCarsData);
    });
  });

  // Brand Filter listener
  brandFilter.addEventListener('change', () => {
    renderCars(currentCarsData);
  });

  // Recalculate EMIs on cards live
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
    loading.classList.remove('hidden');
    errorBox.classList.add('hidden');
    emptyState.classList.add('hidden');
    carsGrid.innerHTML = '';

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
      errorText.textContent = err.message;
      errorBox.classList.remove('hidden');
    } finally {
      loading.classList.add('hidden');
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

    resultCount.textContent = `Found ${filtered.length} matching models`;

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    const dp = Number(dpInput.value);
    const ir = Number(irInput.value);
    const tenure = Number(tenureInput.value);

    filtered.forEach(car => {
      const emiText = calculateMonthlyEmi(car.price, dp, ir, tenure);
      const isChecked = selectedCarsToCompare.has(car.model);

      const card = document.createElement('div');
      card.className = 'car-card';
      card.dataset.price = car.price;
      card.dataset.model = car.model;

      card.innerHTML = `
        <div class="card-image-wrapper">
          <img src="${car.image}" alt="${car.company} ${car.model}" onerror="this.src='https://www.auto-data.net/img/no.jpg'">
          <span class="company-badge">${car.company}</span>
          <span class="fuel-badge">${car.fuelType}</span>
        </div>
        <div class="card-body">
          <h3 class="car-model-title">${car.company} ${car.model}</h3>
          <div class="car-price-row">
            <span class="car-price">${car.formattedPrice}</span>
            <span class="card-emi-badge">${emiText}</span>
          </div>
          <div class="specs-grid">
            <div class="spec-item"><i class="bx bx-tachometer"></i> <span>Power: <span class="val">${car.horsepower} HP</span></span></div>
            <div class="spec-item"><i class="bx bx-gas-pump"></i> <span>Mileage: <span class="val">${car.mileage}</span></span></div>
          </div>
          <div class="card-footer">
            <label class="compare-checkbox-label">
              <input type="checkbox" class="compare-checkbox" data-model="${car.model}" ${isChecked ? 'checked' : ''}>
              <span>+ Compare</span>
            </label>
          </div>
        </div>
      `;

      carsGrid.appendChild(card);
    });

    // Attach checkbox listeners
    document.querySelectorAll('.compare-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
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
        updateCompareBar();
      });
    });
  }

  // Update Floating Compare Bar
  function updateCompareBar() {
    compareCount.textContent = selectedCarsToCompare.size;
    if (selectedCarsToCompare.size > 0) {
      compareBar.classList.remove('hidden');
    } else {
      compareBar.classList.add('hidden');
    }
  }

  clearCompareBtn.addEventListener('click', () => {
    selectedCarsToCompare.clear();
    updateCompareBar();
    document.querySelectorAll('.compare-checkbox').forEach(c => c.checked = false);
  });

  // Open Side-by-Side Comparison Modal
  openCompareModalBtn.addEventListener('click', async () => {
    if (selectedCarsToCompare.size === 0) return;

    modalMatrixContainer.innerHTML = '<div class="spinner"></div><p style="text-align:center">Loading spec matrix...</p>';
    compareModal.classList.remove('hidden');

    try {
      const models = Array.from(selectedCarsToCompare).join(',');
      const res = await fetch(`/api/compare-specs?models=${encodeURIComponent(models)}`);
      const data = await res.json();

      renderComparisonMatrix(data.specMatrix || []);
    } catch (err) {
      modalMatrixContainer.innerHTML = `<p style="color:red">Failed to load comparison matrix: ${err.message}</p>`;
    }
  });

  closeModalBtn.addEventListener('click', () => compareModal.classList.add('hidden'));

  // Render Comparison Matrix with Green Badges
  function renderComparisonMatrix(cars) {
    if (cars.length === 0) {
      modalMatrixContainer.innerHTML = '<p>No spec details available for selected cars.</p>';
      return;
    }

    const minPrice = Math.min(...cars.map(c => c.price));
    const maxHp = Math.max(...cars.map(c => c.horsepower));

    let html = `
      <table class="matrix-table">
        <thead>
          <tr>
            <th>Specification</th>
            ${cars.map(c => `<th>${c.company} ${c.model}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Showroom Price</strong></td>
            ${cars.map(c => `<td><strong>${c.formattedPrice}</strong> ${c.price === minPrice ? '<span class="best-badge">Best Price</span>' : ''}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Horsepower</strong></td>
            ${cars.map(c => `<td>${c.horsepower} HP ${c.horsepower === maxHp ? '<span class="best-badge">Highest HP</span>' : ''}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Mileage</strong></td>
            ${cars.map(c => `<td>${c.mileage}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Fuel Type</strong></td>
            ${cars.map(c => `<td>${c.fuelType}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Power-to-Weight</strong></td>
            ${cars.map(c => `<td>${c.powerToWeightRatio || 'N/A'}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Est. Annual Service</strong></td>
            ${cars.map(c => `<td>${c.estimatedAnnualService || 'N/A'}</td>`).join('')}
          </tr>
        </tbody>
      </table>
    `;

    modalMatrixContainer.innerHTML = html;
  }

  // AI Chat FAB & Drawer Handlers
  aiChatFab.addEventListener('click', () => aiChatDrawer.classList.toggle('hidden'));
  closeDrawerBtn.addEventListener('click', () => aiChatDrawer.classList.add('hidden'));

  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chatInput.value = chip.dataset.prompt;
      sendChatMessage(chip.dataset.prompt);
    });
  });

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const prompt = chatInput.value.trim();
    if (!prompt) return;
    sendChatMessage(prompt);
  });

  async function sendChatMessage(prompt) {
    appendMessage('user', prompt);
    chatInput.value = '';

    const loadingMsg = appendMessage('bot', 'AI Thinking...');

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      loadingMsg.remove();
      appendMessage('bot', data.reply || 'No response returned');
    } catch (err) {
      loadingMsg.remove();
      appendMessage('bot', `Error: ${err.message}`);
    }
  }

  function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role === 'user' ? 'user-msg' : 'bot-msg'}`;
    msgDiv.innerHTML = `<i class="bx ${role === 'user' ? 'bxs-user' : 'bxs-bot'}"></i> <div>${text.replace(/\n/g, '<br>')}</div>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
  }

  // Initial Form Submit & Load
  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const sortOrder = document.querySelector('input[name="sortOrder"]:checked').value;
    fetchCars({
      horsepower: hpInput.value,
      budget: Number(budgetInput.value) * 100000,
      sortBy: document.getElementById('sortBy').value,
      sortOrder: sortOrder
    });
  });

  // Initial Load
  fetchCars({
    horsepower: hpInput.value,
    budget: Number(budgetInput.value) * 100000,
    sortBy: 'price',
    sortOrder: 'asc'
  });
});

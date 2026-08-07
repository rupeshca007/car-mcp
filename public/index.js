document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const filterForm = document.getElementById('filter-form');
  
  const hpSlider = document.getElementById('horsepower');
  const hpBadge = document.getElementById('hp-val');
  
  const budgetSlider = document.getElementById('budget');
  const budgetBadge = document.getElementById('budget-val');
  
  const sortBySelect = document.getElementById('sortBy');
  const resultCount = document.getElementById('result-count');
  
  const carsGrid = document.getElementById('cars-grid');
  const loadingElement = document.getElementById('loading');
  const errorBox = document.getElementById('error-box');
  const errorText = document.getElementById('error-text');
  const emptyState = document.getElementById('empty-state');

  // Update Horsepower Badge in real time
  hpSlider.addEventListener('input', () => {
    hpBadge.textContent = `${hpSlider.value} HP`;
  });

  // Update Budget Badge in real time
  budgetSlider.addEventListener('input', () => {
    budgetBadge.textContent = `₹${budgetSlider.value} Lakh`;
  });

  // Fetch cars data from the dashboard backend
  async function fetchCompareCars() {
    // Show loading, hide grids and states
    loadingElement.classList.remove('hidden');
    carsGrid.classList.add('hidden');
    errorBox.classList.add('hidden');
    emptyState.classList.add('hidden');
    resultCount.textContent = 'Querying MCP server...';
    carsGrid.innerHTML = '';

    const hpValue = hpSlider.value;
    // Convert Lakhs (e.g. 20) to full digits (e.g. 2000000) for the MCP query
    const budgetValue = Number(budgetSlider.value) * 100000;
    const sortBy = sortBySelect.value;
    
    const sortOrderElement = document.querySelector('input[name="sortOrder"]:checked');
    const sortOrder = sortOrderElement ? sortOrderElement.value : 'asc';

    const url = `/api/compare?horsepower=${hpValue}&budget=${budgetValue}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      loadingElement.classList.add('hidden');

      if (!response.ok) {
        throw new Error(data.error || 'Server returned an error');
      }

      const cars = data.cars || [];
      renderCars(cars);
    } catch (error) {
      console.error('Fetch error:', error);
      loadingElement.classList.add('hidden');
      errorText.textContent = error.message;
      errorBox.classList.remove('hidden');
      resultCount.textContent = 'Query failed';
    }
  }

  // Helper to check if image is a valid URL and not the "no.jpg" fallback
  function isPlaceholderImage(imgUrl) {
    if (!imgUrl) return true;
    return imgUrl.includes('no.jpg') || imgUrl.includes('placeholder') || imgUrl === '';
  }

  // Render car cards in the grid
  function renderCars(cars) {
    resultCount.textContent = `Found ${cars.length} matching models`;

    if (cars.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    carsGrid.classList.remove('hidden');

    cars.forEach(car => {
      const card = document.createElement('div');
      card.className = 'car-card';

      // Setup Image HTML
      let imageHtml = '';
      if (isPlaceholderImage(car.image)) {
        imageHtml = `
          <div class="placeholder-image">
            <i class="bx bx-image-alt"></i>
            <span>No Image Available</span>
          </div>
        `;
      } else {
        imageHtml = `
          <img class="car-image" src="${car.image}" alt="${car.model}" onerror="this.outerHTML='<div class=\"placeholder-image\"><i class=\"bx bx-image-alt\"></i><span>No Image Available</span></div>'">
        `;
      }

      card.innerHTML = `
        <div class="image-container">
          ${imageHtml}
          <div class="brand-badge">${car.company}</div>
        </div>
        <div class="car-details-panel">
          <div class="car-title-row">
            <h3>${car.model}</h3>
            <span class="price-tag">${car.formattedPrice}</span>
          </div>
          <div class="car-specs">
            <span class="spec-item"><i class="bx bx-bolt-circle"></i> ${car.horsepower} HP</span>
            <span class="spec-item"><i class="bx bxs-gas-pump"></i> ${car.fuelType}</span>
            <span class="spec-item"><i class="bx bx-tachometer"></i> ${car.mileage}</span>
          </div>
          <p class="car-description">${car.details || 'No additional technical specifications listed.'}</p>
        </div>
      `;
      
      carsGrid.appendChild(card);
    });
  }

  // Form Submit Handler
  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    fetchCompareCars();
  });

  // Initial Load
  fetchCompareCars();
});

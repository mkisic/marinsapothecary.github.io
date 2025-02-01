async function fetchMenuData() {
  console.log('Starting to fetch menu data...');

  const corsProxy = 'https://corsproxy.io/?';
  const targetUrl = encodeURIComponent('https://my.barassistant.app/api/v1/bars/mkisic/menu');
  const proxyUrl = `${corsProxy}${targetUrl}`;

  try {
    console.log('Fetching menu data from API...');
    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received data:', data);

    // Transform API data into our expected format
    const menuData = transformApiData(data);
    return menuData;

  } catch (error) {
    console.error('Error fetching menu:', error);
    return null;
  }
}

function transformApiData(apiData) {
  // Group cocktails by category
  const categoriesMap = new Map();

  apiData.cocktails.forEach(cocktail => {
    const categoryName = cocktail.category || 'Uncategorized';
    if (!categoriesMap.has(categoryName)) {
      categoriesMap.set(categoryName, []);
    }

    const ingredients = cocktail.ingredients
      .map(ing => ing.ingredient.name)
      .join(', ');

    categoriesMap.get(categoryName).push({
      name: cocktail.name,
      ingredients: ingredients,
      image: cocktail.image || 'placeholder.jpg'
    });
  });

  // Convert map to array format
  return Array.from(categoriesMap.entries()).map(([title, cocktails]) => ({
    title,
    cocktails
  }));
}

function renderMenu(menuData) {
  console.log('Starting to render menu...');
  const container = document.getElementById('menu-container');

  // Clear any existing content
  container.innerHTML = '';

  if (!menuData || menuData.length === 0) {
    container.innerHTML = '<div class="error-message">No menu data available</div>';
    return;
  }

  menuData.forEach(category => {
    console.log(`Rendering category: ${category.title}`);
    const categoryElement = document.createElement('section');
    categoryElement.className = 'category';

    categoryElement.innerHTML = `
      <h2 class="category-title">${category.title}</h2>
      <div class="cocktails-grid">
        ${category.cocktails.map(cocktail => `
          <article class="cocktail-card">
            <img class="cocktail-image" src="${cocktail.image}" alt="${cocktail.name}" 
              onerror="this.src='placeholder.jpg'">
            <div class="cocktail-info">
              <h3 class="cocktail-name">${cocktail.name}</h3>
              <p class="cocktail-ingredients">${cocktail.ingredients}</p>
            </div>
          </article>
        `).join('')}
      </div>
    `;

    container.appendChild(categoryElement);
  });

  console.log('Menu rendering complete');
}

// Initialize the menu
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded, initializing menu...');

  // Add initial loading state
  const container = document.getElementById('menu-container');
  container.innerHTML = '<div id="loading-indicator">Loading menu...</div>';

  const menuData = await fetchMenuData();

  if (menuData) {
    console.log('Menu data received, rendering...');
    renderMenu(menuData);
  } else {
    console.error('Failed to load menu data');
    container.innerHTML = '<div class="error-message">Failed to load menu. Please refresh the page to try again.</div>';
  }
}); 
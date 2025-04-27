// ✅ Base API URL
const API_BASE = 'http://localhost:5000/api';

// ✅ Select DOM elements
const categoryList = document.getElementById('categoryList');
const menuContainer = document.getElementById('menuItemsContainer');

const loader = document.getElementById('loader-wrapper');


// ✅ Favorites saved in localStorage
let favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));

// ✅ Dynamically load all categories from backend
async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const categories = await res.json();

    categoryList.innerHTML = ''; // Clear previous content

    // Add 'All' first
    const allLi = document.createElement('li');
    allLi.innerHTML = `<a href="#" class="category-link active" data-category="all">All</a>`;
    categoryList.appendChild(allLi);

    // Add normal categories
    categories.forEach(cat => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#" class="category-link" data-category="${cat.name}">
        <i class="${cat.icon}"></i> ${cat.name}
      </a>`;
      categoryList.appendChild(li);
    });

    // Add 'Favorites' last, but only if there are favorites
    if (favorites.size > 0) {
      const favLi = document.createElement('li');
      favLi.innerHTML = `<a href="#" class="category-link" data-category="Favorites">
        <i class="fa-regular fa-heart"></i> Favorites
      </a>`;
      categoryList.appendChild(favLi);
    }

    initCategoryFilter();
  } catch (err) {
    console.error('Error loading categories:', err);
    categoryList.innerHTML = '<li>Error loading categories</li>';
  }
}


// ✅ Dynamically load all items from backend
async function loadItems() {
  try {
    const res = await fetch(`${API_BASE}/items`);
    const items = await res.json();

    menuContainer.innerHTML = '';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.setAttribute('data-category', item.category.name);

      const isFavorited = favorites.has(item.name);

      card.innerHTML = `
        <div class="image-wrapper">
          <img src="./images/${item.image}" alt="${item.name}" 
               onerror="this.onerror=null; this.src='./images/no-image-icon.png';">
          <button class="favorite-btn ${isFavorited ? 'active' : ''}">
            <i class="fa-${isFavorited ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>
        <div class="details">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <p class="price">${item.price.toLocaleString()} LBP</p>
        </div>
      `;

      menuContainer.appendChild(card);
    });

    initFavorites();
  } catch (err) {
    console.error('Error loading items:', err);
    menuContainer.innerHTML = '<p style="text-align:center">Error loading items</p>';
  }
}

// ✅ Favorite toggle and storage
function initFavorites() {
  document.querySelectorAll('.favorite-btn').forEach(button => {
    button.addEventListener('click', e => {
      e.stopPropagation();
      const card = button.closest(".menu-card");
      const itemId = card.querySelector("h3").textContent;
      const icon = button.querySelector("i");
      const isActive = button.classList.toggle("active");

      icon.classList.toggle("fa-solid", isActive);
      icon.classList.toggle("fa-regular", !isActive);

      if (isActive) {
        favorites.add(itemId);
      } else {
        favorites.delete(itemId);
      }

      localStorage.setItem('favorites', JSON.stringify([...favorites]));

      // Always reload categories to reflect correct Favorites visibility
      loadCategories();
    });
  });
}


// ✅ Category filtering
function initCategoryFilter() {
  const links = document.querySelectorAll('.category-link');

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const selected = link.getAttribute("data-category");

      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const cards = document.querySelectorAll('.menu-card');
      cards.forEach(card => {
        const itemId = card.querySelector("h3").textContent;
        const cardCategory = card.getAttribute("data-category");

        if (selected === "all") {
          card.style.display = "block";
        } else if (selected === "Favorites") {
          card.style.display = favorites.has(itemId) ? "block" : "none";
        } else {
          card.style.display = cardCategory === selected ? "block" : "none";
        }
      });
    });
  });
}

setInterval(async () => {
  loader.classList.remove('hidden'); // Show loader on refresh
  await Promise.all([loadCategories(), loadItems()]);
  loader.classList.add('hidden');
}, 60000); // Refresh every 10s


// ✅ Initial Load
window.onload = async () => {
    try {
      loader.classList.remove('hidden'); // Show loader
      await Promise.all([loadCategories(), loadItems()]);
    } catch (err) {
      console.error('Error on load:', err);
    } finally {
      loader.classList.add('hidden'); // Hide loader
    }
  };
  
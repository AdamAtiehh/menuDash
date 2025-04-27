// This script assumes you already have API endpoints like:
// - GET /api/items
// - GET /api/categories
// - POST /api/items
// - POST /api/categories
// - PUT /api/items/:id
// - PUT /api/categories/:id
// - DELETE /api/items/:id
// - DELETE /api/categories/:id

const API_BASE = '/api';

const itemsTable = document.getElementById('itemsTable');
const categoriesTable = document.getElementById('categoriesTable');
const addNewItemBtn = document.getElementById('addNewItem');
const addNewCategoryBtn = document.getElementById('addNewCategory');

// Load everything on page load
window.onload = async () => {
  await loadItems();
  await loadCategories();
};

async function loadItems() {
  const res = await fetch(`${API_BASE}/items`);
  const data = await res.json();

  itemsTable.innerHTML = data.map(item => `
    <tr>
      <td> <img src="./images/${item.image}" alt="${item.name}" 
               onerror="this.onerror=null; this.src='./images/no-image-icon.png';">
</td>
      <td>${item.name}</td>
      <td>${item.category?.name || 'N/A'}</td>
      <td>${item.price.toLocaleString()} LBP</td>
      <td>${item.description}</td>
      <td>
        <button onclick="editItem('${item._id}')">✏️</button>
        <button onclick="deleteItem('${item._id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

async function loadCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  const data = await res.json();

  categoriesTable.innerHTML = data.map(cat => `
    <tr>
<td><i class="${cat.icon || 'ri-folder-line'}"></i></td>
      <td>${cat.name}</td>
      <td>
        <button onclick="editCategory('${cat._id}')">✏️</button>
        <button onclick="confirmCategoryDelete('${cat._id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

// Event listeners
addNewItemBtn.addEventListener('click', () => {
  document.getElementById('addItemModal').style.display = 'flex';
});

addNewCategoryBtn.addEventListener('click', () => {
  document.getElementById('addCategoryModal').style.display = 'flex';
});

// CRUD Actions
function editItem(id) {
  // Load item data and show edit modal (to be implemented)
  alert(`Show edit modal for item ${id}`);
}

async function deleteItem(id) {
  if (confirm('Are you sure you want to delete this item?')) {
    await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
    loadItems();
  }
}

function editCategory(id) {
  // Load category data and show edit modal (to be implemented)
  alert(`Show edit modal for category ${id}`);
}

async function confirmCategoryDelete(id) {
  const confirmDelete = confirm('⚠️ Deleting this category will also remove all items under it. Continue?');
  if (confirmDelete) {
    await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
    await loadCategories();
    await loadItems(); // reload items in case any were deleted
  }
}
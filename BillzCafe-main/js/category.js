// category.js

let isEditingCategory = false;
let editingCategoryId = null;

const categoryTable = document.getElementById('categoriesTable');
const addNewCategoryBtn = document.getElementById('addNewCategory');

// Create and inject form
const categoryFormContainer = document.createElement('div');
categoryFormContainer.id = 'addCategoryForm';
categoryFormContainer.style = 'margin-top: 40px; display: none; background: #fff; padding: 20px; border-radius: 8px;';
categoryFormContainer.innerHTML = `
  <h3>Add / Edit Category</h3>
  <form id="categoryForm">
    <label for="categoryName">Category Name:</label>
    <input type="text" id="categoryName" name="name" required />

    <label for="categoryIcon">Font Awesome Icon Class:</label>
    <input type="text" id="categoryIcon" name="icon" placeholder="e.g. fa-solid fa-mug-hot" required />

    <div style="margin: 10px 0;">
      <strong>Preview:</strong>
      <i id="iconPreview" class="fa-solid fa-mug-hot" style="font-size: 24px;"></i>
    </div>

    <div style="margin-top: 10px;">
      <button type="submit" id="submitCategoryBtn">Add Category</button>
    </div>
  </form>
`;
document.querySelector('.manage--content').appendChild(categoryFormContainer);

// Update preview
categoryFormContainer.querySelector('#categoryIcon').addEventListener('input', e => {
  document.getElementById('iconPreview').className = e.target.value || 'fa-solid fa-question';
});

addNewCategoryBtn.addEventListener('click', () => {
  document.getElementById('addCategoryForm').scrollIntoView({ behavior: 'smooth' });
  categoryFormContainer.style.display = 'block';
  document.getElementById('categoryForm').reset();
  isEditingCategory = false;
  editingCategoryId = null;
  document.getElementById('submitCategoryBtn').textContent = 'Add Category';
});

async function loadCategories() {
  try {
    const res = await fetch('/api/categories');
    const data = await res.json();
    categoryTable.innerHTML = data.map(cat => `
      <tr>
        <td><i class="${cat.icon}"></i></td>
        <td>${cat.name}</td>
        <td>
          <button onclick="editCategory('${cat._id}')">✏️</button>
          <button onclick="confirmDeleteCategory('${cat._id}')">🗑️</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load categories:', err);
    alert('Failed to load categories');
  }
}

async function editCategory(id) {
  try {
    const res = await fetch(`/api/categories`);
    const allCats = await res.json();
    const cat = allCats.find(c => c._id === id);

    if (!cat) throw new Error('Category not found');

    document.getElementById('categoryName').value = cat.name;
    document.getElementById('categoryIcon').value = cat.icon;
    document.getElementById('iconPreview').className = cat.icon;
    categoryFormContainer.style.display = 'block';
    document.getElementById('submitCategoryBtn').textContent = 'Save Changes';

    isEditingCategory = true;
    editingCategoryId = id;
  } catch (err) {
    console.error('Edit error:', err);
    alert(err.message);
  }
}

async function confirmDeleteCategory(id) {
  if (confirm('⚠️ Deleting this category will also remove all items under it. Continue?')) {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await loadCategories();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }
}

async function submitCategory(e) {
  e.preventDefault();
  const name = document.getElementById('categoryName').value.trim();
  const icon = document.getElementById('categoryIcon').value.trim();

  if (!name || !icon) return alert('Please fill all fields');

  try {
    const method = isEditingCategory ? 'PUT' : 'POST';
    const url = isEditingCategory ? `/api/categories/${editingCategoryId}` : '/api/categories';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, icon })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Operation failed');

    document.getElementById('categoryForm').reset();
    categoryFormContainer.style.display = 'none';
    await loadCategories();
  } catch (err) {
    console.error('Submit error:', err);
    alert(err.message);
  }
}

document.getElementById('categoryForm').addEventListener('submit', submitCategory);

window.addEventListener('DOMContentLoaded', loadCategories);

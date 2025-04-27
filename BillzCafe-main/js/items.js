  let isEditing = false;
  let editingId = null;

  document.getElementById('addNewItem').addEventListener('click', () => {
    document.getElementById('addItemForm').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('addItemForm').style.display = 'block';
    document.getElementById('itemForm').reset();
    isEditing = false;
    editingId = null;
    document.getElementById('submitItemBtn').textContent = 'Add Item';
  });

  async function populateCategoryDropdown() {
    try {
      const res = await fetch('/api/categories');
      const categories = await res.json();
      const select = document.getElementById('itemCategory');
      select.innerHTML = categories.map(cat => `<option value="${cat._id}">${cat.name}</option>`).join('');
    } catch (err) {
      console.error('Error loading categories:', err);
      alert('Failed to load categories');
    }
  }

  async function loadItems() {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      const tbody = document.getElementById('itemsTable');
      tbody.innerHTML = data.map(item => `
        <tr>
          <td><img src="/images/${item.image}" alt="${item.name}" width="50" onerror="this.onerror=null;this.src='/images/no-image-icon.png';"></td>
          <td>${item.name}</td>
          <td>${item.category?.name || 'N/A'}</td>
          <td>${item.price.toLocaleString()} LBP</td>
          <td>${item.description}</td>
          <td>
            <button onclick="editItem('${item._id}')">✏️</button>
            <button onclick="confirmDeleteItem('${item._id}')">🗑️</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('Error loading items:', err);
      alert('Failed to load items');
    }
  }

  async function addOrUpdateItem(event) {
    event.preventDefault();

    const form = document.getElementById('itemForm');
    const formData = new FormData(form);

    const url = isEditing ? `/api/items/${editingId}` : '/api/items';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        body: formData
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to process item');

      form.reset();
      isEditing = false;
      editingId = null;
      document.getElementById('submitItemBtn').textContent = 'Add Item';
      await loadItems();
    } catch (err) {
      console.error('Error submitting item:', err);
      alert(err.message);
    }
  }

  async function confirmDeleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const res = await fetch(`/api/items/${id}`, {
          method: 'DELETE'
        });

        const result = await res.json();

        if (!res.ok) throw new Error(result.error || 'Failed to delete item');

        await loadItems();
      } catch (err) {
        console.error('Delete error:', err);
        alert(err.message);
      }
    }
  }

  async function editItem(id) {
    try {
      const res = await fetch(`/api/items/${id}`);
      const item = await res.json();

      if (!res.ok) throw new Error(item.error || 'Failed to fetch item');

      document.getElementById('itemName').value = item.name;
      document.getElementById('itemPrice').value = item.price;
      document.getElementById('itemDescription').value = item.description;
      document.getElementById('itemCategory').value = item.category._id;
      document.getElementById('addItemForm').style.display = 'block';
      document.getElementById('addItemForm').scrollIntoView({ behavior: 'smooth' });

      isEditing = true;
      editingId = id;
      document.getElementById('submitItemBtn').textContent = 'Save Changes';
    } catch (err) {
      console.error('Error editing item:', err);
      alert(err.message);
    }
  }

  document.getElementById('itemForm').addEventListener('submit', addOrUpdateItem);

  window.addEventListener('DOMContentLoaded', async () => {
    await populateCategoryDropdown();
    await loadItems();
  });


// Frontend Script
// settings.js

window.addEventListener('DOMContentLoaded', async () => {
    await loadAdmins();
  });
  
  // Load admins into UI
  async function loadAdmins() {
    try {
      const res = await fetch('/api/admins');
      const admins = await res.json();
  
      const list = document.getElementById('accountsList');
      const dropdown = document.getElementById('account-password');
  
      list.innerHTML = admins.map(admin => `
   <p style="color: white;">
  <i class="fa-solid fa-circle-user" style="color: #5629db;"></i>
  <label style="color: #5629db; margin-left: 6px;">${admin.username}</label>
  <i class="fa-solid fa-trash" style="cursor: pointer; color: red; margin-left: 10px;" onclick="deleteAdmin('${admin.username}')"></i>
</p>


      `).join('');
  
      dropdown.innerHTML = admins.map(admin => `<option value="${admin.username}">${admin.username}</option>`).join('');
    } catch (err) {
      console.error('Failed to load admins:', err);
    }
  }
  
  async function deleteAdmin(username) {
    if (!confirm(`Are you sure you want to delete '${username}'?`)) return;
  
    try {
      const res = await fetch(`/api/admins/${username}`, {
        method: 'DELETE'
      });
  
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
  
      alert('Admin deleted');
      loadAdmins();
    } catch (err) {
      alert(err.message);
    }
  }
  
  // Handle add account form
  const addAccountForm = document.getElementById('addAccountForm');
  addAccountForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('new-username').value.trim();
    const password = document.getElementById('new-account-password').value;
  
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      alert('Admin added');
      loadAdmins();
      addAccountForm.reset();
      closeModal('addAccountModal');
    } catch (err) {
      alert(err.message);
    }
  });
  
  // Handle password change
  const passwordForm = document.getElementById('passwordForm');
  passwordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const username = document.getElementById('account-password').value;
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
  
    try {
      const res = await fetch('/api/admins/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, currentPassword, newPassword })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      alert('Password updated');
      passwordForm.reset();
    } catch (err) {
      alert(err.message);
    }
  });
  
  function openAddAccountModal() {
    document.getElementById('addAccountModal').style.display = 'block';
  }
  
  function closeModal(id) {
    document.getElementById(id).style.display = 'none';
  }
  
// Function to toggle the theme between light and dark
function toggleTheme() {
    document.body.classList.toggle('dark--mode');
    const isDarkMode = document.body.classList.contains('dark--mode');
    // Save the theme preference in local storage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Event listener for theme toggle button
const themeToggleButton = document.querySelector('.dark--theme--btn');
if (themeToggleButton) {
    themeToggleButton.addEventListener('click', toggleTheme);
}

// Apply the saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark--mode');
    } else {
        document.body.classList.remove('dark--mode');
    }
});

let menu = document.querySelector(".menu");
let sidebar = document.querySelector(".sidebar");
let mainContainer = document.querySelector(".main--container");

if (menu && sidebar && mainContainer) {
    menu.onclick = function() {
        sidebar.classList.toggle("activemenu");
    }

    mainContainer.onclick = function() {
        sidebar.classList.remove("activemenu");
    }
}

// Initialize local storage data if not already present
if (!localStorage.getItem('accounts')) {
    localStorage.setItem('accounts', JSON.stringify([
        { id: 1, username: 'admin', password: 'admin' }
    ]));
}

if (!localStorage.getItem('items')) {
    localStorage.setItem('items', JSON.stringify([]));
}

if (!localStorage.getItem('categories')) {
    localStorage.setItem('categories', JSON.stringify([]));
}

// Helper functions to interact with local storage
function getAccounts() {
    return JSON.parse(localStorage.getItem('accounts')) || [];
}

function saveAccounts(accounts) {
    localStorage.setItem('accounts', JSON.stringify(accounts));
}

function getItems() {
    return JSON.parse(localStorage.getItem('items')) || [];
}

function saveItems(items) {
    localStorage.setItem('items', JSON.stringify(items));
    updateCounts();
}

function getCategories() {
    return JSON.parse(localStorage.getItem('categories')) || [];
}

function saveCategories(categories) {
    localStorage.setItem('categories', JSON.stringify(categories));
    updateCounts();
}

function updateCounts() {
    const itemsCount = getItems().length;
    const categoriesCount = getCategories().length;
    localStorage.setItem('itemCount', itemsCount);
    localStorage.setItem('categoryCount', categoriesCount);

    // Update counts on the index page if present
    const itemsCardValue = document.querySelector('.card-2 .card--value');
    const categoriesCardValue = document.querySelector('.card-3 .card--value');
    
    if (itemsCardValue) {
        itemsCardValue.textContent = `${itemsCount} Items`;
    }

    if (categoriesCardValue) {
        categoriesCardValue.textContent = `${categoriesCount} Categories`;
    }
}

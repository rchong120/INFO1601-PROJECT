class DishCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    set dish(dish) {
        this.shadowRoot.innerHTML = `
            <style>
                .dish-card {
                    position: relative;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
                    background: white;
                    display: flex;
                    flex-direction: column;
                    cursor: pointer;
                }
                .dish-card img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                }
                .dish-card-content {
                    padding: 1rem;
                    flex-grow: 1;
                }
                 .dish-card-content h2 {
                    margin: 0 0 1rem 0;
                    font-size: 1.5rem;
                }
                .favorite-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    font-size: 2rem;
                    color: #ccc;
                    cursor: pointer;
                    text-shadow: 0 0 5px black;
                }
                .favorite-btn.favorited {
                    color: #ffc107;
                }
            </style>
            <div class="dish-card">
                <img src="${dish.strMealThumb}" alt="${dish.strMeal}">
                <div class="dish-card-content">
                    <h2>${dish.strMeal}</h2>
                </div>
                <button class="favorite-btn">&star;</button>
            </div>
        `;

        this.shadowRoot.querySelector('.dish-card').addEventListener('click', () => {
            window.location.href = `dish.html?id=${dish.idMeal}`;
        });

        const favoriteBtn = this.shadowRoot.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click event
            if (isLoggedIn()) {
                toggleFavorite(dish.idMeal);
                favoriteBtn.classList.toggle('favorited');
            } else {
                alert('Please login to favorite a dish.');
            }
        });
    }
}
customElements.define('dish-card', DishCard);

const dishContainer = document.getElementById('dish-container');

async function getRandomDishes() {
    dishContainer.innerHTML = '';
    const promises = [];
    for (let i = 0; i < 6; i++) {
        promises.push(fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(res => res.json()));
    }
    const results = await Promise.all(promises);
    const dishes = results.map(result => result.meals[0]);
    const uniqueDishes = Array.from(new Set(dishes.map(d => d.idMeal))).map(id => dishes.find(d => d.idMeal === id));

    uniqueDishes.forEach(dish => {
        const dishCard = document.createElement('dish-card');
        dishCard.dish = dish;
        dishContainer.appendChild(dishCard);
    });
}

async function getFavoriteDishes() {
    dishContainer.innerHTML = '';
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser && currentUser.favorites.length > 0) {
        const promises = currentUser.favorites.map(favId => fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${favId}`).then(res => res.json()));
        const results = await Promise.all(promises);
        const dishes = results.map(result => result.meals[0]);
        dishes.forEach(dish => {
            const dishCard = document.createElement('dish-card');
            dishCard.dish = dish;
            dishContainer.appendChild(dishCard);
        });
    } else {
        dishContainer.innerHTML = "<p>You haven't favorited any dishes yet.</p>";
    }
}

// Modal handling
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const randomiseBtn = document.getElementById('randomise-btn');
const favoritesBtn = document.getElementById('favorites-btn');
const closeBtns = document.querySelectorAll('.close-btn');

loginBtn.onclick = () => loginModal.style.display = 'block';
signupBtn.onclick = () => signupModal.style.display = 'block';
randomiseBtn.onclick = getRandomDishes;
favoritesBtn.onclick = getFavoriteDishes;

closeBtns.forEach(btn => btn.onclick = () => {
    loginModal.style.display = 'none';
    signupModal.style.display = 'none';
});
window.onclick = (event) => {
    if (event.target == loginModal || event.target == signupModal) {
        loginModal.style.display = 'none';
        signupModal.style.display = 'none';
    }
};

// User Auth
const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.username === username)) {
        alert('Username already exists');
    } else {
        users.push({ username, password, favorites: [] });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Signup successful! Please login.');
        signupModal.style.display = 'none';
    }
});

const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        alert('Login successful!');
        loginModal.style.display = 'none';
        updateNav();
        getRandomDishes(); 
    } else {
        alert('Invalid credentials');
    }
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('currentUser');
    updateNav();
    getRandomDishes();
});

function isLoggedIn() {
    return sessionStorage.getItem('currentUser') !== null;
}

function updateNav() {
    const favoritesBtn = document.getElementById('favorites-btn');
    if (isLoggedIn()) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        favoritesBtn.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        signupBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        favoritesBtn.style.display = 'none';
    }
}

function toggleFavorite(dishId) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    const user = users[userIndex];

    const favoriteIndex = user.favorites.indexOf(dishId);
    if (favoriteIndex > -1) {
        user.favorites.splice(favoriteIndex, 1);
    } else {
        user.favorites.push(dishId);
    }

    users[userIndex] = user;
    localStorage.setItem('users', JSON.stringify(users));
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}


document.addEventListener('DOMContentLoaded', () => {
    updateNav();
    getRandomDishes();
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}
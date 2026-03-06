/* =========================
   1. GLOBAL STATE
========================= */
let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentCategory = "all";
let searchQuery = "";

/* =========================
   2. API FUNCTIONS
========================= */
const API_BASE = '/api';

async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE}/products?category=${currentCategory}&search=${searchQuery}`);
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

/* =========================
   3. RENDER PRODUCTS
========================= */
function renderProducts() {
    const grid = document.getElementById("productGrid") || document.getElementById("catalog-grid");
    if (!grid) return;

    grid.innerHTML = "";

    if (!products.length) {
        grid.innerHTML = `<p style="text-align:center; grid-column:1/-1;">Ապրանք չի գտնվել</p>`;
        return;
    }

    products.forEach(p => {
        grid.innerHTML += `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}">
                <h4>${p.name}</h4>
                <p>${Number(p.price).toLocaleString()} ֏</p>
                <button class="add-btn" onclick="addToCart('${p._id}')">Ավելացնել</button>
            </div>
        `;
    });
}

/* =========================
   4. CART LOGIC
========================= */
window.addToCart = function(id) {
    const product = products.find(p => p._id === id);
    if (!product) return;

    const item = cart.find(i => i.id === id);
    item ? item.quantity++ : cart.push({ ...product, quantity: 1, id: id });

    updateCart();
};

function updateCart() {
    localStorage.setItem("cart", JSON.stringify(cart));

    const countEl = document.getElementById("cartCount") || document.getElementById("cart-count");
    if (countEl) countEl.innerText = cart.reduce((s, i) => s + i.quantity, 0);

    renderCart();
}

function renderCart() {
    const box = document.getElementById("cartItems") || document.getElementById("cart-items-list");
    const totalBox = document.getElementById("totalPrice") || document.getElementById("total-amount");
    if (!box) return;

    let total = 0;
    box.innerHTML = "";

    cart.forEach((i, idx) => {
        total += i.price * i.quantity;
        box.innerHTML += `
            <div class="cart-item">
                <img src="${i.image}">
                <div>
                    <h4>${i.name}</h4>
                    <small>${i.quantity} x ${i.price.toLocaleString()} ֏</small>
                </div>
                <i class="fas fa-trash" onclick="removeItem(${idx})"></i>
            </div>
        `;
    });

    if (totalBox) totalBox.innerText = total.toLocaleString();
}

window.removeItem = function(index) {
    cart.splice(index, 1);
    updateCart();
};

/* =========================
   5. CHECKOUT TO WHATSAPP
========================= */
window.checkout = async function() {
    if (!cart.length) return alert("Զամբյուղը դատարկ է");

    const phone = prompt("Մուտքագրեք Ձեր հեռախոսահամարը") || "Անհայտ";
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    // WhatsApp ուղարկել ադմինին
    const adminPhone = "37491234567"; // <-- դնի ադմինի իրական համարը
    let msg = `🛒 Նոր Պատվեր iClone.evn%0A📞 Հեռախոս: ${phone}%0A%0A`;
    cart.forEach(i => msg += `• ${i.name} (${i.quantity})%0A`);
    msg += `%0A💰 Գումար: ${total.toLocaleString()} ֏`;

    window.open(`https://wa.me/${adminPhone}?text=${msg}`, "_blank");

    cart = [];
    updateCart();
    closeCart();
};

/* =========================
   6. FILTER & SEARCH
========================= */
window.filterByCategory = async (cat) => {
    currentCategory = cat;
    await fetchProducts();
};

const searchInput = document.getElementById("catalog-search");
if (searchInput) {
    searchInput.addEventListener("input", async e => {
        searchQuery = e.target.value;
        await fetchProducts();
    });
}

/* =========================
   7. UI HELPERS
========================= */
window.openCart = () => {
    const modal = document.getElementById("cartModal") || document.getElementById("cart-modal");
    if (modal) modal.style.display = "block";
};

window.closeCart = () => {
    const modal = document.getElementById("cartModal") || document.getElementById("cart-modal");
    if (modal) modal.style.display = "none";
};

window.toggleMenu = () => {
    const menu = document.getElementById("navMenu") || document.getElementById("nav-menu");
    menu.classList.toggle("active");
};

/* =========================
   8. REVIEWS CAROUSEL
========================= */
const reviewsCarousel = document.getElementById('reviewsCarousel');

if (reviewsCarousel) {
    const reviewsData = [
        {
            text: "Շատ բարի սպասարկում և արագ առաքում։",
            author: "Անահիտ Մ.",
            stars: 4.5
        },
        {
            text: "Ապրանքները հիանալի որակի են, և շատ հեշտ է պատվիրել։",
            author: "Վահե Ք.",
            stars: 4
        },
        {
            text: "Հաճելի գնային քաղաքականություն և գերազանց սպասարկում։",
            author: "Մարիամ Հ.",
            stars: 4.5
        },
        {
            text: "Արագ առաքում և որակյալ ապրանք։",
            author: "Արամ Գ.",
            stars: 5
        },
        {
            text: "Շատ գոհ եմ գնված ապրանքից։",
            author: "Նարե Ս.",
            stars: 3.5
        }
    ];

    reviewsData.forEach(review => {
        const card = document.createElement('div');
        card.classList.add('review-card');
        card.innerHTML = `
            <p>"${review.text}"</p>
            <h4>${review.author}</h4>
            <div class="stars">
                ${Array.from({length: Math.floor(review.stars)}, () => '<i class="fas fa-star"></i>').join('')}
                ${review.stars % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                ${Array.from({length: 5 - Math.ceil(review.stars)}, () => '<i class="far fa-star"></i>').join('')}
            </div>
        `;
        reviewsCarousel.appendChild(card);
    });
}

/* =========================
   9. INIT
========================= */
document.addEventListener('DOMContentLoaded', async () => {
    await fetchProducts();
    updateCart();
});

// Close modal on X click
document.querySelectorAll(".close").forEach(btn => {
    btn.onclick = closeCart;
});
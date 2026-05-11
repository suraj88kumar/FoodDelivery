const foodData = [
    {
        id: 1,
        title: "Neo-Pepperoni Pizza",
        desc: "Classic pepperoni with a modern twist, featuring artisan cheese and fresh basil.",
        price: 14.99,
        category: "pizza",
        img: "images/pizza.png"
    },
    {
        id: 2,
        title: "Cyber-Gourmet Burger",
        desc: "Juicy beef patty, melted cheddar, crispy bacon, and our secret sauce on a brioche bun.",
        price: 12.49,
        category: "burger",
        img: "images/burger.png"
    },
    {
        id: 3,
        title: "Zen Sushi Platter",
        desc: "A selection of fresh salmon and tuna nigiri, served with wasabi and pickled ginger.",
        price: 18.99,
        category: "sushi",
        img: "images/sushi.png"
    },
    {
        id: 4,
        title: "Quantum Quinoa Salad",
        desc: "A vibrant mix of quinoa, avocado, cherry tomatoes, and cucumber with a light lime dressing.",
        price: 9.99,
        category: "salad",
        img: "images/salad.png"
    },
    {
        id: 5,
        title: "Truffle Fusion Pizza",
        desc: "Wild mushrooms, truffle oil, and fresh mozzarella on a thin crust.",
        price: 16.99,
        category: "pizza",
        img: "images/pizza.png"
    },
    {
        id: 6,
        title: "Neon BBQ Burger",
        desc: "Double patty, smoked BBQ sauce, onion rings, and pepper jack cheese.",
        price: 13.99,
        category: "burger",
        img: "images/burger.png"
    }
];

let cart = [];
let currentModalItem = null;
let currentQty = 1;

const foodGrid = document.getElementById('food-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const totalPriceEl = document.getElementById('total-price');

// Modal Elements
const orderModal = document.getElementById('order-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const qtyVal = document.getElementById('qty-val');
const qtyMinus = document.getElementById('qty-minus');
const qtyPlus = document.getElementById('qty-plus');
const confirmOrderBtn = document.getElementById('confirm-order-btn');

// Initialize
function init() {
    renderFood(foodData);
    setupEventListeners();
}

// Render Food Cards
function renderFood(items) {
    foodGrid.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'food-card glass-card';
        card.setAttribute('data-category', item.category);
        card.style.cursor = 'pointer';
        
        // Make the card clickable to open modal
        card.onclick = (e) => {
            // Don't open modal if clicking the add button
            if (e.target.closest('.add-btn')) return;
            openModal(item.id);
        };
        
        card.innerHTML = `
            <img src="${item.img}" alt="${item.title}" class="food-img">
            <div class="food-info">
                <h3 class="food-title">${item.title}</h3>
                <p class="food-desc">${item.desc}</p>
                <div class="food-footer">
                    <span class="food-price">${item.price.toFixed(2)}</span>
                    <button class="add-btn" onclick="addToCart(event, ${item.id})">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        foodGrid.appendChild(card);
    });
}

// Event Listeners
function setupEventListeners() {
    // Cart Toggle
    cartToggle.addEventListener('click', () => {
        cartSidebar.classList.toggle('open');
    });

    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });

    // Category Filter
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const category = card.getAttribute('data-category');
            if (category === 'all') {
                renderFood(foodData);
            } else {
                const filtered = foodData.filter(item => item.category === category);
                renderFood(filtered);
            }
        });
    });

    // Creative: Interactive Mouse Move for Cards (3D Tilt effect)
    foodGrid.addEventListener('mousemove', (e) => {
        const card = e.target.closest('.food-card');
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) scale(1.02)`;
    });

    foodGrid.addEventListener('mouseleave', (e) => {
        const card = e.target.closest('.food-card');
        if (!card) return;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
    });

    // Modal Controls
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal on outside click
    orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) closeModal();
    });

    qtyPlus.addEventListener('click', () => {
        currentQty++;
        updateModalPrice();
    });

    qtyMinus.addEventListener('click', () => {
        if (currentQty > 1) {
            currentQty--;
            updateModalPrice();
        }
    });

    confirmOrderBtn.addEventListener('click', () => {
        if (currentModalItem) {
            placeOrder(currentModalItem.id, currentQty);
        }
    });
}

// Modal Functions
window.openModal = function(id) {
    const item = foodData.find(f => f.id === id);
    if (!item) return;
    
    currentModalItem = item;
    currentQty = 1;
    
    modalImg.src = item.img;
    modalTitle.textContent = item.title;
    modalDesc.textContent = item.desc;
    updateModalPrice();
    
    orderModal.style.display = 'flex';
    setTimeout(() => {
        orderModal.classList.add('open');
    }, 10);
};

function closeModal() {
    orderModal.classList.remove('open');
    setTimeout(() => {
        orderModal.style.display = 'none';
    }, 300);
}

function updateModalPrice() {
    qtyVal.textContent = currentQty;
    if (currentModalItem) {
        const total = currentModalItem.price * currentQty;
        modalPrice.textContent = `₹${total.toFixed(2)}`;
    }
}

// Add to Cart with Creative Flying Animation
window.addToCart = function(event, id) {
    event.stopPropagation(); // Prevent opening modal
    const item = foodData.find(f => f.id === id);
    if (item) {
        cart.push(item);
        updateCart();
        
        // Flying Animation
        const btn = event.currentTarget;
        createFlyingElement(btn, item.img);
        
        // Pulse effect on cart button
        cartToggle.classList.add('pulse');
        setTimeout(() => cartToggle.classList.remove('pulse'), 300);
    }
};

function createFlyingElement(button, imgSrc) {
    const rect = button.getBoundingClientRect();
    const cartRect = cartToggle.getBoundingClientRect();

    const flyer = document.createElement('div');
    flyer.style.position = 'fixed';
    flyer.style.top = `${rect.top}px`;
    flyer.style.left = `${rect.left}px`;
    flyer.style.width = '30px';
    flyer.style.height = '30px';
    flyer.style.backgroundImage = `url(${imgSrc})`;
    flyer.style.backgroundSize = 'cover';
    flyer.style.borderRadius = '50%';
    flyer.style.zIndex = '1000';
    flyer.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    flyer.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';

    document.body.appendChild(flyer);

    // Animate to cart
    setTimeout(() => {
        flyer.style.top = `${cartRect.top + 10}px`;
        flyer.style.left = `${cartRect.left + 10}px`;
        flyer.style.width = '10px';
        flyer.style.height = '10px';
        flyer.style.opacity = '0.5';
    }, 50);

    // Remove after animation
    setTimeout(() => {
        flyer.remove();
    }, 850);
}

// Backend Interaction: Place Order
function placeOrder(id, qty) {
    const item = foodData.find(f => f.id === id);
    
    // Show loading state
    confirmOrderBtn.textContent = "Placing Order...";
    confirmOrderBtn.disabled = true;

    // Simulation fallback for file:// protocol
    if (window.location.protocol === 'file:') {
        setTimeout(() => {
            const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            alert(`🎉 [SIMULATION] Order Placed Successfully!\n\nItem: ${item.title}\nQuantity: ${qty}\nOrder ID: ${orderId}\n\n(This is a simulation because you opened the file directly. Run the server for real backend storage!)`);
            closeModal();
            confirmOrderBtn.textContent = "Confirm Order";
            confirmOrderBtn.disabled = false;
        }, 1000);
        return;
    }

    fetch('/api/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id,
            title: item.title,
            quantity: qty,
            total: (item.price * qty).toFixed(2)
        })
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        alert(`🎉 Order Placed Successfully!\n\nItem: ${item.title}\nQuantity: ${qty}\nOrder ID: ${data.orderId}`);
        closeModal();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to place order. (Make sure the C++ or Node server is running)');
    })
    .finally(() => {
        confirmOrderBtn.textContent = "Confirm Order";
        confirmOrderBtn.disabled = false;
    });
}

// Update Cart
function updateCart() {
    // Update Count
    cartCount.textContent = cart.length;
    
    // Update List
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty</div>';
    } else {
        cartItemsContainer.innerHTML = '';
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.img}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${item.price.toFixed(2)}</div>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
    }
    
    // Update Total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    totalPriceEl.textContent = `₹${total.toFixed(2)}`;
}

// Remove from Cart
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCart();
};

// Pulse animation styles
const style = document.createElement('style');
style.innerHTML = `
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}
.pulse {
    animation: pulse 0.3s ease;
}
`;
document.head.appendChild(style);

// Run
document.addEventListener('DOMContentLoaded', init);

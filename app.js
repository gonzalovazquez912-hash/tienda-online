const PRODUCTS = [
  {
    id: 1,
    name: "Auriculares Bluetooth",
    category: "Tecnología",
    price: 49.99,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Mochila Urbana",
    category: "Accesorios",
    price: 35.5,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Camiseta Básica",
    category: "Ropa",
    price: 19.99,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Zapatillas Running",
    category: "Deportes",
    price: 79.9,
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    name: "Reloj Minimalista",
    category: "Accesorios",
    price: 59.0,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    name: "Teclado Mecánico",
    category: "Tecnología",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80",
  },
];

const STORAGE_KEY = "tienda_online_cart";
const SHIPPING_COST = 4.99;

const productGrid = document.getElementById("productGrid");
const productCardTemplate = document.getElementById("productCardTemplate");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const cartItems = document.getElementById("cartItems");
const subtotalAmount = document.getElementById("subtotalAmount");
const shippingAmount = document.getElementById("shippingAmount");
const totalAmount = document.getElementById("totalAmount");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutMessage = document.getElementById("checkoutMessage");

let cart = loadCart();

initialize();

function initialize() {
  populateCategories();
  renderProducts(PRODUCTS);
  renderCart();

  searchInput.addEventListener("input", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);
  checkoutForm.addEventListener("submit", handleCheckout);
}

function populateCategories() {
  const categories = [...new Set(PRODUCTS.map((product) => product.category))];

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  }
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filtered = PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(query);
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  renderProducts(filtered);
}

function renderProducts(products) {
  productGrid.innerHTML = "";

  if (products.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No se encontraron productos con ese filtro.";
    productGrid.append(emptyState);
    return;
  }

  for (const product of products) {
    const card = productCardTemplate.content.firstElementChild.cloneNode(true);

    const image = card.querySelector(".product-card__image");
    const title = card.querySelector(".product-card__title");
    const category = card.querySelector(".product-card__category");
    const price = card.querySelector(".product-card__price");
    const button = card.querySelector(".product-card__button");

    image.src = product.image;
    image.alt = product.name;
    title.textContent = product.name;
    category.textContent = product.category;
    price.textContent = formatCurrency(product.price);
    button.addEventListener("click", () => addToCart(product.id));

    productGrid.append(card);
  }
}

function addToCart(productId) {
  const existingItem = cart.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }

  persistCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.productId !== productId);
  persistCart();
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Tu carrito está vacío.";
    cartItems.append(empty);
    updateTotals(0);
    return;
  }

  let subtotal = 0;

  for (const item of cart) {
    const product = PRODUCTS.find((entry) => entry.id === item.productId);

    if (!product) continue;

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;

    const li = document.createElement("li");
    li.className = "cart__item";
    li.innerHTML = `
      <div>
        <strong>${product.name}</strong><br />
        <small>${item.quantity} x ${formatCurrency(product.price)}</small>
      </div>
      <div>
        <span>${formatCurrency(lineTotal)}</span><br />
        <button type="button" aria-label="Eliminar ${product.name}">Eliminar</button>
      </div>
    `;

    li.querySelector("button").addEventListener("click", () => removeFromCart(product.id));

    cartItems.append(li);
  }

  updateTotals(subtotal);
}

function updateTotals(subtotal) {
  const hasItems = subtotal > 0;
  const shipping = hasItems ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  subtotalAmount.textContent = formatCurrency(subtotal);
  shippingAmount.textContent = formatCurrency(shipping);
  totalAmount.textContent = formatCurrency(total);
}

function handleCheckout(event) {
  event.preventDefault();

  if (cart.length === 0) {
    checkoutMessage.textContent = "Agrega productos al carrito antes de comprar.";
    return;
  }

  const formData = new FormData(checkoutForm);
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!fullName || !email || !address) {
    checkoutMessage.textContent = "Completa todos los campos del formulario.";
    return;
  }

  const orderNumber = `ORD-${Math.floor(Math.random() * 90000 + 10000)}`;
  checkoutMessage.textContent = `¡Gracias por tu compra, ${fullName}! Pedido confirmado: ${orderNumber}.`;

  cart = [];
  persistCart();
  renderCart();
  checkoutForm.reset();
}

function persistCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function loadCart() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        Number.isInteger(item.productId) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

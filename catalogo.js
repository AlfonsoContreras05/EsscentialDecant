const productGrid = document.querySelector("#productGrid");
const productTemplate = document.querySelector("#productTemplate");
const cartDrawer = document.querySelector("#cartDrawer");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const sendWhatsapp = document.querySelector("#sendWhatsapp");
const checkoutForm = document.querySelector("#checkoutForm");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const filterList = document.querySelector("#filterList");

let activeFilter = { type: "all", value: "todos" };
let cart = getCart();

function renderFilters() {
  const categories = getCategories();
  const profiles = getProfiles();

  const filters = [
    { type: "all", value: "todos", label: "Todos" },
    { type: "featured", value: "destacados", label: "Destacados" },
    ...profiles.map((profile) => ({ type: "profile", value: profile.id, label: profile.name })),
    ...categories.map((category) => ({ type: "category", value: category.id, label: category.name }))
  ];

  filterList.innerHTML = "";

  filters.forEach((filter) => {
    const button = document.createElement("button");
    button.className = "filter";
    button.type = "button";
    button.textContent = filter.label;
    button.dataset.filterType = filter.type;
    button.dataset.filterValue = filter.value;

    if (activeFilter.type === filter.type && activeFilter.value === filter.value) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      activeFilter = { type: filter.type, value: filter.value };
      renderFilters();
      renderProducts();
    });

    filterList.appendChild(button);
  });
}

function productMatchesFilter(product) {
  if (activeFilter.type === "all") return true;
  if (activeFilter.type === "featured") return product.featured;
  if (activeFilter.type === "category") return product.category === activeFilter.value;
  if (activeFilter.type === "profile") return product.profile === activeFilter.value;
  return true;
}

function getFilteredProducts() {
  const query = searchInput.value.trim().toLowerCase();
  let products = getProducts();

  products = products.filter((product) => {
    const categoryName = getTaxonomyName("category", product.category);
    const profileName = getTaxonomyName("profile", product.profile);

    const text = [
      product.name,
      product.brand,
      product.category,
      product.profile,
      categoryName,
      profileName,
      product.tag,
      product.description
    ].join(" ").toLowerCase();

    const matchesSearch = !query || text.includes(query);
    return productMatchesFilter(product) && matchesSearch;
  });

  if (sortSelect.value === "featured") {
    products.sort((a, b) => Number(b.featured) - Number(a.featured) || Number(a.order) - Number(b.order));
  }

  if (sortSelect.value === "name") {
    products.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortSelect.value === "price-low") {
    products.sort((a, b) => Number(a.prices["3"]) - Number(b.prices["3"]));
  }

  if (sortSelect.value === "price-high") {
    products.sort((a, b) => Number(b.prices["3"]) - Number(a.prices["3"]));
  }

  return products;
}

function renderProducts() {
  productGrid.innerHTML = "";
  const products = getFilteredProducts();

  if (products.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-state">
        <strong>No hay productos para esta búsqueda.</strong>
        <span>Prueba otro filtro o revisa el nombre escrito.</span>
      </div>
    `;
    return;
  }

  products.forEach((product) => {
    const node = productTemplate.content.cloneNode(true);
    const card = node.querySelector(".product-card");
    const bottle = node.querySelector(".product-bottle");
    const label = node.querySelector(".label");
    const productImage = node.querySelector(".product-image");
    const tag = node.querySelector(".product-tag");
    const stock = node.querySelector(".stock");
    const title = node.querySelector("h3");
    const description = node.querySelector("p");
    const price = node.querySelector(".price");
    const addButton = node.querySelector(".add-cart");
    const sizeButtons = node.querySelectorAll(".size-picker button");

    let selectedSize = "5";

    card.style.setProperty("--accent", product.accent);
    card.style.setProperty("--accent-solid", product.color);
    bottle.style.setProperty("--accent-solid", product.color);

    if (product.featured) {
      card.classList.add("featured");
    }

    if (product.image) {
      productImage.src = product.image;
      productImage.alt = product.name;
      productImage.classList.add("visible");
      bottle.classList.add("hidden");
    } else {
      productImage.removeAttribute("src");
      productImage.classList.remove("visible");
      bottle.classList.remove("hidden");
    }

    label.textContent = product.brand;
    tag.textContent = product.featured ? `★ ${product.tag}` : product.tag;
    stock.textContent = product.stock || "Disponible";
    stock.classList.toggle("sold-out", product.stock === "Agotado");
    title.textContent = product.name;
    description.textContent = product.description;
    price.textContent = formatPrice(product.prices[selectedSize]);

    sizeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selectedSize = button.dataset.size;
        sizeButtons.forEach((currentButton) => currentButton.classList.remove("selected"));
        button.classList.add("selected");
        price.textContent = formatPrice(product.prices[selectedSize]);
      });
    });

    if (product.stock === "Agotado") {
      addButton.disabled = true;
      addButton.textContent = "Agotado";
      addButton.classList.add("disabled");
    } else {
      addButton.addEventListener("click", () => {
        addToCart(product, selectedSize);
        openCart();
      });
    }

    productGrid.appendChild(node);
  });
}

function addToCart(product, size) {
  const key = `${product.id}-${size}`;
  const existingItem = cart.find((item) => item.key === key);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      brand: product.brand,
      size,
      price: product.prices[size],
      quantity: 1
    });
  }

  saveCart(cart);
  renderCart();
}

function changeQuantity(key, amount) {
  const item = cart.find((currentItem) => currentItem.key === key);
  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter((currentItem) => currentItem.key !== key);
  }

  saveCart(cart);
  renderCart();
}

function removeItem(key) {
  cart = cart.filter((item) => item.key !== key);
  saveCart(cart);
  renderCart();
}

function getTotal() {
  return cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
}

function renderCart() {
  cartItems.innerHTML = "";

  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = totalQuantity;
  cartTotal.textContent = formatPrice(getTotal());

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        Aún no hay productos seleccionados. Agrega decants desde el catálogo para preparar el pedido.
      </div>
    `;
    sendWhatsapp.classList.add("disabled");
    sendWhatsapp.href = "#";
    return;
  }

  cart.forEach((item) => {
    const article = document.createElement("article");
    article.className = "cart-item";
    article.innerHTML = `
      <div class="cart-item-top">
        <div>
          <strong>${item.name}</strong>
          <br>
          <small>${item.brand} · ${item.size}ml</small>
        </div>
        <strong>${formatPrice(Number(item.price) * item.quantity)}</strong>
      </div>

      <div class="cart-item-actions">
        <div class="qty-control">
          <button type="button" data-action="minus">−</button>
          <strong>${item.quantity}</strong>
          <button type="button" data-action="plus">+</button>
        </div>
        <button class="remove-item" type="button" data-action="remove">Quitar</button>
      </div>
    `;

    article.querySelector('[data-action="minus"]').addEventListener("click", () => changeQuantity(item.key, -1));
    article.querySelector('[data-action="plus"]').addEventListener("click", () => changeQuantity(item.key, 1));
    article.querySelector('[data-action="remove"]').addEventListener("click", () => removeItem(item.key));

    cartItems.appendChild(article);
  });

  updateWhatsappLink();
}

function updateWhatsappLink() {
  if (cart.length === 0) return;

  const formData = new FormData(checkoutForm);
  const customerName = formData.get("customerName")?.trim() || "Sin nombre indicado";
  const customerZone = formData.get("customerZone")?.trim() || "Sin comuna indicada";
  const customerNote = formData.get("customerNote")?.trim() || "Sin comentario adicional";

  const productLines = cart.map((item, index) => {
    const subtotal = formatPrice(Number(item.price) * item.quantity);
    return `${index + 1}. ${item.name} - ${item.size}ml x${item.quantity} = ${subtotal}`;
  });

  const message = [
    "Hola Essential Decant 👋",
    "Quiero consultar por este pedido:",
    "",
    ...productLines,
    "",
    `Total estimado: ${formatPrice(getTotal())}`,
    "",
    `Nombre: ${customerName}`,
    `Comuna/Sector: ${customerZone}`,
    `Comentario: ${customerNote}`,
    "",
    "¿Me confirmas disponibilidad, forma de pago y entrega?"
  ].join("\n");

  sendWhatsapp.href = `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(message)}`;
  sendWhatsapp.classList.remove("disabled");
}

function openCart() {
  document.body.classList.add("cart-open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  document.body.classList.remove("cart-open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

document.querySelector("#openCart").addEventListener("click", openCart);
document.querySelector("#openCartBottom").addEventListener("click", openCart);
document.querySelector("#closeCart").addEventListener("click", closeCart);

cartDrawer.addEventListener("click", (event) => {
  if (event.target === cartDrawer) closeCart();
});

document.querySelector("#clearCart").addEventListener("click", () => {
  cart = [];
  saveCart(cart);
  renderCart();
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
checkoutForm.addEventListener("input", updateWhatsappLink);

renderFilters();
renderProducts();
renderCart();

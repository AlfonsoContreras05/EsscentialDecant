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
const offersGrid = document.querySelector("#offersGrid");

let activeFilter = { type: "all", value: "todos" };
let cart = getCart();
let categories = [];
let profiles = [];
let products = [];

function showCatalogError(message) {
  productGrid.innerHTML = `<div class="empty-state"><strong>No se pudo cargar el catálogo.</strong><span>${message}</span></div>`;
}

async function loadCatalogData() {
  productGrid.innerHTML = `<div class="empty-state"><strong>Cargando catálogo...</strong><span>Conectando con Supabase.</span></div>`;
  try {
    const allProductsResult = await Promise.all([fetchCategories(), fetchProfiles(), fetchProducts()]);
    [categories, profiles] = allProductsResult;
    products = allProductsResult[2].filter(isProductActive);
    renderFilters();
    renderOffers();
    renderProducts();
  } catch (error) {
    console.error(error);
    showCatalogError(error.message);
  }
}

function renderFilters() {
  const filters = [
    { type: "all", value: "todos", label: "Todos" },
    { type: "featured", value: "destacados", label: "Destacados" },
    { type: "offer", value: "ofertas", label: "Ofertas" },
    ...profiles.map((profile) => ({ type: "profile", value: profile.id, label: profile.name })),
    ...categories.map((category) => ({ type: "category", value: category.id, label: category.name }))
  ];
  filterList.innerHTML = "";
  filters.forEach((filter) => {
    const button = document.createElement("button");
    button.className = "filter";
    button.type = "button";
    button.textContent = filter.label;
    if (activeFilter.type === filter.type && activeFilter.value === filter.value) button.classList.add("active");
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
  if (activeFilter.type === "offer") return isProductOnOffer(product);
  if (activeFilter.type === "category") return product.category_id === activeFilter.value;
  if (activeFilter.type === "profile") return product.profile_id === activeFilter.value;
  return true;
}

function getFilteredProducts() {
  const query = searchInput.value.trim().toLowerCase();
  let filtered = [...products].filter((product) => {
    const text = [product.name, product.brand, getProductCategoryName(product), getProductProfileName(product), product.tag, product.description].join(" ").toLowerCase();
    return productMatchesFilter(product) && (!query || text.includes(query));
  });

  if (sortSelect.value === "featured") filtered.sort((a, b) => Number(b.featured) - Number(a.featured) || Number(a.order_index) - Number(b.order_index));
  if (sortSelect.value === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sortSelect.value === "price-low") filtered.sort((a, b) => getProductPrice(a, "3") - getProductPrice(b, "3"));
  if (sortSelect.value === "price-high") filtered.sort((a, b) => getProductPrice(b, "3") - getProductPrice(a, "3"));
  return filtered;
}

function renderPriceNode(priceNode, product, size) {
  const discount = getProductDiscountPercent(product);
  const basePrice = getProductBasePrice(product, size);
  const finalPrice = getProductPrice(product, size);
  if (discount > 0 && basePrice > finalPrice) {
    priceNode.classList.add("price-offer");
    priceNode.innerHTML = `<span class="old-price">${formatPrice(basePrice)}</span><span class="new-price">${formatPrice(finalPrice)}</span>`;
  } else {
    priceNode.classList.remove("price-offer");
    priceNode.textContent = formatPrice(finalPrice);
  }
}

function renderOffers() {
  if (!offersGrid) return;
  const offers = products
    .filter((product) => isProductOnOffer(product))
    .sort((a, b) => getProductDiscountPercent(b) - getProductDiscountPercent(a) || Number(a.order_index) - Number(b.order_index))
    .slice(0, 4);

  offersGrid.innerHTML = "";
  if (offers.length === 0) {
    offersGrid.innerHTML = `<div class="offers-empty"><strong>Aún no hay ofertas activas.</strong><span>Cuando marques un descuento en el admin, aparecerá aquí automáticamente.</span></div>`;
    return;
  }

  offers.forEach((product) => {
    const image = getPrimaryProductImage(product);
    const discount = getProductDiscountPercent(product);
    const card = document.createElement("a");
    card.className = "offer-card";
    card.href = getProductDetailUrl(product);
    card.innerHTML = `
      <span class="offer-badge">-${discount}%</span>
      <div class="offer-visual">
        ${image ? `<img src="${image}" alt="${product.name}" loading="lazy">` : `<div class="perfume-bottle product-bottle"><div class="cap"></div><div class="label">${product.brand}</div></div>`}
      </div>
      <div class="offer-info">
        <span>${product.brand}</span>
        <strong>${product.name}</strong>
        <small>${getProductProfileName(product)} · desde ${formatPrice(getProductPrice(product, "3"))}</small>
      </div>
    `;
    offersGrid.appendChild(card);
  });
}

function renderProductGallery(product, productImage, gallery) {
  const images = getProductImages(product);
  gallery.innerHTML = "";
  if (images.length === 0) {
    productImage.removeAttribute("src");
    productImage.classList.remove("visible");
    return;
  }
  productImage.src = images[0];
  productImage.alt = product.name;
  productImage.classList.add("visible");
  if (images.length <= 1) return;
  images.forEach((imageUrl, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = index + 1;
    if (index === 0) button.classList.add("active");
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      productImage.src = imageUrl;
      gallery.querySelectorAll("button").forEach((currentButton) => currentButton.classList.remove("active"));
      button.classList.add("active");
    });
    gallery.appendChild(button);
  });
}

function getProductDetailUrl(product) {
  return `product.html?id=${encodeURIComponent(product.id)}`;
}

function goToProductDetail(product) {
  window.location.href = getProductDetailUrl(product);
}

function renderProducts() {
  productGrid.innerHTML = "";
  const filteredProducts = getFilteredProducts();
  if (filteredProducts.length === 0) {
    productGrid.innerHTML = `<div class="empty-state"><strong>No hay productos para esta búsqueda.</strong><span>Prueba otro filtro o revisa el nombre escrito.</span></div>`;
    return;
  }

  filteredProducts.forEach((product) => {
    const node = productTemplate.content.cloneNode(true);
    const card = node.querySelector(".product-card");
    const bottle = node.querySelector(".product-bottle");
    const label = node.querySelector(".label");
    const productImage = node.querySelector(".product-image");
    const gallery = node.querySelector(".product-gallery");
    const tag = node.querySelector(".product-tag");
    const stock = node.querySelector(".stock");
    const title = node.querySelector("h3");
    const description = node.querySelector("p");
    const price = node.querySelector(".price");
    const addButton = node.querySelector(".add-cart");
    const detailLink = node.querySelector(".product-detail-link");
    const sizeButtons = node.querySelectorAll(".size-picker button");
    const [accent, color] = getProfileColors(getProductProfileName(product));
    let selectedSize = "5";

    card.style.setProperty("--accent", accent);
    card.style.setProperty("--accent-solid", color);
    bottle.style.setProperty("--accent-solid", color);
    if (product.featured) card.classList.add("featured");
    if (isProductOnOffer(product)) card.classList.add("product-offer");
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Ver detalle de ${product.name}`);

    if (getProductImages(product).length > 0) {
      renderProductGallery(product, productImage, gallery);
      bottle.classList.add("hidden");
    } else {
      productImage.removeAttribute("src");
      productImage.classList.remove("visible");
      bottle.classList.remove("hidden");
    }

    label.textContent = product.brand;
    tag.textContent = isProductOnOffer(product) ? `-${getProductDiscountPercent(product)}% · ${product.tag}` : (product.featured ? `★ ${product.tag}` : product.tag);
    stock.textContent = product.stock || "Disponible";
    stock.classList.toggle("sold-out", product.stock === "Agotado");
    title.textContent = product.name;
    description.textContent = product.description;
    renderPriceNode(price, product, selectedSize);
    detailLink.href = getProductDetailUrl(product);

    sizeButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        selectedSize = button.dataset.size;
        sizeButtons.forEach((currentButton) => currentButton.classList.remove("selected"));
        button.classList.add("selected");
        renderPriceNode(price, product, selectedSize);
    detailLink.href = getProductDetailUrl(product);
      });
    });

    if (product.stock === "Agotado") {
      addButton.disabled = true;
      addButton.textContent = "Agotado";
      addButton.classList.add("disabled");
    } else {
      addButton.addEventListener("click", (event) => { event.stopPropagation(); addToCart(product, selectedSize); openCart(); });
    }
    detailLink.addEventListener("click", (event) => { event.stopPropagation(); });
    card.addEventListener("click", (event) => {
      if (event.target.closest("button, a")) return;
      goToProductDetail(product);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goToProductDetail(product);
      }
    });
    productGrid.appendChild(node);
  });
}

function addToCart(product, size) {
  const key = `${product.id}-${size}`;
  const existingItem = cart.find((item) => item.key === key);
  if (existingItem) existingItem.quantity += 1;
  else cart.push({ key, id: product.id, name: product.name, brand: product.brand, size, price: getProductPrice(product, size), quantity: 1 });
  saveCart(cart);
  renderCart();
}
function changeQuantity(key, amount) {
  const item = cart.find((currentItem) => currentItem.key === key);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter((currentItem) => currentItem.key !== key);
  saveCart(cart);
  renderCart();
}
function removeItem(key) { cart = cart.filter((item) => item.key !== key); saveCart(cart); renderCart(); }
function getTotal() { return cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0); }

function renderCart() {
  cartItems.innerHTML = "";
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = totalQuantity;
  cartTotal.textContent = formatPrice(getTotal());
  if (cart.length === 0) {
    cartItems.innerHTML = `<div class="empty-cart">Aún no hay productos seleccionados. Agrega decants desde el catálogo para preparar el pedido.</div>`;
    sendWhatsapp.classList.add("disabled");
    sendWhatsapp.href = "#";
    return;
  }
  cart.forEach((item) => {
    const article = document.createElement("article");
    article.className = "cart-item";
    article.innerHTML = `<div class="cart-item-top"><div><strong>${item.name}</strong><br><small>${item.brand} · ${item.size}ml</small></div><strong>${formatPrice(Number(item.price) * item.quantity)}</strong></div><div class="cart-item-actions"><div class="qty-control"><button type="button" data-action="minus">−</button><strong>${item.quantity}</strong><button type="button" data-action="plus">+</button></div><button class="remove-item" type="button" data-action="remove">Quitar</button></div>`;
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
  const productLines = cart.map((item, index) => `${index + 1}. ${item.name} - ${item.size}ml x${item.quantity} = ${formatPrice(Number(item.price) * item.quantity)}`);
  const message = ["Hola Essential Decant 👋", "Quiero consultar por este pedido:", "", ...productLines, "", `Total estimado: ${formatPrice(getTotal())}`, "", `Nombre: ${customerName}`, `Comuna/Sector: ${customerZone}`, `Comentario: ${customerNote}`, "", "¿Me confirmas disponibilidad, forma de pago y entrega?"].join("\n");
  sendWhatsapp.href = `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(message)}`;
  sendWhatsapp.classList.remove("disabled");
}
function openCart() { document.body.classList.add("cart-open"); cartDrawer.setAttribute("aria-hidden", "false"); }
function closeCart() { document.body.classList.remove("cart-open"); cartDrawer.setAttribute("aria-hidden", "true"); }

document.querySelector("#openCart").addEventListener("click", openCart);
document.querySelector("#openCartBottom").addEventListener("click", openCart);
document.querySelector("#closeCart").addEventListener("click", closeCart);
cartDrawer.addEventListener("click", (event) => { if (event.target === cartDrawer) closeCart(); });
document.querySelector("#clearCart").addEventListener("click", () => { cart = []; saveCart(cart); renderCart(); });
searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
checkoutForm.addEventListener("input", updateWhatsappLink);
renderCart();
loadCatalogData();

const packsPageGrid = document.querySelector("#packsPageGrid");
const offersPageGrid = document.querySelector("#offersPageGrid");
const cartDrawer = document.querySelector("#cartDrawer");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const sendWhatsapp = document.querySelector("#sendWhatsapp");
const checkoutForm = document.querySelector("#checkoutForm");
let cart = getCart();

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function addPackToCart(pack, size = null) {
  const selectedSize = String(size || getDefaultPackSize(pack));
  const key = `pack-${pack.id}-${selectedSize}`;
  const existingItem = cart.find((item) => item.key === key);
  if (existingItem) existingItem.quantity += 1;
  else cart.push({
    key,
    id: pack.id,
    type: "pack",
    name: pack.name,
    brand: pack.tag || "Pack Essential",
    size: selectedSize,
    price: getPackPrice(pack, selectedSize),
    quantity: 1
  });
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
function getTotal() { return cart.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 1), 0); }

function renderCart() {
  if (!cartItems || !cartCount || !cartTotal || !sendWhatsapp) return;
  cartItems.innerHTML = "";
  const totalQuantity = cart.reduce((total, item) => total + Number(item.quantity || 1), 0);
  cartCount.textContent = totalQuantity;
  cartTotal.textContent = formatPrice(getTotal());
  if (cart.length === 0) {
    cartItems.innerHTML = `<div class="empty-cart">Aún no hay productos seleccionados. Agrega packs o decants para preparar el pedido.</div>`;
    sendWhatsapp.classList.add("disabled");
    sendWhatsapp.href = "#";
    return;
  }
  cart.forEach((item) => {
    const article = document.createElement("article");
    article.className = "cart-item";
    article.innerHTML = `<div class="cart-item-top"><div><strong>${escapeHTML(item.name)}</strong><br><small>${escapeHTML(getCartItemSubtitle(item))}</small></div><strong>${formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}</strong></div><div class="cart-item-actions"><div class="qty-control"><button type="button" data-action="minus">−</button><strong>${item.quantity}</strong><button type="button" data-action="plus">+</button></div><button class="remove-item" type="button" data-action="remove">Quitar</button></div>`;
    article.querySelector('[data-action="minus"]').addEventListener("click", () => changeQuantity(item.key, -1));
    article.querySelector('[data-action="plus"]').addEventListener("click", () => changeQuantity(item.key, 1));
    article.querySelector('[data-action="remove"]').addEventListener("click", () => removeItem(item.key));
    cartItems.appendChild(article);
  });
  updateWhatsappLink();
}

function updateWhatsappLink() {
  if (!sendWhatsapp || cart.length === 0) return;
  const formData = new FormData(checkoutForm);
  const customerName = formData.get("customerName")?.trim() || "Sin nombre indicado";
  const customerZone = formData.get("customerZone")?.trim() || "Sin comuna indicada";
  const customerNote = formData.get("customerNote")?.trim() || "Sin comentario adicional";
  const productLines = cart.map((item, index) => getCartLine(item, index));
  const message = ["Hola Essential Decant 👋", "Quiero consultar por este pedido:", "", ...productLines, "", `Total estimado: ${formatPrice(getTotal())}`, "", `Nombre: ${customerName}`, `Comuna/Sector: ${customerZone}`, `Comentario: ${customerNote}`, "", "¿Me confirmas disponibilidad, forma de pago y entrega?"].join("\n");
  sendWhatsapp.href = `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(message)}`;
  sendWhatsapp.classList.remove("disabled");
}

function openCart() { document.body.classList.add("cart-open"); cartDrawer?.setAttribute("aria-hidden", "false"); }
function closeCart() { document.body.classList.remove("cart-open"); cartDrawer?.setAttribute("aria-hidden", "true"); }

document.querySelector("#openCart")?.addEventListener("click", openCart);
document.querySelector("#closeCart")?.addEventListener("click", closeCart);
cartDrawer?.addEventListener("click", (event) => { if (event.target === cartDrawer) closeCart(); });
document.querySelector("#clearCart")?.addEventListener("click", () => { cart = []; saveCart(cart); renderCart(); });
checkoutForm?.addEventListener("input", updateWhatsappLink);

function renderPackSizePicker(pack, selectedSize) {
  const sizes = getAvailablePackSizes(pack);
  if (!sizes.length) return "";
  return `
    <div class="pack-size-picker" role="group" aria-label="Elegir formato del pack">
      ${sizes.map((item) => `<button type="button" data-pack-size="${item.value}" class="${item.value === selectedSize ? "selected" : ""}">${item.label}</button>`).join("")}
    </div>
  `;
}

function renderPackCard(pack) {
  const packImage = getPrimaryPackImage(pack);
  const selectedSize = getDefaultPackSize(pack);
  const card = document.createElement("article");
  card.className = "public-pack-card public-pack-card-clean";
  card.dataset.selectedSize = selectedSize;
  card.innerHTML = `
    <a class="public-pack-card-link" href="pack.html?id=${encodeURIComponent(pack.id)}" aria-label="Ver detalle de ${escapeHTML(pack.name)}">
      <div class="public-pack-visual">
        ${packImage ? `<img src="${packImage}" alt="${escapeHTML(pack.name)}" loading="lazy">` : `<div class="perfume-bottle product-bottle"><div class="cap"></div><div class="label">PACK</div></div>`}
        ${pack.featured ? `<span class="offer-badge">Pack destacado</span>` : ""}
      </div>
      <div class="public-pack-info public-pack-info-clean">
        <span class="product-tag">${escapeHTML(pack.tag || "Pack Essential")}</span>
        <h3>${escapeHTML(pack.name)}</h3>
      </div>
    </a>
    <div class="public-pack-size-area">
      ${renderPackSizePicker(pack, selectedSize)}
    </div>
    <div class="public-pack-bottom public-pack-bottom-actions">
      <strong data-pack-price>${formatPrice(getPackPrice(pack, selectedSize))}</strong>
      <div>
        <a class="btn ghost" href="pack.html?id=${encodeURIComponent(pack.id)}">Ver detalle</a>
        <button class="btn primary add-pack-cart" type="button">Agregar pack</button>
      </div>
    </div>
  `;

  const priceNode = card.querySelector("[data-pack-price]");
  card.querySelectorAll("[data-pack-size]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextSize = button.dataset.packSize || getDefaultPackSize(pack);
      card.dataset.selectedSize = nextSize;
      card.querySelectorAll("[data-pack-size]").forEach((item) => item.classList.toggle("selected", item === button));
      if (priceNode) priceNode.textContent = formatPrice(getPackPrice(pack, nextSize));
    });
  });

  card.querySelector(".add-pack-cart")?.addEventListener("click", () => {
    addPackToCart(pack, card.dataset.selectedSize || getDefaultPackSize(pack));
    openCart();
  });
  return card;
}

function renderPacks(packs) {
  if (!packsPageGrid) return;
  packsPageGrid.innerHTML = "";
  if (!packs.length) {
    packsPageGrid.innerHTML = `<div class="offers-empty"><strong>No hay packs activos.</strong><span>Puedes crear o ajustar packs desde el admin.</span></div>`;
    return;
  }
  packs.forEach((pack) => packsPageGrid.appendChild(renderPackCard(pack)));
}

function renderOfferCard(product) {
  const image = getPrimaryProductImage(product);
  const discount = getProductDiscountPercent(product);
  const card = document.createElement("a");
  card.className = "offer-card";
  card.href = `product.html?id=${encodeURIComponent(product.id)}`;
  card.innerHTML = `
    <span class="offer-badge">-${discount}%</span>
    <div class="offer-visual">
      ${image ? `<img src="${image}" alt="${escapeHTML(product.name)}" loading="lazy">` : `<div class="perfume-bottle product-bottle"><div class="cap"></div><div class="label">${escapeHTML(product.brand)}</div></div>`}
    </div>
    <div class="offer-info">
      <span>${escapeHTML(product.brand)}</span>
      <strong>${escapeHTML(product.name)}</strong>
      <small>${escapeHTML(getProductProfileName(product))} · desde ${formatPrice(getProductPrice(product, "3"))}</small>
    </div>
  `;
  return card;
}

async function loadPromocionesPage() {
  if (packsPageGrid) packsPageGrid.innerHTML = `<div class="offers-empty"><strong>Cargando packs...</strong><span>Conectando con Supabase.</span></div>`;
  if (offersPageGrid) offersPageGrid.innerHTML = `<div class="offers-empty"><strong>Cargando ofertas...</strong><span>Conectando con Supabase.</span></div>`;

  try {
    const [packs, products] = await Promise.all([fetchPacks(), fetchProducts()]);
    const activePacks = packs.filter(isPackActive).sort((a, b) => Number(b.featured) - Number(a.featured) || Number(a.order_index) - Number(b.order_index));
    const activeOffers = products.filter(isProductActive).filter(isProductOnOffer).sort((a, b) => getProductDiscountPercent(b) - getProductDiscountPercent(a) || Number(a.order_index) - Number(b.order_index));

    renderPacks(activePacks);

    offersPageGrid.innerHTML = "";
    if (!activeOffers.length) {
      offersPageGrid.innerHTML = `<div class="offers-empty"><strong>Aún no hay ofertas activas.</strong><span>Marca descuento en un producto desde el admin para mostrarlo aquí.</span></div>`;
    } else {
      activeOffers.forEach((product) => offersPageGrid.appendChild(renderOfferCard(product)));
    }
  } catch (error) {
    console.error(error);
    if (packsPageGrid) packsPageGrid.innerHTML = `<div class="offers-empty"><strong>No se pudieron cargar los packs.</strong><span>${escapeHTML(error.message)}</span></div>`;
    if (offersPageGrid) offersPageGrid.innerHTML = `<div class="offers-empty"><strong>No se pudieron cargar las ofertas.</strong><span>${escapeHTML(error.message)}</span></div>`;
  }
}

renderCart();
loadPromocionesPage();

const packDetail = document.querySelector("#packDetail");
const cartDrawer = document.querySelector("#cartDrawer");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const sendWhatsapp = document.querySelector("#sendWhatsapp");
const checkoutForm = document.querySelector("#checkoutForm");
let cart = getCart();
let currentPack = null;
let currentPackSize = "5";

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getPackIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

function renderMissingPack(message = "No encontramos este pack.") {
  packDetail.innerHTML = `<div class="empty-state"><strong>Pack no disponible.</strong><span>${escapeHTML(message)}</span><a class="btn primary" href="promociones.html">Volver a promociones</a></div>`;
}

function getPackWhatsappLink(pack, size = null) {
  const selectedSize = String(size || currentPackSize || getDefaultPackSize(pack));
  const lines = [
    "Hola Essential Decant 👋",
    `Quiero consultar por el pack: ${pack.name}`,
    pack.tag ? `Tipo: ${pack.tag}` : "",
    `Formato elegido: ${selectedSize}ml`,
    pack.description ? `Detalle: ${pack.description}` : "",
    "",
    "Incluye:",
    ...(Array.isArray(pack.items) && pack.items.length ? pack.items.map((item, index) => {
      const product = item.product;
      const productName = product ? `${product.brand} ${product.name}` : "Producto";
      return `${index + 1}. ${item.quantity}x ${productName}`;
    }) : ["Selección a coordinar por WhatsApp"]),
    "",
    `Precio estimado pack ${selectedSize}ml: ${formatPrice(getPackPrice(pack, selectedSize))}`,
    "",
    "¿Me confirmas disponibilidad, forma de pago y entrega?"
  ].filter(Boolean);
  return `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function renderPackImages(pack) {
  const images = getPackImages(pack);
  const gallery = document.createElement("div");
  gallery.className = "detail-gallery pack-detail-gallery pack-single-image-gallery";

  const main = document.createElement("div");
  main.className = "detail-main-image pack-main-image";

  const image = document.createElement("img");
  image.alt = pack.name;

  if (images.length > 0) {
    image.src = images[0];
    main.appendChild(image);
  } else {
    const fallback = document.createElement("div");
    fallback.className = "detail-fallback-bottle";
    fallback.innerHTML = `<div class="perfume-bottle product-bottle"><div class="cap"></div><div class="label">PACK</div></div>`;
    main.appendChild(fallback);
  }

  gallery.appendChild(main);
  return gallery;
}

function addPackToCart(pack, size = null) {
  const selectedSize = String(size || currentPackSize || getDefaultPackSize(pack));
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
    <div class="detail-pack-size-control">
      <span class="control-label">Formato del pack</span>
      <div class="pack-size-picker detail-pack-size-picker" role="group" aria-label="Elegir formato del pack">
        ${sizes.map((item) => `<button type="button" data-pack-size="${item.value}" class="${item.value === selectedSize ? "selected" : ""}">${item.label}</button>`).join("")}
      </div>
    </div>
  `;
}

function renderPackDetail(pack) {
  document.title = `${pack.name} | Essential Decant`;
  const activeItems = (pack.items || []).filter((item) => !item.product || isProductActive(item.product));
  currentPackSize = getDefaultPackSize(pack);
  const itemsHtml = activeItems.length ? activeItems.map((item) => {
    const product = item.product;
    const productName = product ? `${escapeHTML(product.brand)} ${escapeHTML(product.name)}` : "Producto";
    const productUrl = product ? `product.html?id=${encodeURIComponent(product.id)}` : "catalogo.html";
    return `
      <a class="pack-detail-item pack-detail-item-textonly" href="${productUrl}">
        <span><strong>${Number(item.quantity || 1)}x</strong> ${productName}</span>
      </a>
    `;
  }).join("") : `<div class="pack-detail-item empty-pack-items">Selección a coordinar por WhatsApp</div>`;

  const info = document.createElement("div");
  info.className = "detail-info pack-detail-info";
  info.innerHTML = `
    <div class="breadcrumb"><a href="index.html">Inicio</a><span>/</span><a href="promociones.html">Promociones</a><span>/</span><span>${escapeHTML(pack.name)}</span></div>
    <div class="detail-badges">
      <span>${escapeHTML(pack.tag || "Pack Essential")}</span>
      ${pack.featured ? `<span>Pack destacado</span>` : ""}
    </div>
    <div class="detail-brand">Essential Decant</div>
    <h1>${escapeHTML(pack.name)}</h1>
    <p class="detail-description">${escapeHTML(pack.description || "Pack armado por Essential Decant.")}</p>
    <div class="detail-meta pack-detail-meta">
      <div><span>Contenido</span><strong>${activeItems.length || 0} selección(es)</strong></div>
      <div><span>Disponibilidad</span><strong class="success">A confirmar</strong></div>
      <div><span>Pedido</span><strong>WhatsApp</strong></div>
    </div>
    <div class="pack-detail-items">
      <span class="control-label">Incluye</span>
      ${itemsHtml}
    </div>
    ${renderPackSizePicker(pack, currentPackSize)}
    <div class="detail-subtotal">
      <span>Precio estimado pack</span>
      <strong id="packDetailPrice">${formatPrice(getPackPrice(pack, currentPackSize))}</strong>
    </div>
    <div class="detail-actions">
      <button class="btn primary" id="addPackToCart" type="button">Agregar pack al carrito</button>
      <a class="btn whatsapp" id="packWhatsappLink" href="${getPackWhatsappLink(pack, currentPackSize)}" target="_blank" rel="noopener">Consultar pack por WhatsApp</a>
      <a class="btn ghost" href="promociones.html">Ver otros packs</a>
    </div>
    <p class="detail-note">El vendedor confirma stock, forma de pago y entrega antes de cerrar el pedido.</p>
  `;

  currentPack = pack;
  packDetail.innerHTML = "";
  packDetail.appendChild(renderPackImages(pack));
  packDetail.appendChild(info);

  const priceNode = packDetail.querySelector("#packDetailPrice");
  const whatsappLink = packDetail.querySelector("#packWhatsappLink");
  packDetail.querySelectorAll("[data-pack-size]").forEach((button) => {
    button.addEventListener("click", () => {
      currentPackSize = button.dataset.packSize || getDefaultPackSize(pack);
      packDetail.querySelectorAll("[data-pack-size]").forEach((item) => item.classList.toggle("selected", item === button));
      if (priceNode) priceNode.textContent = formatPrice(getPackPrice(pack, currentPackSize));
      if (whatsappLink) whatsappLink.href = getPackWhatsappLink(pack, currentPackSize);
    });
  });

  packDetail.querySelector("#addPackToCart")?.addEventListener("click", () => {
    addPackToCart(pack, currentPackSize);
    openCart();
  });
}

async function loadPackDetail() {
  const id = getPackIdFromUrl();
  if (!id) { renderMissingPack("Falta el identificador del pack."); return; }
  try {
    const pack = await fetchPackById(id);
    if (!pack || !isPackActive(pack)) { renderMissingPack("Este pack está apagado o ya no está disponible."); return; }
    renderPackDetail(pack);
  } catch (error) {
    console.error(error);
    renderMissingPack(error.message);
  }
}

renderCart();
loadPackDetail();

const packDetail = document.querySelector("#packDetail");
const cartDrawer = document.querySelector("#cartDrawer");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const sendWhatsapp = document.querySelector("#sendWhatsapp");
const checkoutForm = document.querySelector("#checkoutForm");
let cart = getCart();
let currentPack = null;

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

function getPackWhatsappLink(pack) {
  const lines = [
    "Hola Essential Decant 👋",
    `Quiero consultar por el pack: ${pack.name}`,
    pack.tag ? `Tipo: ${pack.tag}` : "",
    pack.description ? `Detalle: ${pack.description}` : "",
    "",
    "Incluye:",
    ...(Array.isArray(pack.items) && pack.items.length ? pack.items.map((item, index) => {
      const product = item.product;
      const productName = product ? `${product.brand} ${product.name}` : "Producto";
      return `${index + 1}. ${item.quantity}x ${productName} ${item.size_ml}ml`;
    }) : ["Selección a coordinar por WhatsApp"]),
    "",
    `Precio estimado pack: ${formatPrice(getPackPrice(pack))}`,
    "",
    "¿Me confirmas disponibilidad, forma de pago y entrega?"
  ].filter(Boolean);
  return `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function renderPackImages(pack) {
  const images = getPackImages(pack);
  const gallery = document.createElement("div");
  gallery.className = "detail-gallery pack-detail-gallery";

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

  if (images.length > 1) {
    const thumbs = document.createElement("div");
    thumbs.className = "detail-thumbs";
    images.slice(0, 6).forEach((imageUrl, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = index === 0 ? "active" : "";
      button.innerHTML = `<img src="${imageUrl}" alt="${escapeHTML(pack.name)} imagen ${index + 1}">`;
      button.addEventListener("click", () => {
        image.src = imageUrl;
        thumbs.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
      });
      thumbs.appendChild(button);
    });
    gallery.appendChild(thumbs);
  }

  return gallery;
}


function addPackToCart(pack) {
  const key = `pack-${pack.id}`;
  const existingItem = cart.find((item) => item.key === key);
  if (existingItem) existingItem.quantity += 1;
  else cart.push({
    key,
    id: pack.id,
    type: "pack",
    name: pack.name,
    brand: pack.tag || "Pack Essential",
    size: "pack",
    price: getPackPrice(pack),
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

function renderPackDetail(pack) {
  document.title = `${pack.name} | Essential Decant`;
  const activeItems = (pack.items || []).filter((item) => !item.product || isProductActive(item.product));
  const itemsHtml = activeItems.length ? activeItems.map((item) => {
    const product = item.product;
    const image = product ? getPrimaryProductImage(product) : "";
    const productName = product ? `${escapeHTML(product.brand)} ${escapeHTML(product.name)}` : "Producto";
    const productUrl = product ? `product.html?id=${encodeURIComponent(product.id)}` : "catalogo.html";
    return `
      <a class="pack-detail-item" href="${productUrl}">
        <span class="pack-detail-item-img">${image ? `<img src="${image}" alt="${productName}">` : ""}</span>
        <span><strong>${Number(item.quantity || 1)}x</strong> ${productName}</span>
        <em>${Number(item.size_ml || 5)}ml</em>
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
    <div class="detail-subtotal">
      <span>Precio estimado pack</span>
      <strong>${formatPrice(getPackPrice(pack))}</strong>
    </div>
    <div class="detail-actions">
      <button class="btn primary" id="addPackToCart" type="button">Agregar pack al carrito</button>
      <a class="btn whatsapp" href="${getPackWhatsappLink(pack)}" target="_blank" rel="noopener">Consultar pack por WhatsApp</a>
      <a class="btn ghost" href="promociones.html">Ver otros packs</a>
    </div>
    <p class="detail-note">El vendedor confirma stock, forma de pago y entrega antes de cerrar el pedido.</p>
  `;

  currentPack = pack;
  packDetail.innerHTML = "";
  packDetail.appendChild(renderPackImages(pack));
  packDetail.appendChild(info);
  packDetail.querySelector("#addPackToCart")?.addEventListener("click", () => {
    addPackToCart(pack);
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

const packsPageGrid = document.querySelector("#packsPageGrid");
const offersPageGrid = document.querySelector("#offersPageGrid");

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

function renderPackCard(pack) {
  const activeItems = (pack.items || []).filter((item) => !item.product || isProductActive(item.product));
  const packImage = getPrimaryPackImage(pack);
  const previewItems = activeItems.slice(0, 4);
  const itemsHtml = previewItems.length ? previewItems.map((item) => {
    const product = item.product;
    const productName = product ? `${escapeHTML(product.brand)} ${escapeHTML(product.name)}` : "Producto";
    return `<li><strong>${Number(item.quantity || 1)}x</strong> ${productName} <span>${item.size_ml}ml</span></li>`;
  }).join("") : `<li>Selección a coordinar por WhatsApp</li>`;
  const remaining = activeItems.length > previewItems.length ? `<small class="pack-more-items">+${activeItems.length - previewItems.length} producto(s) más en el detalle</small>` : "";

  const card = document.createElement("a");
  card.className = "public-pack-card public-pack-card-link";
  card.href = `pack.html?id=${encodeURIComponent(pack.id)}`;
  card.innerHTML = `
    <div class="public-pack-visual">
      ${packImage ? `<img src="${packImage}" alt="${escapeHTML(pack.name)}" loading="lazy">` : `<div class="perfume-bottle product-bottle"><div class="cap"></div><div class="label">PACK</div></div>`}
      ${pack.featured ? `<span class="offer-badge">Pack destacado</span>` : ""}
    </div>
    <div class="public-pack-info">
      <span class="product-tag">${escapeHTML(pack.tag || "Pack Essential")}</span>
      <h3>${escapeHTML(pack.name)}</h3>
      <p>${escapeHTML(pack.description || "Pack armado por Essential Decant.")}</p>
      <ul>${itemsHtml}</ul>
      ${remaining}
      <div class="public-pack-bottom">
        <strong>${formatPrice(getPackPrice(pack))}</strong>
        <span class="btn primary">Ver detalle</span>
      </div>
    </div>
  `;
  return card;
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

    packsPageGrid.innerHTML = "";
    if (!activePacks.length) {
      packsPageGrid.innerHTML = `<div class="offers-empty"><strong>Aún no hay packs activos.</strong><span>Diseña un pack desde el admin para mostrarlo aquí.</span></div>`;
    } else {
      activePacks.forEach((pack) => packsPageGrid.appendChild(renderPackCard(pack)));
    }

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

loadPromocionesPage();

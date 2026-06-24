const packDetail = document.querySelector("#packDetail");

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
      <a class="btn whatsapp" href="${getPackWhatsappLink(pack)}" target="_blank" rel="noopener">Consultar pack por WhatsApp</a>
      <a class="btn ghost" href="promociones.html">Ver otros packs</a>
    </div>
    <p class="detail-note">El vendedor confirma stock, forma de pago y entrega antes de cerrar el pedido.</p>
  `;

  packDetail.innerHTML = "";
  packDetail.appendChild(renderPackImages(pack));
  packDetail.appendChild(info);
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

loadPackDetail();

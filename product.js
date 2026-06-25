const productDetail = document.querySelector("#productDetail");
const relatedSection = document.querySelector("#relatedSection");
const relatedGrid = document.querySelector("#relatedGrid");
const cartDrawer = document.querySelector("#cartDrawer");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const sendWhatsapp = document.querySelector("#sendWhatsapp");
const checkoutForm = document.querySelector("#checkoutForm");

let cart = getCart();
let currentProduct = null;
let selectedSize = "5";
let quantity = 1;

function getProductIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

function setDocumentTitle(product) {
  document.title = `${product.name} | Essential Decant`;
}

function renderMissingProduct(message = "No encontramos este producto.") {
  productDetail.innerHTML = `<div class="empty-state"><strong>Producto no disponible.</strong><span>${message}</span><a class="btn primary" href="catalogo.html">Volver al catálogo</a></div>`;
}

function getDirectWhatsappLink(product, size, amount = 1) {
  const price = getProductPrice(product, size);
  const message = [
    "Hola Essential Decant 👋",
    `Quiero consultar por: ${product.name}`,
    `Marca: ${product.brand}`,
    `Formato: ${size}ml`,
    `Cantidad: ${amount}`,
    `${isProductOnOffer(product) ? `Descuento aplicado: ${getProductDiscountPercent(product)}%` : ""}`,
    `Total estimado: ${formatPrice(price * amount)}`,
    "",
    "¿Me confirmas disponibilidad, forma de pago y entrega?"
  ].join("\n");
  return `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(message)}`;
}

function addToCart(product, size, amount = 1) {
  const key = `${product.id}-${size}`;
  const existingItem = cart.find((item) => item.key === key);
  if (existingItem) existingItem.quantity += amount;
  else cart.push({ key, id: product.id, name: product.name, brand: product.brand, size, price: getProductPrice(product, size), quantity: amount });
  saveCart(cart);
  renderCart();
}

function updateProductPrice() {
  const priceNode = productDetail.querySelector("#detailPrice");
  const whatsappNode = productDetail.querySelector("#directWhatsapp");
  const subtotalNode = productDetail.querySelector("#detailSubtotal");
  if (!currentProduct) return;
  const basePrice = getProductBasePrice(currentProduct, selectedSize);
  const unitPrice = getProductPrice(currentProduct, selectedSize);
  const discount = getProductDiscountPercent(currentProduct);
  if (priceNode) {
    if (discount > 0 && basePrice > unitPrice) {
      priceNode.classList.add("detail-price-offer");
      priceNode.innerHTML = `<span class="old-price">${formatPrice(basePrice)}</span><span class="new-price">${formatPrice(unitPrice)}</span>`;
    } else {
      priceNode.classList.remove("detail-price-offer");
      priceNode.textContent = formatPrice(unitPrice);
    }
  }
  if (subtotalNode) subtotalNode.textContent = formatPrice(unitPrice * quantity);
  if (whatsappNode) whatsappNode.href = getDirectWhatsappLink(currentProduct, selectedSize, quantity);
}

function renderProductImages(product) {
  const images = getProductImages(product);
  const gallery = document.createElement("div");
  gallery.className = "detail-gallery";

  const main = document.createElement("div");
  main.className = "detail-main-image";

  const image = document.createElement("img");
  image.alt = product.name;

  if (images.length > 0) {
    image.src = images[0];
    main.appendChild(image);
  } else {
    const fallback = document.createElement("div");
    fallback.className = "detail-fallback-bottle";
    fallback.innerHTML = `<div class="perfume-bottle product-bottle"><div class="cap"></div><div class="label">${product.brand}</div></div>`;
    main.appendChild(fallback);
  }

  gallery.appendChild(main);

  if (images.length > 1) {
    const thumbs = document.createElement("div");
    thumbs.className = "detail-thumbs";
    images.forEach((imageUrl, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = index === 0 ? "active" : "";
      button.innerHTML = `<img src="${imageUrl}" alt="${product.name} imagen ${index + 1}">`;
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

function renderProductDetail(product) {
  currentProduct = product;
  selectedSize = product.price_5ml > 0 ? "5" : "3";
  quantity = 1;
  setDocumentTitle(product);

  const [accent, color] = getProfileColors(getProductProfileName(product));
  productDetail.style.setProperty("--accent", accent);
  productDetail.style.setProperty("--accent-solid", color);

  const gallery = renderProductImages(product);

  const info = document.createElement("article");
  info.className = "detail-info";
  info.innerHTML = `
    <nav class="breadcrumb" aria-label="Ruta del producto">
      <a href="index.html">Inicio</a><span>/</span><a href="catalogo.html">Catálogo</a><span>/</span><strong>${product.name}</strong>
    </nav>
    <div class="detail-badges">
      <span>${getProductCategoryName(product)}</span>
      <span>${getProductProfileName(product)}</span>
      ${product.featured ? "<span>★ Destacado</span>" : ""}
      ${isProductOnOffer(product) ? `<span class="offer-detail-badge">Oferta -${getProductDiscountPercent(product)}%</span>` : ""}
    </div>
    <p class="detail-brand">${product.brand}</p>
    <h1>${product.name}</h1>
    <p class="detail-description">${product.description}</p>
    <div class="detail-meta">
      <div><span>Perfil</span><strong>${product.tag || getProductProfileName(product)}</strong></div>
      <div><span>Stock</span><strong class="${product.stock === "Agotado" ? "danger" : "success"}">${product.stock || "Disponible"}</strong></div>
      <div><span>Cobertura</span><strong>Santiago, Chile</strong></div>
    </div>
    <div class="detail-price-row">
      <span>Precio formato seleccionado</span>
      <strong id="detailPrice"></strong>
    </div>
    <div class="detail-controls">
      <div>
        <span class="control-label">Formato</span>
        <div class="size-picker detail-size-picker">
          <button type="button" data-size="3">3ml</button>
          <button type="button" data-size="5">5ml</button>
          <button type="button" data-size="10">10ml</button>
        </div>
      </div>
      <div>
        <span class="control-label">Cantidad</span>
        <div class="qty-control detail-qty">
          <button type="button" data-qty="minus">−</button>
          <strong id="detailQuantity">1</strong>
          <button type="button" data-qty="plus">+</button>
        </div>
      </div>
    </div>
    <div class="detail-subtotal"><span>Total estimado</span><strong id="detailSubtotal">${formatPrice(getProductPrice(product, selectedSize))}</strong></div>
    <div class="detail-actions">
      <button class="btn primary" id="detailAddCart" type="button">Agregar al carrito</button>
      <a class="btn whatsapp" id="directWhatsapp" href="${getDirectWhatsappLink(product, selectedSize, quantity)}" target="_blank" rel="noopener">Consultar por WhatsApp</a>
    </div>
    <p class="detail-note">El pedido se confirma manualmente por WhatsApp: stock final, forma de pago y entrega.</p>
  `;

  productDetail.innerHTML = "";
  productDetail.appendChild(gallery);
  productDetail.appendChild(info);

  productDetail.querySelectorAll(".detail-size-picker button").forEach((button) => {
    if (button.dataset.size === selectedSize) button.classList.add("selected");
    button.addEventListener("click", () => {
      selectedSize = button.dataset.size;
      productDetail.querySelectorAll(".detail-size-picker button").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      updateProductPrice();
    });
  });

  productDetail.querySelectorAll("[data-qty]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.qty === "minus") quantity = Math.max(1, quantity - 1);
      if (button.dataset.qty === "plus") quantity += 1;
      productDetail.querySelector("#detailQuantity").textContent = quantity;
      updateProductPrice();
    });
  });

  updateProductPrice();

  const addButton = productDetail.querySelector("#detailAddCart");
  if (product.stock === "Agotado") {
    addButton.disabled = true;
    addButton.textContent = "Agotado";
  } else {
    addButton.addEventListener("click", () => {
      addToCart(product, selectedSize, quantity);
      openCart();
    });
  }
}

function renderRelatedProducts(product, allProducts) {
  const related = allProducts
    .filter((item) => item.id !== product.id)
    .filter(isProductActive)
    .filter((item) => item.category_id === product.category_id || item.profile_id === product.profile_id)
    .slice(0, 4);

  relatedGrid.innerHTML = "";
  if (related.length === 0) {
    relatedSection.classList.add("hidden");
    return;
  }

  related.forEach((item) => {
    const image = getPrimaryProductImage(item);
    const card = document.createElement("a");
    card.className = "related-card";
    card.href = `product.html?id=${encodeURIComponent(item.id)}`;
    card.innerHTML = `
      <div class="related-visual">
        ${image ? `<img src="${image}" alt="${item.name}">` : `<div class="perfume-bottle product-bottle"><div class="cap"></div><div class="label">${item.brand}</div></div>`}
      </div>
      <div>
        <span>${item.brand}</span>
        <strong>${item.name}</strong>
        <small>${isProductOnOffer(item) ? `Oferta -${getProductDiscountPercent(item)}% · ` : ""}${formatPrice(getProductPrice(item, "3"))} · 3ml</small>
      </div>
    `;
    relatedGrid.appendChild(card);
  });
  relatedSection.classList.remove("hidden");
}

async function loadProductPage() {
  const id = getProductIdFromUrl();
  if (!id) {
    renderMissingProduct("Falta el identificador del producto.");
    return;
  }

  try {
    const [product, allProducts] = await Promise.all([fetchProductById(id), fetchProducts()]);
    if (!product || !isProductActive(product)) {
      renderMissingProduct("Puede que haya sido eliminado o apagado temporalmente del catálogo.");
      return;
    }
    renderProductDetail(product);
    renderRelatedProducts(product, allProducts);
  } catch (error) {
    console.error(error);
    renderMissingProduct(error.message);
  }
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
    article.innerHTML = `<div class="cart-item-top"><div><strong>${item.name}</strong><br><small>${getCartItemSubtitle(item)}</small></div><strong>${formatPrice(Number(item.price) * item.quantity)}</strong></div><div class="cart-item-actions"><div class="qty-control"><button type="button" data-action="minus">−</button><strong>${item.quantity}</strong><button type="button" data-action="plus">+</button></div><button class="remove-item" type="button" data-action="remove">Quitar</button></div>`;
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
  const productLines = cart.map((item, index) => getCartLine(item, index));
  const message = ["Hola Essential Decant 👋", "Quiero consultar por este pedido:", "", ...productLines, "", `Total estimado: ${formatPrice(getTotal())}`, "", `Nombre: ${customerName}`, `Comuna/Sector: ${customerZone}`, `Comentario: ${customerNote}`, "", "¿Me confirmas disponibilidad, forma de pago y entrega?"].join("\n");
  sendWhatsapp.href = `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(message)}`;
  sendWhatsapp.classList.remove("disabled");
}
function openCart() { document.body.classList.add("cart-open"); cartDrawer.setAttribute("aria-hidden", "false"); }
function closeCart() { document.body.classList.remove("cart-open"); cartDrawer.setAttribute("aria-hidden", "true"); }

document.querySelector("#openCart").addEventListener("click", openCart);
document.querySelector("#closeCart").addEventListener("click", closeCart);
cartDrawer.addEventListener("click", (event) => { if (event.target === cartDrawer) closeCart(); });
document.querySelector("#clearCart").addEventListener("click", () => { cart = []; saveCart(cart); renderCart(); });
checkoutForm.addEventListener("input", updateWhatsappLink);

renderCart();
loadProductPage();

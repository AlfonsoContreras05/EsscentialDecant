const FALLBACK_FEATURED = [
  {
    id: null,
    name: "Prueba tus favoritos",
    brand: "Essential Decant",
    profile: { name: "3ml · 5ml · 10ml" },
    image_url_1: "assets/perfume_demo_1.jpg"
  },
  {
    id: null,
    name: "Discovery sets",
    brand: "Selecciones a pedido",
    profile: { name: "Fresco · Dulce · Árabe" },
    image_url_1: "assets/perfume_demo_2.jpg"
  },
  {
    id: null,
    name: "Perfumes originales",
    brand: "Santiago, Chile",
    profile: { name: "Pedidos por WhatsApp" },
    image_url_1: "assets/perfume_demo_3.jpg"
  }
];

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getCarouselImage(product) {
  if (typeof getPrimaryProductImage === "function") return getPrimaryProductImage(product);
  return product.image_url_1 || product.image_url_2 || product.image_url_3 || null;
}

function getCarouselProfile(product) {
  if (typeof getProductProfileName === "function") return getProductProfileName(product);
  return product.profile?.name || product.tag || "Essential Decant";
}

function uniqueById(products) {
  const used = new Set();
  return products.filter((product) => {
    const key = product.id || `${product.name}-${product.brand}`;
    if (used.has(key)) return false;
    used.add(key);
    return true;
  });
}

function selectFeaturedProducts(products = []) {
  const withImage = products.filter((product) => isProductActive(product)).filter((product) => getCarouselImage(product));
  const featured = withImage.filter((product) => product.featured);
  const ordered = uniqueById([...featured, ...withImage]).slice(0, 3);

  if (ordered.length >= 3) return ordered;

  return [...ordered, ...FALLBACK_FEATURED].slice(0, 3);
}

function renderFeaturedCarousel(products) {
  const container = document.querySelector("#featuredCarousel");
  if (!container) return;

  const selected = selectFeaturedProducts(products);

  if (!selected.length) {
    container.innerHTML = '<div class="featured-carousel-empty">Aún no hay productos destacados para mostrar.</div>';
    return;
  }

  const radios = selected.map((_, index) => `
    <input class="featured-carousel-input" type="radio" name="featured-slider" id="featured-item-${index + 1}" ${index === 0 ? "checked" : ""}>
  `).join("");

  const cards = selected.map((product, index) => {
    const position = index + 1;
    const image = getCarouselImage(product);
    const detailUrl = product.id ? `product.html?id=${encodeURIComponent(product.id)}` : "catalogo.html";
    const brand = escapeHTML(product.brand || "Essential Decant");
    const name = escapeHTML(product.name || "Producto destacado");
    const profile = escapeHTML(getCarouselProfile(product));

    return `
      <label class="featured-card" for="featured-item-${position}" id="featured-selector-${position}" data-position="${position}" data-url="${detailUrl}" tabindex="0" role="button" aria-label="Ver ${name}">
        <img src="${image}" alt="${name}" loading="lazy">
        <span class="featured-card-info">
          <span class="featured-card-text">
            <span class="featured-card-kicker">${isProductOnOffer(product) ? `Oferta -${getProductDiscountPercent(product)}%` : brand}</span>
            <strong>${name}</strong>
            <small>${profile}</small>
          </span>
          <span class="featured-card-cta">Ver detalle</span>
        </span>
      </label>
    `;
  }).join("");

  container.innerHTML = `${radios}<div class="featured-carousel-stage">${cards}</div>`;
  setupFeaturedCarousel();
}

function setupFeaturedCarousel() {
  const shell = document.querySelector("#featuredCarousel");
  if (!shell) return;

  const cards = [...shell.querySelectorAll(".featured-card")];
  const radios = [...shell.querySelectorAll(".featured-carousel-input")];
  if (!cards.length || !radios.length) return;

  let autoTimer = null;

  function activeIndex() {
    return Math.max(0, radios.findIndex((radio) => radio.checked));
  }

  function goTo(index) {
    const next = ((index % radios.length) + radios.length) % radios.length;
    radios[next].checked = true;
  }

  cards.forEach((card, index) => {
    card.addEventListener("click", (event) => {
      const isActive = activeIndex() === index;
      if (isActive) {
        event.preventDefault();
        const url = card.dataset.url || "catalogo.html";
        window.location.href = url;
      }
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const isActive = activeIndex() === index;
      if (isActive) window.location.href = card.dataset.url || "catalogo.html";
      else goTo(index);
    });
  });

  function startAuto() {
    stopAuto();
    autoTimer = window.setInterval(() => goTo(activeIndex() + 1), 4200);
  }

  function stopAuto() {
    if (autoTimer) window.clearInterval(autoTimer);
    autoTimer = null;
  }

  shell.addEventListener("mouseenter", stopAuto);
  shell.addEventListener("mouseleave", startAuto);
  shell.addEventListener("focusin", stopAuto);
  shell.addEventListener("focusout", startAuto);
  startAuto();
}

async function loadFeaturedCarousel() {
  try {
    const products = await fetchProducts();
    renderFeaturedCarousel(products);
  } catch (error) {
    console.warn("No se pudieron cargar destacados desde Supabase:", error.message);
    renderFeaturedCarousel(FALLBACK_FEATURED);
  }
}

loadFeaturedCarousel();


async function renderHomeBanner() {
  const slot = document.querySelector("#homeBannerSlot");
  const image = document.querySelector("#homeBannerImage");
  const placeholder = document.querySelector("#homeBannerPlaceholder");
  if (!slot || !image) return;
  try {
    const settings = await fetchSiteSettings();
    const bannerUrl = settings?.home_banner_image_url || "";
    if (bannerUrl) {
      image.src = bannerUrl;
      image.classList.add("visible");
      slot.classList.add("has-banner-image");
      placeholder?.classList.add("hidden");
    } else {
      image.removeAttribute("src");
      image.classList.remove("visible");
      slot.classList.remove("has-banner-image");
      placeholder?.classList.remove("hidden");
    }
  } catch (error) {
    console.warn("No se pudo cargar el banner promocional:", error.message);
  }
}

renderHomeBanner();


/* V6.7 — Packs reales en portada con imagen propia */
function renderHomePackCard(pack) {
  const url = `pack.html?id=${encodeURIComponent(pack.id)}`;
  const image = getPrimaryPackImage(pack);
  const defaultSize = getDefaultPackSize(pack);
  return `
    <article class="home-pack-card home-pack-card-image ${pack.featured ? 'is-featured' : ''}">
      <a href="${url}" aria-label="Ver pack ${escapeHTML(pack.name)}">
        <span class="home-pack-visual">
          ${image ? `<img src="${image}" alt="${escapeHTML(pack.name)}" loading="lazy">` : `<i>PACK</i>`}
        </span>
        <span class="home-pack-content">
          <span class="home-pack-tag">${escapeHTML(pack.tag || 'Pack Essential')}</span>
          <strong>${escapeHTML(pack.name || 'Pack Essential Decant')}</strong>
          <small>Desde ${defaultSize}ml · ${formatPrice(getPackPrice(pack, defaultSize))}</small>
        </span>
      </a>
    </article>
  `;
}

async function loadHomePacks() {
  const container = document.querySelector('#homePacksGrid');
  if (!container || typeof fetchPacks !== 'function') return;
  try {
    const packs = await fetchPacks();
    const activePacks = packs
      .filter(isPackActive)
      .sort((a, b) => Number(b.featured) - Number(a.featured) || Number(a.order_index || 999) - Number(b.order_index || 999))
      .slice(0, 4);

    if (!activePacks.length) return;
    container.innerHTML = activePacks.map(renderHomePackCard).join('');
  } catch (error) {
    console.warn('No se pudieron cargar packs en portada:', error.message);
  }
}

loadHomePacks();

const loginScreen = document.querySelector("#loginScreen");
const adminApp = document.querySelector("#adminApp");
const loginForm = document.querySelector("#loginForm");
const emailInput = document.querySelector("#adminEmail");
const passwordInput = document.querySelector("#adminPassword");
const logoutButton = document.querySelector("#logoutButton");
const reloadDataButton = document.querySelector("#reloadData");

const heroForm = document.querySelector("#heroForm");
const heroImageInput = document.querySelector("#heroImage");
const heroImagePreview = document.querySelector("#heroImagePreview");
const removeHeroImageButton = document.querySelector("#removeHeroImage");

const form = document.querySelector("#productForm");
const formTitle = document.querySelector("#formTitle");
const resetFormButton = document.querySelector("#resetForm");
const adminProductList = document.querySelector("#adminProductList");

const categorySelect = document.querySelector("#categorySelect");
const profileSelect = document.querySelector("#profileSelect");
const categoryForm = document.querySelector("#categoryForm");
const profileForm = document.querySelector("#profileForm");
const categoryList = document.querySelector("#categoryList");
const profileList = document.querySelector("#profileList");
const packForm = document.querySelector("#packForm");
const packFormTitle = document.querySelector("#packFormTitle");
const resetPackFormButton = document.querySelector("#resetPackForm");
const adminPackList = document.querySelector("#adminPackList");
const packProductSelect = document.querySelector("#packProductSelect");
const packSizeSelect = document.querySelector("#packSizeSelect");
const packQuantityInput = document.querySelector("#packQuantityInput");
const addPackItemButton = document.querySelector("#addPackItem");
const packItemsDraftNode = document.querySelector("#packItemsDraft");

let products = [];
let packs = [];
let packItemsDraft = [];
let categories = [];
let profiles = [];
let siteSettings = { hero_image_url: null };
let currentImages = { 1: "", 2: "", 3: "" };
let selectedImageBlobs = { 1: null, 2: null, 3: null };
let currentHeroImage = "";
let selectedHeroBlob = null;

function showAdmin() { loginScreen.classList.add("hidden"); adminApp.classList.remove("hidden"); }
function showLogin() { loginScreen.classList.remove("hidden"); adminApp.classList.add("hidden"); }

async function checkAuth() {
  try {
    const session = await getCurrentSession();
    if (session) { showAdmin(); await loadAdminData(); }
    else showLogin();
  } catch (error) {
    console.error(error);
    showLogin();
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await signInAdmin(emailInput.value.trim(), passwordInput.value);
    passwordInput.value = "";
    showAdmin();
    await loadAdminData();
  } catch (error) {
    alert(`No se pudo iniciar sesión: ${error.message}`);
  }
});

logoutButton.addEventListener("click", async () => {
  try { await signOutAdmin(); } catch (error) { console.error(error); }
  showLogin();
});

reloadDataButton?.addEventListener("click", loadAdminData);

async function loadAdminData() {
  try {
    [categories, profiles, products, siteSettings, packs] = await Promise.all([fetchCategories(), fetchProfiles(), fetchProducts(), fetchSiteSettings(), fetchPacks()]);
    renderHeroSettings();
    renderTaxonomies();
    renderAdminProducts();
    renderPackProductOptions();
    renderAdminPacks();
    renderTaxonomySelects();
  } catch (error) {
    alert(`No se pudieron cargar los datos: ${error.message}`);
  }
}

function compressImage(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve({ blob: null, preview: "" }); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(image, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error("No se pudo comprimir la imagen.")); return; }
          resolve({ blob, preview: canvas.toDataURL("image/jpeg", quality) });
        }, "image/jpeg", quality);
      };
      image.onerror = () => reject(new Error("No se pudo procesar la imagen."));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function setImagePreview(slot, imageUrl) {
  currentImages[slot] = imageUrl || "";
  const preview = document.querySelector(`#imagePreview${slot}`);
  const removeButton = document.querySelector(`[data-remove-image="${slot}"]`);
  if (!preview || !removeButton) return;
  if (currentImages[slot]) {
    preview.src = currentImages[slot];
    preview.classList.add("visible");
    removeButton.classList.add("visible");
  } else {
    preview.removeAttribute("src");
    preview.classList.remove("visible");
    removeButton.classList.remove("visible");
  }
}

function resetProductImages() {
  selectedImageBlobs = { 1: null, 2: null, 3: null };
  currentImages = { 1: "", 2: "", 3: "" };
  [1, 2, 3].forEach((slot) => {
    setImagePreview(slot, "");
    const input = document.querySelector(`[name="image${slot}"]`);
    if (input) input.value = "";
  });
}

function resetForm() {
  form.reset();
  form.elements.id.value = "";
  form.elements.discountPercent.value = 0;
  form.elements.isActive.checked = true;
  formTitle.textContent = "Agregar producto";
  resetProductImages();
  renderTaxonomySelects();
}

function renderHeroSettings() {
  currentHeroImage = siteSettings.hero_image_url || "";
  selectedHeroBlob = null;
  if (!heroImagePreview || !removeHeroImageButton) return;
  if (currentHeroImage) {
    heroImagePreview.src = currentHeroImage;
    heroImagePreview.classList.add("visible");
    removeHeroImageButton.classList.add("visible");
  } else {
    heroImagePreview.removeAttribute("src");
    heroImagePreview.classList.remove("visible");
    removeHeroImageButton.classList.remove("visible");
  }
  if (heroImageInput) heroImageInput.value = "";
}

heroImageInput?.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { alert("La imagen pesa mucho. Intenta usar una menor a 5MB."); heroImageInput.value = ""; return; }
  try {
    const { blob, preview } = await compressImage(file, 1400, 0.84);
    selectedHeroBlob = blob;
    heroImagePreview.src = preview;
    heroImagePreview.classList.add("visible");
    removeHeroImageButton.classList.add("visible");
  } catch (error) { alert(error.message); }
});

heroForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    let heroUrl = currentHeroImage;
    if (selectedHeroBlob) heroUrl = await uploadHeroImage(selectedHeroBlob);
    siteSettings = await updateSiteSettings({ hero_image_url: heroUrl || null });
    selectedHeroBlob = null;
    renderHeroSettings();
    alert("Imagen de portada guardada.");
  } catch (error) { alert(`No se pudo guardar la portada: ${error.message}`); }
});

removeHeroImageButton?.addEventListener("click", async () => {
  const confirmRemove = confirm("¿Quitar la imagen de portada?");
  if (!confirmRemove) return;
  try {
    siteSettings = await updateSiteSettings({ hero_image_url: null });
    selectedHeroBlob = null;
    currentHeroImage = "";
    renderHeroSettings();
  } catch (error) { alert(`No se pudo quitar la imagen: ${error.message}`); }
});

function renderTaxonomySelects() {
  const selectedCategory = form.elements.category_id?.value;
  const selectedProfile = form.elements.profile_id?.value;
  categorySelect.innerHTML = "";
  profileSelect.innerHTML = "";
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
  profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.name;
    profileSelect.appendChild(option);
  });
  if (selectedCategory && [...categorySelect.options].some((option) => option.value === selectedCategory)) categorySelect.value = selectedCategory;
  if (selectedProfile && [...profileSelect.options].some((option) => option.value === selectedProfile)) profileSelect.value = selectedProfile;
}

function renderTaxonomies() { renderTaxonomySelects(); renderTaxonomyList("category"); renderTaxonomyList("profile"); }
function renderTaxonomyList(type) {
  const isCategory = type === "category";
  const list = isCategory ? categoryList : profileList;
  const items = isCategory ? categories : profiles;
  const usedValues = new Set(products.map((product) => isCategory ? product.category_id : product.profile_id));
  list.innerHTML = "";
  items.forEach((item, index) => {
    const row = document.createElement("div");
    const isUsed = usedValues.has(item.id);
    row.className = "taxonomy-row";
    row.innerHTML = `<input value="${item.name}" aria-label="Editar ${item.name}"><div class="taxonomy-actions"><button type="button" data-action="save">Guardar</button><button type="button" data-action="up" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" data-action="down" ${index === items.length - 1 ? "disabled" : ""}>↓</button><button type="button" data-action="delete" class="delete-taxonomy" title="${isUsed ? "Está en uso: cambia primero los productos asociados" : "Eliminar"}">Eliminar</button></div>`;
    row.querySelector('[data-action="save"]').addEventListener("click", () => renameTaxonomyItem(type, item.id, row.querySelector("input").value));
    row.querySelector('[data-action="up"]').addEventListener("click", () => moveTaxonomyItem(type, index, -1));
    row.querySelector('[data-action="down"]').addEventListener("click", () => moveTaxonomyItem(type, index, 1));
    row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteTaxonomyItem(type, item.id));
    list.appendChild(row);
  });
}
async function addTaxonomyItem(type, name) {
  const cleanName = name.trim();
  if (!cleanName) return;
  try { if (type === "category") await createCategory(cleanName); else await createProfile(cleanName); await loadAdminData(); }
  catch (error) { alert(`No se pudo crear: ${error.message}`); }
}
async function renameTaxonomyItem(type, id, name) {
  const cleanName = name.trim();
  if (!cleanName) { alert("El nombre no puede quedar vacío."); return; }
  try { if (type === "category") await updateCategory(id, { name: cleanName }); else await updateProfile(id, { name: cleanName }); await loadAdminData(); }
  catch (error) { alert(`No se pudo guardar: ${error.message}`); }
}
async function moveTaxonomyItem(type, index, direction) {
  const items = type === "category" ? categories : profiles;
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= items.length) return;
  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(newIndex, 0, item);
  try {
    await Promise.all(nextItems.map((currentItem, currentIndex) => type === "category" ? updateCategoryOrder(currentItem.id, currentIndex + 1) : updateProfileOrder(currentItem.id, currentIndex + 1)));
    await loadAdminData();
  } catch (error) { alert(`No se pudo ordenar: ${error.message}`); }
}
async function deleteTaxonomyItem(type, id) {
  const isCategory = type === "category";
  const usedProducts = products.filter((product) => isCategory ? product.category_id === id : product.profile_id === id);
  if (usedProducts.length > 0) {
    const sample = usedProducts
      .slice(0, 4)
      .map((product) => `• ${product.name}`)
      .join("\n");

    alert(
      `No se puede eliminar porque está en uso por ${usedProducts.length} producto(s).` +
      `\n\nPrimero edita esos productos y asígnales otra ${isCategory ? "categoría" : "perfil olfativo"}.` +
      `\n\n${sample}${usedProducts.length > 4 ? "\n• ..." : ""}`
    );
    return;
  }
  const confirmDelete = confirm("¿Eliminar esta clasificación?");
  if (!confirmDelete) return;
  try { if (type === "category") await deleteCategory(id); else await deleteProfile(id); await loadAdminData(); }
  catch (error) { alert(`No se pudo eliminar: ${error.message}`); }
}
categoryForm.addEventListener("submit", async (event) => { event.preventDefault(); await addTaxonomyItem("category", new FormData(categoryForm).get("name")); categoryForm.reset(); });
profileForm.addEventListener("submit", async (event) => { event.preventDefault(); await addTaxonomyItem("profile", new FormData(profileForm).get("name")); profileForm.reset(); });

function renderAdminProducts() {
  adminProductList.innerHTML = "";
  if (products.length === 0) { adminProductList.innerHTML = `<div class="empty-state"><strong>No hay productos.</strong><span>Puedes crear uno nuevo desde el formulario.</span></div>`; return; }
  products.forEach((product, index) => {
    const article = document.createElement("article");
    article.className = "admin-product-card";
    const [, color] = getProfileColors(getProductProfileName(product));
    const firstImage = getPrimaryProductImage(product);
    const imageBlock = firstImage ? `<img src="${firstImage}" alt="${product.name}">` : `<div class="admin-fake-bottle" style="--accent-solid:${color}"></div>`;
    const imageCount = getProductImages(product).length;
    const active = isProductActive(product);
    const discount = getProductDiscountPercent(product);
    article.classList.toggle("inactive-product", !active);
    article.classList.toggle("offer-product", discount > 0);
    article.innerHTML = `<div class="admin-product-img">${imageBlock}</div><div class="admin-product-info"><strong>${product.featured ? "★ " : ""}${product.name}</strong><span>${product.brand} · ${product.tag}</span><small>${active ? "Activo" : "Apagado"} · ${discount ? `Oferta ${discount}% · ` : ""}${product.stock} · ${getProductCategoryName(product)} · ${getProductProfileName(product)} · ${imageCount}/3 imágenes · 3ml ${formatPrice(product.price_3ml)} · 5ml ${formatPrice(product.price_5ml)} · 10ml ${formatPrice(product.price_10ml)}</small></div><div class="admin-product-actions"><button type="button" data-action="up" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" data-action="down" ${index === products.length - 1 ? "disabled" : ""}>↓</button><button type="button" data-action="active">${active ? "Apagar" : "Activar"}</button><button type="button" data-action="featured">${product.featured ? "Quitar destacado" : "Destacar"}</button><button type="button" data-action="edit">Editar</button><button type="button" data-action="delete">Eliminar</button></div>`;
    article.querySelector('[data-action="up"]').addEventListener("click", () => moveProduct(index, -1));
    article.querySelector('[data-action="down"]').addEventListener("click", () => moveProduct(index, 1));
    article.querySelector('[data-action="active"]').addEventListener("click", () => toggleProductActive(product.id));
    article.querySelector('[data-action="featured"]').addEventListener("click", () => toggleFeatured(product.id));
    article.querySelector('[data-action="edit"]').addEventListener("click", () => editProduct(product.id));
    article.querySelector('[data-action="delete"]').addEventListener("click", () => removeProduct(product.id));
    adminProductList.appendChild(article);
  });
}
async function moveProduct(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= products.length) return;
  const nextProducts = [...products];
  const [movedProduct] = nextProducts.splice(index, 1);
  nextProducts.splice(newIndex, 0, movedProduct);
  try { await Promise.all(nextProducts.map((product, productIndex) => updateProductOrder(product.id, productIndex + 1))); await loadAdminData(); }
  catch (error) { alert(`No se pudo ordenar: ${error.message}`); }
}
async function toggleFeatured(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  try { await saveProduct({ ...product, featured: !product.featured }); await loadAdminData(); }
  catch (error) { alert(`No se pudo destacar: ${error.message}`); }
}
async function toggleProductActive(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  const nextActive = !isProductActive(product);
  try { await saveProduct({ ...product, is_active: nextActive }); await loadAdminData(); }
  catch (error) { alert(`No se pudo ${nextActive ? "activar" : "apagar"} el producto: ${error.message}`); }
}
function editProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  formTitle.textContent = "Editar producto";
  form.elements.id.value = product.id;
  form.elements.name.value = product.name;
  form.elements.brand.value = product.brand;
  form.elements.category_id.value = product.category_id;
  form.elements.profile_id.value = product.profile_id;
  form.elements.tag.value = product.tag;
  form.elements.stock.value = product.stock;
  form.elements.discountPercent.value = getProductDiscountPercent(product);
  form.elements.isActive.checked = isProductActive(product);
  form.elements.price3.value = product.price_3ml;
  form.elements.price5.value = product.price_5ml;
  form.elements.price10.value = product.price_10ml;
  form.elements.description.value = product.description;
  form.elements.featured.checked = product.featured;
  selectedImageBlobs = { 1: null, 2: null, 3: null };
  setImagePreview(1, product.image_url_1 || "");
  setImagePreview(2, product.image_url_2 || "");
  setImagePreview(3, product.image_url_3 || "");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
async function removeProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  const confirmDelete = confirm(`¿Eliminar "${product.name}" del catálogo?`);
  if (!confirmDelete) return;
  try { await deleteProduct(id); await loadAdminData(); resetForm(); }
  catch (error) { alert(`No se pudo eliminar: ${error.message}`); }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const id = formData.get("id");
  const name = formData.get("name").trim();
  const existingProduct = products.find((product) => product.id === id);
  try {
    const imageUrls = { 1: currentImages[1] || null, 2: currentImages[2] || null, 3: currentImages[3] || null };
    for (const slot of [1, 2, 3]) if (selectedImageBlobs[slot]) imageUrls[slot] = await uploadProductImage(selectedImageBlobs[slot], name, slot);
    await saveProduct({
      id: id || null,
      name,
      brand: formData.get("brand").trim(),
      category_id: formData.get("category_id"),
      profile_id: formData.get("profile_id"),
      tag: formData.get("tag").trim(),
      stock: formData.get("stock"),
      featured: formData.get("featured") === "on",
      is_active: formData.get("isActive") === "on",
      discount_percent: Number(formData.get("discountPercent") || 0),
      order_index: existingProduct?.order_index || products.length + 1,
      description: formData.get("description").trim(),
      price_3ml: Number(formData.get("price3")),
      price_5ml: Number(formData.get("price5")),
      price_10ml: Number(formData.get("price10")),
      image_url_1: imageUrls[1],
      image_url_2: imageUrls[2],
      image_url_3: imageUrls[3]
    });
    await loadAdminData();
    resetForm();
  } catch (error) { alert(`No se pudo guardar el producto: ${error.message}`); }
});

[1, 2, 3].forEach((slot) => {
  const input = document.querySelector(`[name="image${slot}"]`);
  const removeButton = document.querySelector(`[data-remove-image="${slot}"]`);
  input?.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("La imagen pesa mucho. Intenta usar una menor a 5MB."); input.value = ""; return; }
    try { const { blob, preview } = await compressImage(file); selectedImageBlobs[slot] = blob; setImagePreview(slot, preview); }
    catch (error) { alert(error.message); }
  });
  removeButton?.addEventListener("click", () => { input.value = ""; selectedImageBlobs[slot] = null; setImagePreview(slot, ""); });
});



function renderPackProductOptions() {
  if (!packProductSelect) return;
  const currentValue = packProductSelect.value;
  packProductSelect.innerHTML = "";
  products
    .filter(isProductActive)
    .forEach((product) => {
      const option = document.createElement("option");
      option.value = product.id;
      option.textContent = `${product.brand} · ${product.name}`;
      packProductSelect.appendChild(option);
    });
  if (currentValue && [...packProductSelect.options].some((option) => option.value === currentValue)) packProductSelect.value = currentValue;
}

function resetPackForm() {
  if (!packForm) return;
  packForm.reset();
  packForm.elements.id.value = "";
  packForm.elements.isActive.checked = true;
  packFormTitle.textContent = "Diseñar pack";
  packItemsDraft = [];
  renderPackItemsDraft();
  renderPackProductOptions();
}

function getDraftProductName(item) {
  const product = products.find((currentProduct) => currentProduct.id === item.product_id) || item.product;
  return product ? `${product.brand} · ${product.name}` : "Producto";
}

function renderPackItemsDraft() {
  if (!packItemsDraftNode) return;
  packItemsDraftNode.innerHTML = "";
  if (!packItemsDraft.length) {
    packItemsDraftNode.innerHTML = `<div class="empty-pack-items">Aún no hay productos en este pack.</div>`;
    return;
  }
  packItemsDraft.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "pack-draft-row";
    row.innerHTML = `<span><strong>${item.quantity}x</strong> ${getDraftProductName(item)} <em>${item.size_ml}ml</em></span><div><button type="button" data-action="up" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" data-action="down" ${index === packItemsDraft.length - 1 ? "disabled" : ""}>↓</button><button type="button" data-action="remove">Quitar</button></div>`;
    row.querySelector('[data-action="remove"]').addEventListener("click", () => { packItemsDraft.splice(index, 1); renderPackItemsDraft(); });
    row.querySelector('[data-action="up"]').addEventListener("click", () => moveDraftPackItem(index, -1));
    row.querySelector('[data-action="down"]').addEventListener("click", () => moveDraftPackItem(index, 1));
    packItemsDraftNode.appendChild(row);
  });
}

function moveDraftPackItem(index, direction) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= packItemsDraft.length) return;
  const [item] = packItemsDraft.splice(index, 1);
  packItemsDraft.splice(nextIndex, 0, item);
  renderPackItemsDraft();
}

addPackItemButton?.addEventListener("click", () => {
  const productId = packProductSelect?.value;
  if (!productId) { alert("Primero selecciona un producto para el pack."); return; }
  const product = products.find((item) => item.id === productId);
  const quantity = Math.max(1, Number(packQuantityInput?.value || 1));
  const sizeMl = Number(packSizeSelect?.value || 5);
  packItemsDraft.push({ product_id: productId, product, size_ml: sizeMl, quantity });
  renderPackItemsDraft();
});

function renderAdminPacks() {
  if (!adminPackList) return;
  adminPackList.innerHTML = "";
  if (!packs.length) {
    adminPackList.innerHTML = `<div class="empty-state"><strong>No hay packs.</strong><span>Diseña el primero desde el formulario de packs.</span></div>`;
    return;
  }
  packs.forEach((pack, index) => {
    const article = document.createElement("article");
    article.className = "admin-product-card admin-pack-card";
    const active = isPackActive(pack);
    article.classList.toggle("inactive-product", !active);
    const firstImage = (pack.items || []).map((item) => item.product).filter(Boolean).map(getPrimaryProductImage).find(Boolean);
    const imageBlock = firstImage ? `<img src="${firstImage}" alt="${pack.name}">` : `<div class="admin-fake-bottle" style="--accent-solid:rgba(232,194,111,.85)"></div>`;
    article.innerHTML = `
      <div class="admin-product-img">${imageBlock}</div>
      <div class="admin-product-info">
        <strong>${pack.featured ? "★ " : ""}${pack.name}</strong>
        <span>${pack.tag || "Pack"} · ${formatPrice(pack.price)}</span>
        <small>${active ? "Activo" : "Apagado"} · ${(pack.items || []).length} producto(s) · ${getPackItemsText(pack)}</small>
      </div>
      <div class="admin-product-actions">
        <button type="button" data-action="up" ${index === 0 ? "disabled" : ""}>↑</button>
        <button type="button" data-action="down" ${index === packs.length - 1 ? "disabled" : ""}>↓</button>
        <button type="button" data-action="active">${active ? "Apagar" : "Activar"}</button>
        <button type="button" data-action="edit">Editar</button>
        <button type="button" data-action="delete">Eliminar</button>
      </div>
    `;
    article.querySelector('[data-action="up"]').addEventListener("click", () => movePack(index, -1));
    article.querySelector('[data-action="down"]').addEventListener("click", () => movePack(index, 1));
    article.querySelector('[data-action="active"]').addEventListener("click", () => togglePackActive(pack.id));
    article.querySelector('[data-action="edit"]').addEventListener("click", () => editPack(pack.id));
    article.querySelector('[data-action="delete"]').addEventListener("click", () => removePack(pack.id));
    adminPackList.appendChild(article);
  });
}

async function movePack(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= packs.length) return;
  const nextPacks = [...packs];
  const [movedPack] = nextPacks.splice(index, 1);
  nextPacks.splice(newIndex, 0, movedPack);
  try { await Promise.all(nextPacks.map((pack, packIndex) => updatePackOrder(pack.id, packIndex + 1))); await loadAdminData(); }
  catch (error) { alert(`No se pudo ordenar el pack: ${error.message}`); }
}

async function togglePackActive(id) {
  const pack = packs.find((item) => item.id === id);
  if (!pack) return;
  try { await savePack({ ...pack, is_active: !isPackActive(pack), items: pack.items || [] }); await loadAdminData(); }
  catch (error) { alert(`No se pudo cambiar el estado del pack: ${error.message}`); }
}

function editPack(id) {
  const pack = packs.find((item) => item.id === id);
  if (!pack || !packForm) return;
  packFormTitle.textContent = "Editar pack";
  packForm.elements.id.value = pack.id;
  packForm.elements.name.value = pack.name || "";
  packForm.elements.tag.value = pack.tag || "";
  packForm.elements.price.value = pack.price || 0;
  packForm.elements.description.value = pack.description || "";
  packForm.elements.isActive.checked = isPackActive(pack);
  packForm.elements.featured.checked = Boolean(pack.featured);
  packItemsDraft = (pack.items || []).map((item) => ({
    product_id: item.product_id,
    product: item.product,
    size_ml: Number(item.size_ml || 5),
    quantity: Number(item.quantity || 1)
  }));
  renderPackItemsDraft();
  document.querySelector("#packAdminPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function removePack(id) {
  const pack = packs.find((item) => item.id === id);
  if (!pack) return;
  const confirmDelete = confirm(`¿Eliminar el pack "${pack.name}"?`);
  if (!confirmDelete) return;
  try { await deletePack(id); await loadAdminData(); resetPackForm(); }
  catch (error) { alert(`No se pudo eliminar el pack: ${error.message}`); }
}

packForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(packForm);
  const id = formData.get("id");
  const name = formData.get("name")?.trim();
  if (!name) { alert("El pack necesita un nombre."); return; }
  if (!packItemsDraft.length) { alert("Agrega al menos un producto al pack."); return; }
  const existingPack = packs.find((pack) => pack.id === id);
  try {
    await savePack({
      id: id || null,
      name,
      tag: formData.get("tag")?.trim(),
      description: formData.get("description")?.trim(),
      price: Number(formData.get("price") || 0),
      is_active: formData.get("isActive") === "on",
      featured: formData.get("featured") === "on",
      order_index: existingPack?.order_index || packs.length + 1,
      items: packItemsDraft
    });
    await loadAdminData();
    resetPackForm();
  } catch (error) {
    alert(`No se pudo guardar el pack: ${error.message}`);
  }
});

resetPackFormButton?.addEventListener("click", resetPackForm);
renderPackItemsDraft();

resetFormButton.addEventListener("click", resetForm);
checkAuth();

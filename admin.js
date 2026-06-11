const loginScreen = document.querySelector("#loginScreen");
const adminApp = document.querySelector("#adminApp");
const loginForm = document.querySelector("#loginForm");
const passwordInput = document.querySelector("#adminPassword");
const logoutButton = document.querySelector("#logoutButton");

const form = document.querySelector("#productForm");
const formTitle = document.querySelector("#formTitle");
const imagePreview = document.querySelector("#imagePreview");
const removeImageButton = document.querySelector("#removeImage");
const resetFormButton = document.querySelector("#resetForm");
const resetDefaultsButton = document.querySelector("#resetDefaults");
const adminProductList = document.querySelector("#adminProductList");
const exportCatalogButton = document.querySelector("#exportCatalog");
const importCatalogInput = document.querySelector("#importCatalog");

const categorySelect = document.querySelector("#categorySelect");
const profileSelect = document.querySelector("#profileSelect");
const categoryForm = document.querySelector("#categoryForm");
const profileForm = document.querySelector("#profileForm");
const categoryList = document.querySelector("#categoryList");
const profileList = document.querySelector("#profileList");

let products = getProducts();
let currentImage = "";

function showAdmin() {
  loginScreen.classList.add("hidden");
  adminApp.classList.remove("hidden");
  renderTaxonomies();
  renderAdminProducts();
}

function showLogin() {
  loginScreen.classList.remove("hidden");
  adminApp.classList.add("hidden");
}

function checkAuth() {
  if (isAdminAuthenticated()) {
    showAdmin();
  } else {
    showLogin();
  }
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (passwordInput.value === ADMIN_PASSWORD) {
    setAdminAuthenticated(true);
    passwordInput.value = "";
    showAdmin();
    return;
  }

  alert("Clave incorrecta.");
});

logoutButton.addEventListener("click", () => {
  setAdminAuthenticated(false);
  showLogin();
});

function compressImage(file, maxWidth = 900, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(currentImage);
      return;
    }

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

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      image.onerror = () => reject(new Error("No se pudo procesar la imagen."));
      image.src = reader.result;
    };

    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function setPreview(image) {
  currentImage = image || "";

  if (currentImage) {
    imagePreview.src = currentImage;
    imagePreview.classList.add("visible");
    removeImageButton.classList.add("visible");
  } else {
    imagePreview.removeAttribute("src");
    imagePreview.classList.remove("visible");
    removeImageButton.classList.remove("visible");
  }
}

function resetForm() {
  form.reset();
  form.elements.id.value = "";
  formTitle.textContent = "Agregar producto";
  setPreview("");
  renderTaxonomySelects();
}

function renderTaxonomySelects() {
  const selectedCategory = form.elements.category.value;
  const selectedProfile = form.elements.profile.value;

  categorySelect.innerHTML = "";
  profileSelect.innerHTML = "";

  getCategories().forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });

  getProfiles().forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.name;
    profileSelect.appendChild(option);
  });

  if (selectedCategory && [...categorySelect.options].some((option) => option.value === selectedCategory)) {
    categorySelect.value = selectedCategory;
  }

  if (selectedProfile && [...profileSelect.options].some((option) => option.value === selectedProfile)) {
    profileSelect.value = selectedProfile;
  }
}

function renderTaxonomies() {
  renderTaxonomySelects();
  renderTaxonomyList("category");
  renderTaxonomyList("profile");
}

function renderTaxonomyList(type) {
  const isCategory = type === "category";
  const list = isCategory ? categoryList : profileList;
  const items = isCategory ? getCategories() : getProfiles();
  const usedValues = new Set(getProducts().map((product) => isCategory ? product.category : product.profile));

  list.innerHTML = "";

  items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "taxonomy-row";
    row.innerHTML = `
      <input value="${item.name}" aria-label="Editar ${item.name}">
      <div class="taxonomy-actions">
        <button type="button" data-action="save">Guardar</button>
        <button type="button" data-action="up" ${index === 0 ? "disabled" : ""}>↑</button>
        <button type="button" data-action="down" ${index === items.length - 1 ? "disabled" : ""}>↓</button>
        <button type="button" data-action="delete" ${usedValues.has(item.id) ? "disabled" : ""}>Eliminar</button>
      </div>
    `;

    row.querySelector('[data-action="save"]').addEventListener("click", () => renameTaxonomyItem(type, item.id, row.querySelector("input").value));
    row.querySelector('[data-action="up"]').addEventListener("click", () => moveTaxonomyItem(type, index, -1));
    row.querySelector('[data-action="down"]').addEventListener("click", () => moveTaxonomyItem(type, index, 1));
    row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteTaxonomyItem(type, item.id));

    list.appendChild(row);
  });
}

function addTaxonomyItem(type, name) {
  const cleanName = name.trim();
  if (!cleanName) return;

  const items = type === "category" ? getCategories() : getProfiles();
  const id = createSlug(cleanName);

  if (items.some((item) => item.id === id)) {
    alert("Ya existe una clasificación con ese nombre.");
    return;
  }

  items.push({ id, name: cleanName, order: items.length + 1 });

  if (type === "category") {
    saveCategories(items);
  } else {
    saveProfiles(items);
  }

  renderTaxonomies();
}

function renameTaxonomyItem(type, id, name) {
  const cleanName = name.trim();
  if (!cleanName) {
    alert("El nombre no puede quedar vacío.");
    return;
  }

  const items = type === "category" ? getCategories() : getProfiles();
  const updated = items.map((item) => item.id === id ? { ...item, name: cleanName } : item);

  if (type === "category") {
    saveCategories(updated);
  } else {
    saveProfiles(updated);
  }

  renderTaxonomies();
  renderAdminProducts();
}

function moveTaxonomyItem(type, index, direction) {
  const items = type === "category" ? getCategories() : getProfiles();
  const newIndex = index + direction;

  if (newIndex < 0 || newIndex >= items.length) return;

  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(newIndex, 0, item);

  if (type === "category") {
    saveCategories(nextItems);
  } else {
    saveProfiles(nextItems);
  }

  renderTaxonomies();
}

function deleteTaxonomyItem(type, id) {
  const isCategory = type === "category";
  const used = getProducts().some((product) => isCategory ? product.category === id : product.profile === id);

  if (used) {
    alert("No puedes eliminar una clasificación que está siendo usada por productos.");
    return;
  }

  const confirmDelete = confirm("¿Eliminar esta clasificación?");
  if (!confirmDelete) return;

  const items = isCategory ? getCategories() : getProfiles();
  const filtered = items.filter((item) => item.id !== id);

  if (isCategory) {
    saveCategories(filtered);
  } else {
    saveProfiles(filtered);
  }

  renderTaxonomies();
}

categoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTaxonomyItem("category", new FormData(categoryForm).get("name"));
  categoryForm.reset();
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTaxonomyItem("profile", new FormData(profileForm).get("name"));
  profileForm.reset();
});

function renderAdminProducts() {
  products = getProducts();
  adminProductList.innerHTML = "";

  if (products.length === 0) {
    adminProductList.innerHTML = `
      <div class="empty-state">
        <strong>No hay productos.</strong>
        <span>Puedes crear uno nuevo o restaurar los productos demo.</span>
      </div>
    `;
    return;
  }

  products.forEach((product, index) => {
    const article = document.createElement("article");
    article.className = "admin-product-card";

    const imageBlock = product.image
      ? `<img src="${product.image}" alt="${product.name}">`
      : `<div class="admin-fake-bottle" style="--accent-solid:${product.color}"></div>`;

    article.innerHTML = `
      <div class="admin-product-img">${imageBlock}</div>
      <div class="admin-product-info">
        <strong>${product.featured ? "★ " : ""}${product.name}</strong>
        <span>${product.brand} · ${product.tag}</span>
        <small>${product.stock} · ${getTaxonomyName("category", product.category)} · ${getTaxonomyName("profile", product.profile)} · 3ml ${formatPrice(product.prices["3"])} · 5ml ${formatPrice(product.prices["5"])} · 10ml ${formatPrice(product.prices["10"])}</small>
      </div>
      <div class="admin-product-actions">
        <button type="button" data-action="up" ${index === 0 ? "disabled" : ""}>↑</button>
        <button type="button" data-action="down" ${index === products.length - 1 ? "disabled" : ""}>↓</button>
        <button type="button" data-action="featured">${product.featured ? "Quitar destacado" : "Destacar"}</button>
        <button type="button" data-action="edit">Editar</button>
        <button type="button" data-action="delete">Eliminar</button>
      </div>
    `;

    article.querySelector('[data-action="up"]').addEventListener("click", () => moveProduct(index, -1));
    article.querySelector('[data-action="down"]').addEventListener("click", () => moveProduct(index, 1));
    article.querySelector('[data-action="featured"]').addEventListener("click", () => toggleFeatured(product.id));
    article.querySelector('[data-action="edit"]').addEventListener("click", () => editProduct(product.id));
    article.querySelector('[data-action="delete"]').addEventListener("click", () => deleteProduct(product.id));

    adminProductList.appendChild(article);
  });
}

function moveProduct(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= products.length) return;

  const nextProducts = [...products];
  const [movedProduct] = nextProducts.splice(index, 1);
  nextProducts.splice(newIndex, 0, movedProduct);

  saveProducts(nextProducts);
  renderAdminProducts();
}

function toggleFeatured(id) {
  const nextProducts = products.map((product) => {
    if (product.id !== id) return product;
    return { ...product, featured: !product.featured };
  });

  saveProducts(nextProducts);
  renderAdminProducts();
}

function editProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  formTitle.textContent = "Editar producto";
  form.elements.id.value = product.id;
  form.elements.name.value = product.name;
  form.elements.brand.value = product.brand;

  renderTaxonomySelects();

  form.elements.category.value = product.category;
  form.elements.profile.value = product.profile;
  form.elements.tag.value = product.tag;
  form.elements.stock.value = product.stock;
  form.elements.price3.value = product.prices["3"];
  form.elements.price5.value = product.prices["5"];
  form.elements.price10.value = product.prices["10"];
  form.elements.description.value = product.description;
  form.elements.featured.checked = product.featured;

  setPreview(product.image || "");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  const confirmDelete = confirm(`¿Eliminar "${product.name}" del catálogo?`);
  if (!confirmDelete) return;

  products = products.filter((item) => item.id !== id);
  saveProducts(products);
  renderAdminProducts();
  renderTaxonomies();
  resetForm();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const id = formData.get("id");
  const name = formData.get("name").trim();
  const brand = formData.get("brand").trim();
  const category = formData.get("category");
  const profile = formData.get("profile");
  const tag = formData.get("tag").trim();
  const stock = formData.get("stock");
  const description = formData.get("description").trim();
  const featured = formData.get("featured") === "on";
  const imageFile = formData.get("image");

  const [accent, color] = getProfileColors(profile);
  const image = await compressImage(imageFile && imageFile.size ? imageFile : null);

  const existingProduct = products.find((product) => product.id === id);
  const productData = {
    id: id || `${createSlug(name)}-${Date.now()}`,
    name,
    brand,
    category,
    profile,
    tag,
    stock,
    featured,
    order: existingProduct?.order || products.length + 1,
    description,
    prices: {
      "3": Number(formData.get("price3")),
      "5": Number(formData.get("price5")),
      "10": Number(formData.get("price10"))
    },
    accent,
    color,
    image
  };

  const existingIndex = products.findIndex((item) => item.id === productData.id);

  if (existingIndex >= 0) {
    products[existingIndex] = productData;
  } else {
    products.unshift(productData);
  }

  saveProducts(products);
  renderAdminProducts();
  renderTaxonomies();
  resetForm();
});

form.elements.image.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 4 * 1024 * 1024) {
    alert("La imagen pesa mucho. Intenta usar una menor a 4MB.");
    form.elements.image.value = "";
    return;
  }

  try {
    const image = await compressImage(file);
    setPreview(image);
  } catch (error) {
    alert(error.message);
  }
});

removeImageButton.addEventListener("click", () => {
  form.elements.image.value = "";
  setPreview("");
});

resetFormButton.addEventListener("click", resetForm);

resetDefaultsButton.addEventListener("click", () => {
  const confirmReset = confirm("¿Restaurar los productos demo? Se reemplazará el catálogo, categorías y perfiles actuales.");
  if (!confirmReset) return;

  products = resetProducts();
  renderTaxonomies();
  renderAdminProducts();
  resetForm();
});

exportCatalogButton.addEventListener("click", exportCatalog);

importCatalogInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const confirmImport = confirm("¿Importar este catálogo? Reemplazará el catálogo actual.");
  if (!confirmImport) {
    event.target.value = "";
    return;
  }

  try {
    products = await importCatalogFile(file);
    renderTaxonomies();
    renderAdminProducts();
    resetForm();
    alert("Catálogo importado correctamente.");
  } catch (error) {
    alert(error.message);
  } finally {
    event.target.value = "";
  }
});

checkAuth();

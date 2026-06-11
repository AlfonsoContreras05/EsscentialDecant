const SELLER_PHONE = "56946317762";
const ADMIN_PASSWORD = "essential2026";

const STORAGE_PRODUCTS_KEY = "essentialDecantProductsV43";
const STORAGE_CART_KEY = "essentialDecantCartV43";
const STORAGE_ADMIN_AUTH_KEY = "essentialDecantAdminAuthV43";
const STORAGE_CATEGORIES_KEY = "essentialDecantCategoriesV43";
const STORAGE_PROFILES_KEY = "essentialDecantProfilesV43";

const DEFAULT_CATEGORIES = [
  { id: "arabes", name: "Árabe", order: 1 },
  { id: "disenador", name: "Diseñador", order: 2 }
];

const DEFAULT_PROFILES = [
  { id: "fresco", name: "Fresco", order: 1 },
  { id: "dulce", name: "Dulce", order: 2 },
  { id: "citricos", name: "Cítrico", order: 3 },
  { id: "intenso", name: "Intenso", order: 4 }
];

const DEFAULT_PRODUCTS = [
  {
    id: "hawas-malibu",
    name: "Hawas Malibu",
    brand: "Rasasi",
    category: "arabes",
    profile: "fresco",
    tag: "Tropical · Amaderado",
    stock: "Disponible",
    featured: true,
    order: 1,
    description: "Salida playera, limpia y tropical con sensación fresca de verano.",
    prices: { "3": 3990, "5": 5990, "10": 9990 },
    accent: "rgba(86, 200, 255, .38)",
    color: "rgba(54, 178, 214, .76)",
    image: "assets/perfume_demo_1.jpg"
  },
  {
    id: "hawas-tropical",
    name: "Hawas Tropical",
    brand: "Rasasi",
    category: "arabes",
    profile: "fresco",
    tag: "Verde · Fresco",
    stock: "Disponible",
    featured: true,
    order: 2,
    description: "Perfil verde, jugoso y energético. Muy llamativo para uso diario.",
    prices: { "3": 3990, "5": 5990, "10": 9990 },
    accent: "rgba(88, 227, 162, .38)",
    color: "rgba(61, 218, 155, .8)",
    image: "assets/perfume_demo_2.jpg"
  },
  {
    id: "hawas-ice",
    name: "Hawas Ice",
    brand: "Rasasi",
    category: "arabes",
    profile: "citricos",
    tag: "Limpio · Cítrico",
    stock: "Disponible",
    featured: true,
    order: 3,
    description: "Aroma limpio, frío y moderno. Buena opción para días de calor.",
    prices: { "3": 4490, "5": 6490, "10": 10990 },
    accent: "rgba(86, 200, 255, .46)",
    color: "rgba(71, 161, 255, .82)",
    image: "assets/perfume_demo_3.jpg"
  },
  {
    id: "jo-milano-bourbon",
    name: "Jo Milano Bourbon",
    brand: "Jo Milano",
    category: "arabes",
    profile: "dulce",
    tag: "Dulce · Verde",
    stock: "Disponible",
    featured: false,
    order: 4,
    description: "Dulzor moderno con presencia frutal y fondo elegante.",
    prices: { "3": 3990, "5": 5990, "10": 9990 },
    accent: "rgba(88, 227, 162, .35)",
    color: "rgba(78, 197, 66, .82)",
    image: ""
  },
  {
    id: "jo-milano-full-house",
    name: "Jo Milano Full House",
    brand: "Jo Milano",
    category: "arabes",
    profile: "citricos",
    tag: "Cítrico · Fresco",
    stock: "Disponible",
    featured: false,
    order: 5,
    description: "Cítrico, versátil y fácil de usar. Ideal para descubrir algo distinto.",
    prices: { "3": 3990, "5": 5990, "10": 9990 },
    accent: "rgba(86, 200, 255, .42)",
    color: "rgba(46, 151, 214, .84)",
    image: ""
  },
  {
    id: "versace-eros-energy",
    name: "Versace Eros Energy",
    brand: "Versace",
    category: "disenador",
    profile: "citricos",
    tag: "Cítrico · Brillante",
    stock: "Disponible",
    featured: true,
    order: 6,
    description: "Luminoso, chispeante y de vibra energética para destacar.",
    prices: { "3": 4990, "5": 7490, "10": 12990 },
    accent: "rgba(232, 194, 111, .44)",
    color: "rgba(232, 194, 111, .88)",
    image: ""
  },
  {
    id: "versace-eros-flame",
    name: "Versace Eros Flame",
    brand: "Versace",
    category: "disenador",
    profile: "dulce",
    tag: "Cálido · Intenso",
    stock: "Disponible",
    featured: false,
    order: 7,
    description: "Especiado, cálido y seductor. Mejor para tarde o noche.",
    prices: { "3": 4990, "5": 7490, "10": 12990 },
    accent: "rgba(255, 105, 97, .42)",
    color: "rgba(224, 65, 48, .86)",
    image: ""
  },
  {
    id: "versace-eros",
    name: "Versace Eros",
    brand: "Versace",
    category: "disenador",
    profile: "fresco",
    tag: "Menta · Vainilla",
    stock: "Disponible",
    featured: false,
    order: 8,
    description: "Dulce fresco, reconocible y muy popular para salidas.",
    prices: { "3": 4990, "5": 7490, "10": 12990 },
    accent: "rgba(86, 200, 255, .42)",
    color: "rgba(21, 178, 188, .86)",
    image: ""
  },
  {
    id: "dylan-blue",
    name: "Versace Dylan Blue",
    brand: "Versace",
    category: "disenador",
    profile: "fresco",
    tag: "Azul · Aromático",
    stock: "Disponible",
    featured: false,
    order: 9,
    description: "Fresco, limpio y masculino. Muy usable para oficina y diario.",
    prices: { "3": 4990, "5": 7490, "10": 12990 },
    accent: "rgba(71, 161, 255, .44)",
    color: "rgba(18, 59, 156, .86)",
    image: ""
  }
];

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createSlug(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getProfileColors(profile) {
  const colors = {
    fresco: ["rgba(88, 227, 162, .38)", "rgba(61, 218, 155, .8)"],
    dulce: ["rgba(255, 90, 215, .35)", "rgba(190, 67, 190, .82)"],
    citricos: ["rgba(232, 194, 111, .44)", "rgba(232, 194, 111, .88)"],
    intenso: ["rgba(255, 105, 97, .42)", "rgba(224, 65, 48, .86)"],
    amaderado: ["rgba(184, 118, 58, .38)", "rgba(139, 79, 38, .85)"],
    especiado: ["rgba(255, 128, 76, .38)", "rgba(204, 80, 43, .85)"],
    acuatico: ["rgba(86, 200, 255, .42)", "rgba(50, 142, 211, .86)"]
  };

  return colors[profile] || colors.fresco;
}

function normalizeTaxonomyItem(item, index = 0) {
  const name = String(item?.name || "").trim();
  const id = item?.id ? createSlug(item.id) : createSlug(name);

  return {
    id: id || `item-${Date.now()}-${index}`,
    name: name || "Sin nombre",
    order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index + 1
  };
}

function ensureTaxonomy(key, defaults) {
  const stored = localStorage.getItem(key);

  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return deepClone(defaults);
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error("Taxonomía inválida");
    return parsed.map(normalizeTaxonomyItem).sort((a, b) => Number(a.order) - Number(b.order));
  } catch (error) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return deepClone(defaults);
  }
}

function getCategories() {
  return ensureTaxonomy(STORAGE_CATEGORIES_KEY, DEFAULT_CATEGORIES);
}

function getProfiles() {
  return ensureTaxonomy(STORAGE_PROFILES_KEY, DEFAULT_PROFILES);
}

function saveCategories(categories) {
  const normalized = categories.map(normalizeTaxonomyItem).map((item, index) => ({ ...item, order: index + 1 }));
  localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(normalized));
}

function saveProfiles(profiles) {
  const normalized = profiles.map(normalizeTaxonomyItem).map((item, index) => ({ ...item, order: index + 1 }));
  localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(normalized));
}

function getTaxonomyName(type, id) {
  const source = type === "category" ? getCategories() : getProfiles();
  return source.find((item) => item.id === id)?.name || id;
}

function ensureDefaultTaxonomies() {
  getCategories();
  getProfiles();
}

function normalizeProduct(product, index = 0) {
  const [accent, color] = getProfileColors(product.profile || "fresco");

  return {
    id: product.id || `${createSlug(product.name || "producto")}-${Date.now()}`,
    name: product.name || "Producto sin nombre",
    brand: product.brand || "Marca sin indicar",
    category: product.category || "arabes",
    profile: product.profile || "fresco",
    tag: product.tag || "Fragancia",
    stock: product.stock || "Disponible",
    featured: Boolean(product.featured),
    order: Number.isFinite(Number(product.order)) ? Number(product.order) : index + 1,
    description: product.description || "Fragancia disponible en formato decant.",
    prices: {
      "3": Number(product.prices?.["3"] ?? product.price3 ?? 0),
      "5": Number(product.prices?.["5"] ?? product.price5 ?? 0),
      "10": Number(product.prices?.["10"] ?? product.price10 ?? 0)
    },
    accent: product.accent || accent,
    color: product.color || color,
    image: product.image || ""
  };
}

function ensureProducts() {
  const storedProducts = localStorage.getItem(STORAGE_PRODUCTS_KEY);

  if (!storedProducts) {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return deepClone(DEFAULT_PRODUCTS);
  }

  try {
    const parsedProducts = JSON.parse(storedProducts);
    return parsedProducts.map(normalizeProduct);
  } catch (error) {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return deepClone(DEFAULT_PRODUCTS);
  }
}

function getProducts() {
  return ensureProducts().sort((a, b) => Number(a.order) - Number(b.order));
}

function saveProducts(products) {
  const normalized = products.map(normalizeProduct).map((product, index) => ({
    ...product,
    order: index + 1
  }));

  localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(normalized));
}

function resetProducts() {
  localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
  return deepClone(DEFAULT_PRODUCTS);
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_CART_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function isAdminAuthenticated() {
  return localStorage.getItem(STORAGE_ADMIN_AUTH_KEY) === "true";
}

function setAdminAuthenticated(value) {
  if (value) {
    localStorage.setItem(STORAGE_ADMIN_AUTH_KEY, "true");
  } else {
    localStorage.removeItem(STORAGE_ADMIN_AUTH_KEY);
  }
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

ensureDefaultTaxonomies();
ensureProducts();

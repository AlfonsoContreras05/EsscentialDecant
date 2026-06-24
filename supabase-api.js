const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function isSupabaseConfigured() {
  return SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("PEGA_AQUI") && !SUPABASE_ANON_KEY.includes("PEGA_AQUI");
}

function requireSupabaseConfig() {
  if (!isSupabaseConfigured()) throw new Error("Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY en supabase-config.js");
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function clampNumber(value, min, max) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function getProductDiscountPercent(product) {
  return clampNumber(product?.discount_percent, 0, 25);
}

function isProductOnOffer(product) {
  return getProductDiscountPercent(product) > 0;
}

function isProductActive(product) {
  return product?.is_active !== false;
}

function createSlug(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getProfileColors(profileName = "") {
  const key = createSlug(profileName);
  const colors = {
    fresco: ["rgba(88, 227, 162, .38)", "rgba(61, 218, 155, .8)"],
    dulce: ["rgba(255, 90, 215, .35)", "rgba(190, 67, 190, .82)"],
    citrico: ["rgba(232, 194, 111, .44)", "rgba(232, 194, 111, .88)"],
    citricos: ["rgba(232, 194, 111, .44)", "rgba(232, 194, 111, .88)"],
    intenso: ["rgba(255, 105, 97, .42)", "rgba(224, 65, 48, .86)"],
    amaderado: ["rgba(184, 118, 58, .38)", "rgba(139, 79, 38, .85)"],
    especiado: ["rgba(255, 128, 76, .38)", "rgba(204, 80, 43, .85)"],
    acuatico: ["rgba(86, 200, 255, .42)", "rgba(50, 142, 211, .86)"]
  };
  return colors[key] || colors.fresco;
}

function getCart() {
  try { return JSON.parse(localStorage.getItem("essentialDecantCartV51")) || []; }
  catch { return []; }
}
function saveCart(cart) { localStorage.setItem("essentialDecantCartV51", JSON.stringify(cart)); }

async function getCurrentSession() {
  requireSupabaseConfig();
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw error;
  return data.session;
}
async function signInAdmin(email, password) {
  requireSupabaseConfig();
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
async function signOutAdmin() {
  requireSupabaseConfig();
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}

async function fetchCategories() {
  requireSupabaseConfig();
  const { data, error } = await supabaseClient.from("categories").select("*").order("order_index", { ascending: true }).order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}
async function fetchProfiles() {
  requireSupabaseConfig();
  const { data, error } = await supabaseClient.from("profiles").select("*").order("order_index", { ascending: true }).order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}
async function fetchProducts() {
  requireSupabaseConfig();
  const { data, error } = await supabaseClient
    .from("products")
    .select("*, category:categories(id, name, order_index), profile:profiles(id, name, order_index)")
    .order("order_index", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}
async function fetchProductById(id) {
  requireSupabaseConfig();
  const { data, error } = await supabaseClient
    .from("products")
    .select("*, category:categories(id, name, order_index), profile:profiles(id, name, order_index)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function fetchSiteSettings() {
  requireSupabaseConfig();
  const { data, error } = await supabaseClient.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data || { id: 1, hero_image_url: null };
}
async function updateSiteSettings(payload) {
  requireSupabaseConfig();
  const { data, error } = await supabaseClient.from("site_settings").upsert({ id: 1, ...payload }).select().single();
  if (error) throw error;
  return data;
}

async function createCategory(name) {
  const categories = await fetchCategories();
  const { data, error } = await supabaseClient.from("categories").insert({ name: name.trim(), order_index: categories.length + 1 }).select().single();
  if (error) throw error;
  return data;
}
async function updateCategory(id, payload) {
  const { data, error } = await supabaseClient.from("categories").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
async function deleteCategory(id) {
  const { error } = await supabaseClient.from("categories").delete().eq("id", id);
  if (error) throw error;
}
async function createProfile(name) {
  const profiles = await fetchProfiles();
  const { data, error } = await supabaseClient.from("profiles").insert({ name: name.trim(), order_index: profiles.length + 1 }).select().single();
  if (error) throw error;
  return data;
}
async function updateProfile(id, payload) {
  const { data, error } = await supabaseClient.from("profiles").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
async function deleteProfile(id) {
  const { error } = await supabaseClient.from("profiles").delete().eq("id", id);
  if (error) throw error;
}

async function saveProduct(product) {
  requireSupabaseConfig();
  const payload = {
    name: product.name,
    brand: product.brand,
    category_id: product.category_id,
    profile_id: product.profile_id,
    tag: product.tag,
    description: product.description,
    price_3ml: Number(product.price_3ml || 0),
    price_5ml: Number(product.price_5ml || 0),
    price_10ml: Number(product.price_10ml || 0),
    stock: product.stock,
    featured: Boolean(product.featured),
    is_active: product.is_active !== false,
    discount_percent: clampNumber(product.discount_percent, 0, 25),
    order_index: Number(product.order_index || 999),
    image_url_1: product.image_url_1 || null,
    image_url_2: product.image_url_2 || null,
    image_url_3: product.image_url_3 || null
  };
  if (product.id) {
    const { data, error } = await supabaseClient.from("products").update(payload).eq("id", product.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabaseClient.from("products").insert(payload).select().single();
  if (error) throw error;
  return data;
}
async function deleteProduct(id) {
  const { error } = await supabaseClient.from("products").delete().eq("id", id);
  if (error) throw error;
}
async function updateProductOrder(id, orderIndex) {
  const { error } = await supabaseClient.from("products").update({ order_index: orderIndex }).eq("id", id);
  if (error) throw error;
}
async function updateCategoryOrder(id, orderIndex) {
  const { error } = await supabaseClient.from("categories").update({ order_index: orderIndex }).eq("id", id);
  if (error) throw error;
}
async function updateProfileOrder(id, orderIndex) {
  const { error } = await supabaseClient.from("profiles").update({ order_index: orderIndex }).eq("id", id);
  if (error) throw error;
}


async function fetchPacks() {
  requireSupabaseConfig();
  const { data, error } = await supabaseClient
    .from("packs")
    .select(`
      *,
      items:pack_items(
        id,
        pack_id,
        product_id,
        size_ml,
        quantity,
        order_index,
        product:products(
          id,
          name,
          brand,
          tag,
          description,
          price_3ml,
          price_5ml,
          price_10ml,
          stock,
          featured,
          is_active,
          discount_percent,
          image_url_1,
          image_url_2,
          image_url_3,
          category:categories(id, name, order_index),
          profile:profiles(id, name, order_index)
        )
      )
    `)
    .order("order_index", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data || []).map(normalizePack);
}


async function fetchPackById(id) {
  requireSupabaseConfig();
  const { data, error } = await supabaseClient
    .from("packs")
    .select(`
      *,
      items:pack_items(
        id,
        pack_id,
        product_id,
        size_ml,
        quantity,
        order_index,
        product:products(
          id,
          name,
          brand,
          tag,
          description,
          price_3ml,
          price_5ml,
          price_10ml,
          stock,
          featured,
          is_active,
          discount_percent,
          image_url_1,
          image_url_2,
          image_url_3,
          category:categories(id, name, order_index),
          profile:profiles(id, name, order_index)
        )
      )
    `)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizePack(data) : null;
}

function getPackImages(pack) {
  const ownImage = pack?.image_url ? [pack.image_url] : [];
  const itemImages = (pack?.items || [])
    .map((item) => item.product)
    .filter(Boolean)
    .flatMap((product) => getProductImages(product));
  return [...ownImage, ...itemImages].filter(Boolean);
}

function getPrimaryPackImage(pack) {
  return getPackImages(pack)[0] || null;
}

function normalizePack(pack) {
  const items = Array.isArray(pack.items) ? [...pack.items] : [];
  items.sort((a, b) => Number(a.order_index || 999) - Number(b.order_index || 999));
  return { ...pack, items };
}

function isPackActive(pack) {
  return pack?.is_active !== false;
}

function getPackPrice(pack) {
  return Number(pack?.price || 0);
}

function getPackItemsText(pack) {
  const items = Array.isArray(pack?.items) ? pack.items : [];
  if (!items.length) return "Selección a coordinar por WhatsApp";
  return items
    .map((item) => {
      const productName = item.product ? `${item.product.brand} ${item.product.name}` : "Producto";
      return `${Number(item.quantity || 1)}x ${productName} ${item.size_ml}ml`;
    })
    .join(" + ");
}

async function savePack(pack) {
  requireSupabaseConfig();
  const packPayload = {
    name: pack.name,
    tag: pack.tag || null,
    description: pack.description || null,
    price: Number(pack.price || 0),
    is_active: pack.is_active !== false,
    featured: Boolean(pack.featured),
    image_url: pack.image_url || null,
    order_index: Number(pack.order_index || 999)
  };

  let savedPack;
  if (pack.id) {
    const { data, error } = await supabaseClient.from("packs").update(packPayload).eq("id", pack.id).select().single();
    if (error) throw error;
    savedPack = data;
    const { error: deleteItemsError } = await supabaseClient.from("pack_items").delete().eq("pack_id", pack.id);
    if (deleteItemsError) throw deleteItemsError;
  } else {
    const { data, error } = await supabaseClient.from("packs").insert(packPayload).select().single();
    if (error) throw error;
    savedPack = data;
  }

  const items = Array.isArray(pack.items) ? pack.items : [];
  if (items.length) {
    const itemPayload = items.map((item, index) => ({
      pack_id: savedPack.id,
      product_id: item.product_id,
      size_ml: Number(item.size_ml || 5),
      quantity: Math.max(1, Number(item.quantity || 1)),
      order_index: index + 1
    }));
    const { error: itemError } = await supabaseClient.from("pack_items").insert(itemPayload);
    if (itemError) throw itemError;
  }

  return savedPack;
}

async function deletePack(id) {
  const { error } = await supabaseClient.from("packs").delete().eq("id", id);
  if (error) throw error;
}

async function updatePackOrder(id, orderIndex) {
  const { error } = await supabaseClient.from("packs").update({ order_index: orderIndex }).eq("id", id);
  if (error) throw error;
}

async function uploadImageToBucket(file, folder, namePrefix = "imagen") {
  requireSupabaseConfig();
  const filename = `${Date.now()}-${createSlug(namePrefix || "imagen")}.jpg`;
  const path = `${folder}/${filename}`;
  const { error: uploadError } = await supabaseClient.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: "image/jpeg"
  });
  if (uploadError) throw uploadError;
  const { data } = supabaseClient.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
async function uploadProductImage(file, productName, slot) { return uploadImageToBucket(file, "productos", `${productName || "producto"}-${slot}`); }
async function uploadHeroImage(file) { return uploadImageToBucket(file, "sitio", "portada-landing"); }
async function uploadPackImage(file, packName) { return uploadImageToBucket(file, "packs", `${packName || "pack"}`); }

function getProductBasePrice(product, size) {
  if (size === "3") return Number(product.price_3ml || 0);
  if (size === "5") return Number(product.price_5ml || 0);
  return Number(product.price_10ml || 0);
}
function getProductPrice(product, size) {
  const basePrice = getProductBasePrice(product, size);
  const discount = getProductDiscountPercent(product);
  if (!discount) return basePrice;
  return Math.max(0, Math.round(basePrice * (1 - discount / 100)));
}
function getProductCategoryName(product) { return product.category?.name || "Sin categoría"; }
function getProductProfileName(product) { return product.profile?.name || "Sin perfil"; }
function getProductImages(product) { return [product.image_url_1, product.image_url_2, product.image_url_3].filter(Boolean); }
function getPrimaryProductImage(product) { return getProductImages(product)[0] || null; }

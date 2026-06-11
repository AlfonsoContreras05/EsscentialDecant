function exportCatalog() {
  const payload = {
    app: "Essential Decant",
    version: "4.3-localstorage-taxonomies",
    exportedAt: new Date().toISOString(),
    categories: getCategories(),
    profiles: getProfiles(),
    products: getProducts()
  };

  const date = new Date().toISOString().slice(0, 10);
  downloadTextFile(`essential-decant-catalogo-${date}.json`, JSON.stringify(payload, null, 2));
}

function importCatalogFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No se seleccionó ningún archivo."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const products = Array.isArray(parsed) ? parsed : parsed.products;
        const categories = parsed.categories;
        const profiles = parsed.profiles;

        if (!Array.isArray(products)) {
          reject(new Error("El archivo no contiene una lista válida de productos."));
          return;
        }

        if (Array.isArray(categories)) {
          saveCategories(categories.map(normalizeTaxonomyItem));
        }

        if (Array.isArray(profiles)) {
          saveProfiles(profiles.map(normalizeTaxonomyItem));
        }

        const normalizedProducts = products.map(normalizeProduct);
        saveProducts(normalizedProducts);
        resolve(normalizedProducts);
      } catch (error) {
        reject(new Error("El archivo JSON no es válido."));
      }
    };

    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsText(file);
  });
}

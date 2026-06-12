async function loadLandingImage() {
  const showcase = document.querySelector(".showcase");
  const image = document.querySelector("#heroShowcaseImage");
  if (!showcase || !image) return;

  try {
    const settings = await fetchSiteSettings();
    if (!settings.hero_image_url) {
      showcase.classList.remove("custom-hero-active");
      image.removeAttribute("src");
      return;
    }
    image.src = settings.hero_image_url;
    showcase.classList.add("custom-hero-active");
  } catch (error) {
    console.warn("No se pudo cargar la imagen de portada:", error.message);
  }
}

loadLandingImage();

import { API_BASE_URL } from "./httpClient";

const imagenesReferenciales = [
  "producto1.jpg",
  "producto2.jpg",
  "producto3.jpg",
  "producto4.jpg",
  "producto5.jpg",
  "producto6.jpg",
  "producto7.jpg",
  "producto8.jpg",
  "producto9.jpg",
  "producto10.jpg",
  "referencial-bebe-01.jpg",
  "referencial-bebe-02.jpg",
  "referencial-bebe-03.jpg",
  "referencial-bebe-04.jpg",
  "referencial-bebe-05.jpg",
  "referencial-bebe-06.jpg",
];

export const creditosImagenes = [
  {
    titulo: "Baby Clothes",
    autor: "Sean MacEntee",
    fuente: "https://www.flickr.com/photos/18090920@N07/9560424310",
    licencia: "CC BY 2.0",
    urlLicencia: "https://creativecommons.org/licenses/by/2.0/",
  },
  {
    titulo: "Baby clothes",
    autor: "Mark.Pilgrim",
    fuente: "https://www.flickr.com/photos/41169327@N00/93843796",
    licencia: "CC BY-SA 2.0",
    urlLicencia: "https://creativecommons.org/licenses/by-sa/2.0/",
  },
  {
    titulo: "Baby Clothes",
    autor: "Joe Shlabotnik",
    fuente: "https://www.flickr.com/photos/40646519@N00/2284764037",
    licencia: "CC BY 2.0",
    urlLicencia: "https://creativecommons.org/licenses/by/2.0/",
  },
  {
    titulo: "Baby Clothes",
    autor: "Joe Shlabotnik",
    fuente: "https://www.flickr.com/photos/40646519@N00/2295445164",
    licencia: "CC BY 2.0",
    urlLicencia: "https://creativecommons.org/licenses/by/2.0/",
  },
  {
    titulo: "Baby clothes",
    autor: "StarsApart",
    fuente: "https://www.flickr.com/photos/39042870@N00/15111483361",
    licencia: "CC BY 2.0",
    urlLicencia: "https://creativecommons.org/licenses/by/2.0/",
  },
  {
    titulo: "Baby Clothes",
    autor: "nateOne",
    fuente: "https://www.flickr.com/photos/49998984@N00/3276169544",
    licencia: "CC BY 2.0",
    urlLicencia: "https://creativecommons.org/licenses/by/2.0/",
  },
];

export const getProductImage = (product, sourceOverride) => {
  const savedImage = sourceOverride || product?.imagen_producto || product?.imagen;
  if (savedImage) {
    const url = /^https?:\/\//i.test(savedImage)
      ? savedImage
      : `${API_BASE_URL}${savedImage.startsWith("/assets/")
        ? savedImage
        : `/assets/productos/${savedImage}`}`;
    return { url, isReference: false };
  }

  const rawId = Number(product?.id ?? product?.idProducto);
  const index = Number.isSafeInteger(rawId) && rawId > 0
    ? (rawId - 1) % imagenesReferenciales.length
    : 0;
  return {
    url: `${API_BASE_URL}/assets/productos/${imagenesReferenciales[index]}`,
    isReference: true,
  };
};

export const hasReferenceProductImages = (products = []) => (
  products.some((product) => !product?.imagen_producto && !product?.imagen)
);

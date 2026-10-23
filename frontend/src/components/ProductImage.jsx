import { creditosImagenes, getProductImage, hasReferenceProductImages } from "../services/productImageService";

export function ProductImage({
  product,
  source,
  className = "",
  imageClassName = "",
  style,
  imageStyle,
  alt,
}) {
  const image = getProductImage(product, source);
  const name = alt || product?.nombre || "Producto";

  return (
    <div
      className={`${className}${image.isReference ? " product-image-reference" : ""}`.trim()}
      style={style}
    >
      <img
        className={imageClassName}
        src={image.url}
        alt={image.isReference ? `${name} (imagen ilustrativa)` : name}
        style={imageStyle}
      />
      {image.isReference && <span className="product-image-reference-badge">Imagen ilustrativa</span>}
    </div>
  );
}

export function ProductImageCredits({ products = [] }) {
  if (!hasReferenceProductImages(products)) return null;

  return (
    <details className="public-product-image-credits">
      <summary>Créditos de imágenes ilustrativas</summary>
      <p>Las imágenes que no tienen foto propia son referenciales y no representan un producto específico.</p>
      <ul>
        {creditosImagenes.map((credit) => (
          <li key={credit.fuente}>
            {credit.titulo} — {credit.autor},{" "}
            <a href={credit.fuente} target="_blank" rel="noreferrer">fuente</a>
            {" · "}
            <a href={credit.urlLicencia} target="_blank" rel="noreferrer">{credit.licencia}</a>
          </li>
        ))}
      </ul>
    </details>
  );
}

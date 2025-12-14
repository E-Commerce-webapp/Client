import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-1 hover:border-ring hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={product.images[0]}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
          {product.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          Sold by:{" "}
          <span className="font-medium text-primary">
            {product.seller_name}
          </span>
        </p>
        <p className="line-clamp-3 text-xs text-muted-foreground">
          {product.description.length > 100
            ? `${product.description.substring(0, 100)}...`
            : product.description}
        </p>
        <div className="mt-auto pt-2">
          <p className="text-base font-semibold text-foreground">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

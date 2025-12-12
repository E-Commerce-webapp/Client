import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";


export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const query = searchParams.get("q") || "";

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      if (query.trim()) {
        const results = products
          .filter((product) => {
            const searchLower = query.toLowerCase();
            const productName = product.name.toLowerCase();
            const productDesc = product.description.toLowerCase();
            return (
              productName.includes(searchLower) ||
              productDesc.includes(searchLower)
            );
          })
          .map((product) => ({
            ...product,
            seller_name:
              users.find((u) => u.user_id === product.seller_id)?.username ??
              "Unknown Seller",
          }));

        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        {searchResults.length > 0
          ? `Found ${searchResults.length} ${
              searchResults.length === 1 ? "result" : "results"
            } for "${query}"`
          : `No results found for "${query}"`}
      </h2>

      {searchResults.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {searchResults.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <i className="bi bi-search mb-3 text-6xl text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No products found
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Sorry, we couldn&apos;t find any products matching &quot;{query}
            &quot;.
            <br />
            Try different keywords or check out our{" "}
            <Link to="/" className="font-medium text-primary underline">
              homepage
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

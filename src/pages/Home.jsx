import { useState, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import { Button } from "@/components/ui/button";
import CategorySelect from "./CategorySellect"

export default function Home({ products = [], loading }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 15;

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category))).filter(
      Boolean
    );
    return ["all", ...unique];
  }, [products]);

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight text-foreground">
        Products
      </h2>

      {/* Category dropdown (shadcn) */}
      <div className="mb-6 flex justify-center">
        <CategorySelect
          categories={categories}
          category={selectedCategory}
          setCategory={handleCategoryChange}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {currentProducts.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground">
            No products found.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-1 py-1 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="rounded-full px-3 text-xs sm:text-sm"
            >
              Prev
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "ghost"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="rounded-full px-3 text-xs sm:text-sm"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="rounded-full px-3 text-xs sm:text-sm"
            >
              Next
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}

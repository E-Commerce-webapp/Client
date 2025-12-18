import { useState, useMemo, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { Button } from "@/components/ui/button";
import CategorySelect from "./CategorySellect"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import { getAverageRating } from "../api/reviews";

export default function Home({ products = [], loading }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [productRatings, setProductRatings] = useState({});

  const itemsPerPage = 15;

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category))).filter(
      Boolean
    );
    return ["all", ...unique];
  }, [products]);

  // Fetch ratings for all products (for sorting by rating)
  useEffect(() => {
    const fetchRatings = async () => {
      const ratings = {};
      await Promise.all(
        products.map(async (product) => {
          try {
            const data = await getAverageRating(product.id);
            ratings[product.id] = data.averageRating || 0;
          } catch {
            ratings[product.id] = 0;
          }
        })
      );
      setProductRatings(ratings);
    };
    if (products.length > 0) {
      fetchRatings();
    }
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = selectedCategory === "all"
      ? [...products]
      : products.filter((p) => p.category === selectedCategory);
    
    // Sort based on selected option
    switch (sortBy) {
      case "newest":
        // Assuming newer products have higher IDs or we sort by createdAt if available
        filtered.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          // Fallback: internal products (with storeId) first, then by id
          if (a.storeId && !b.storeId) return -1;
          if (!a.storeId && b.storeId) return 1;
          return (b.id || '').localeCompare(a.id || '');
        });
        break;
      case "rating":
        filtered.sort((a, b) => (productRatings[b.id] || 0) - (productRatings[a.id] || 0));
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    
    return filtered;
  }, [products, selectedCategory, sortBy, productRatings]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(indexOfFirst, indexOfLast);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
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

      {/* Filters Row */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <CategorySelect
          categories={categories}
          category={selectedCategory}
          setCategory={handleCategoryChange}
        />
        
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[160px] bg-background">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
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

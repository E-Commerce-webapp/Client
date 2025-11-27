import { useState, useEffect, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import { Spinner } from "react-bootstrap";

export default function Home({ products, loading }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 15;

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category)));
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold text-center">Products</h2>

      <div className="mb-4 d-flex justify-content-center">
        <div className="w-50">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            aria-label="Category filter"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all"
                  ? "All Categories"
                  : cat.replace("-", " ").replace("&", " & ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {currentProducts.length === 0 && (
          <p className="text-center text-muted">No products found.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Prev
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <li
                    key={page}
                    className={`page-item ${
                      page === currentPage ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                )
              )}

              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

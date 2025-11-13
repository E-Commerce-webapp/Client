import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import products from '../mock/products.json';
import users from '../mock/users.json';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      if (query.trim()) {
        const results = products.filter(product => {
          const searchLower = query.toLowerCase();
          const productName = product.name.toLowerCase();
          const productDesc = product.description.toLowerCase();
          
          return (
            productName.includes(searchLower) ||
            productDesc.includes(searchLower)
          );
        }).map(product => ({
          ...product,
          seller_name: users.find(u => u.user_id === product.seller_id)?.username || 'Unknown Seller'
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
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Searching for products...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        {searchResults.length > 0 
          ? `Found ${searchResults.length} ${searchResults.length === 1 ? 'result' : 'results'} for "${query}"`
          : `No results found for "${query}"`
        }
      </h2>
      
      {searchResults.length > 0 ? (
        <div className="row">
          {searchResults.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-search display-1 text-muted mb-3"></i>
          <h3>No products found</h3>
          <p className="text-muted">
            Sorry. We couldn't find any products matching "{query}".<br />
            Try different keywords or check out our <Link to="/" className="text-primary">homepage</Link>.
          </p>
        </div>
      )}
    </div>
  );
}

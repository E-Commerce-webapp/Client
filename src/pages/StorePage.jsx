import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

export default function StorePage() {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch store details
        const storeRes = await api.get(`/stores/${storeId}`);
        setStore(storeRes.data);

        // Fetch all products and filter by store
        const productsRes = await api.get('/products');
        const storeProducts = productsRes.data.filter(
          (p) => p.storeId === storeId
        );
        setProducts(storeProducts);
      } catch (err) {
        console.error('Error fetching store:', err);
        setError('Failed to load store information.');
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStoreData();
    }
  }, [storeId]);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info">Store not found.</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Store Header */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h2 className="card-title fw-bold">{store.name}</h2>
          {store.description && (
            <p className="card-text text-muted">{store.description}</p>
          )}
          <div className="row mt-3">
            {store.address && (
              <div className="col-md-6">
                <small className="text-muted">
                  <i className="bi bi-geo-alt me-1"></i>
                  {store.address}
                </small>
              </div>
            )}
            {store.phoneNumber && (
              <div className="col-md-6">
                <small className="text-muted">
                  <i className="bi bi-telephone me-1"></i>
                  {store.phoneNumber}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Store Products */}
      <h4 className="mb-3">Products from this Store</h4>
      {products.length === 0 ? (
        <div className="alert alert-info">
          This store has no products yet.
        </div>
      ) : (
        <div className="row">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

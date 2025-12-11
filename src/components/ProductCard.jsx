import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="col-md-4 mb-4">
      <div 
        className="card h-100 shadow-sm" 
        onClick={handleCardClick}
        style={{ 
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
        }}
      >
        <img
          src={product.images[0]}
          className="card-img-top"
          alt={product.title}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{product.title}</h5>
          <p className="card-text text-muted small mb-2">
            Store: <span className="text-primary">{product.storeName || 'Unknown'}</span>
          </p>
          <p className="card-text text-muted small">
            {product.description.length > 100 
              ? `${product.description.substring(0, 100)}...` 
              : product.description}
          </p>
          <div className="mt-auto">
            <p className="fw-bold h5 mb-0">${product.price.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
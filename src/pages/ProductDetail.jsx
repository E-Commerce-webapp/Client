import { useParams } from 'react-router-dom';
import products from "../mock/products.json";
import users from "../mock/users.json";

export default function ProductDetail() {
  const { productId } = useParams();
  const product = products.find(p => p.product_id === parseInt(productId));
  const seller = users.find(user => user.user_id === product.seller_id);

  if (!product) {
    return <div className="container mt-4">Product not found</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <img 
            src={product.image} 
            alt={product.name} 
            className="img-fluid rounded"
            style={{ maxHeight: '500px', objectFit: 'cover' }}
          />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p className="text-muted">Sold by: {seller?.username || 'Unknown Seller'}</p>
          <h4 className="my-3">${product.price.toFixed(2)}</h4>
          <p>{product.description}</p>
          <p className="text-muted">
            <small>Stock: {product.stock_quantity} available</small>
          </p>
          <p className="text-muted">
            <small>Listed on: {new Date(product.date_added).toLocaleDateString()}</small>
          </p>
        </div>
      </div>
    </div>
  );
}
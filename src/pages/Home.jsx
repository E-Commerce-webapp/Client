import { useState, useEffect } from 'react';
import products from "../mock/products.json";
import users from "../mock/users.json";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [productsWithSellers, setProductsWithSellers] = useState([]);

  useEffect(() => {
    // Map products with seller information
    const productsWithSellerInfo = products.map(product => {
      const seller = users.find(user => user.user_id === product.seller_id);
      return {
        ...product,
        seller_name: seller ? seller.username : 'Unknown Seller'
      };
    });
    setProductsWithSellers(productsWithSellerInfo);
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold text-center">Products</h2>
      <div className="row">
        {productsWithSellers.map((product) => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>
    </div>
  );
}
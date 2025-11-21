// Mock data imports
import productsData from './products.json';
import usersData from './users.json';

// Get the next available product ID
const getNextProductId = () => {
  const maxId = Math.max(...productsData.map(p => p.product_id), 0);
  return maxId + 1;
};

// Get a mock user (for demo purposes, we'll use the first user)
export const getMockUser = () => {
  return usersData[0]; // Using the first user as our mock user
};

// Format date for existing products
const formatExistingProducts = () => {
  return productsData.map(product => ({
    ...product,
    formatted_date: formatTimeAgo(product.date_added)
  }));
};

// Get all products
export const getProducts = () => {
  // In a real app, this would be an API call
  return Promise.resolve(formatExistingProducts());
};

// Add a new product
// Format date as '2 hours ago', '1 day ago', etc.
const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  return 'Just now';
};

export const addProduct = (productData) => {
  const now = new Date();
  const newProduct = {
    product_id: getNextProductId(),
    seller_id: getMockUser().user_id,
    seller_name: getMockUser().username,
    category_id: 1, // Default category, you can modify this based on your categories
    name: productData.name,
    description: productData.description,
    price: parseFloat(productData.price),
    stock_quantity: parseInt(productData.stock, 10) || 1,
    date_added: now.toISOString(),
    formatted_date: formatTimeAgo(now),
    image: productData.image || 'https://picsum.photos/seed/product/600/400'
  };

  // In a real app, this would be an API call
  // For demo purposes, we'll just log it and add it to the in-memory array
  console.log('Adding new product:', newProduct);
  productsData.push(newProduct);
  
  // Note: This won't persist between page refreshes since we can't write to JSON files at runtime
  // In a real app, this would be handled by a backend API
  
  return Promise.resolve(newProduct);
};

// Get products by seller ID
export const getProductsBySeller = (sellerId) => {
  return Promise.resolve(productsData.filter(p => p.seller_id === sellerId));
};

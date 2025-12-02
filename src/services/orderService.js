// Mock function to simulate API calls
const simulateApiCall = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), 500);
  });
};

export const createOrder = async (orderData) => {
  try {
    // In a real app, this would be an API call
    // const response = await axios.post('/api/orders', orderData);
    
    // For mock data, we'll save to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderId = `ORD-${Date.now()}`;
    
    const newOrder = {
      id: orderId,
      ...orderData,
      date: new Date().toISOString(),
      status: orderData.status || 'Processing',
      orderNumber: `#${Math.floor(100000 + Math.random() * 900000)}`
    };
    
    orders.unshift(newOrder); // Add new order to the beginning
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Return a response that matches what the component expects
    return {
      data: {
        ...newOrder,
        id: orderId
      },
      status: 201,
      statusText: 'Created',
      headers: {},
      config: {}
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    // In a real app, this would be an API call
    // const response = await axios.get('/api/orders');
    
    // For mock data, we'll get from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // If no orders in localStorage, use the initial mock data
    if (orders.length === 0) {
      const mockOrders = await import('../mock/orders.json');
      localStorage.setItem('orders', JSON.stringify(mockOrders.default || []));
      return mockOrders.default || [];
    }
    
    return simulateApiCall(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    
    // For mock data, we'll get from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    let order = orders.find(o => o.id === orderId);
    
    if (!order) {
      // If not found in localStorage, check the initial mock data
      try {
        const mockOrders = await import('../mock/orders.json');
        order = Array.isArray(mockOrders.default) 
          ? mockOrders.default.find(o => o.id === orderId)
          : null;
      } catch (e) {
        console.warn('Could not load mock orders:', e);
      }
      
      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
      }
    }
    
    // Return a response that matches what the component expects
    return {
      data: order,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

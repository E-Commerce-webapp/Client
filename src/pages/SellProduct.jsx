import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const SellProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: 1,
    image: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const token = localStorage.getItem('token');
    console.log('Current token:', token); // Debug log

    if (!token) {
      setError('You must be logged in to sell products');
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      console.log('Sending request to:', `${baseUrl}/products`);
      console.log('Request payload:', Object.fromEntries(formDataToSend.entries()));
      console.log('Headers:', {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      });

      const response = await axios.post(`${baseUrl}/products`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        validateStatus: (status) => status < 500 // Accept all status codes less than 500 as not to throw
      });

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.status >= 200 && response.status < 300) {
        setSuccess('Product listed successfully!');
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: 1,
          image: null,
        });
        
        // Redirect to product page after a short delay
        setTimeout(() => {
          navigate(`/products/${response.data.id}`);
        }, 1500);
      } else {
        throw new Error(response.data?.message || 'Failed to list product');
      }
      
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers
        },
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers
        }
      });
      
      let errorMessage = 'Failed to list product. Please try again.';
      
      if (err.response) {
        // Server responded with a status code that falls out of the range of 2xx
        if (err.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
          localStorage.removeItem('token');
          navigate('/login');
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Invalid input. Please check your form data.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (err.response.status === 409) {
          errorMessage = 'A product with this name already exists.';
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="mx-auto" style={{ maxWidth: '800px' }}>
        <h2 className="mb-4">Sell Your Product</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Product Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter product description"
            />
          </Form.Group>

          <div className="row">
            <Form.Group className="col-md-6 mb-3" controlId="price">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control
                type="number"
                min="0.01"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </Form.Group>

            <Form.Group className="col-md-6 mb-3" controlId="stock">
              <Form.Label>Stock Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </div>

          <Form.Group className="mb-3" controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home">Home & Garden</option>
              <option value="Books">Books</option>
              <option value="Toys">Toys & Games</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-4" controlId="image">
            <Form.Label>Product Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              name="image"
              onChange={handleChange}
              required
            />
            <Form.Text className="text-muted">
              Upload a clear photo of your product
            </Form.Text>
          </Form.Group>

          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              type="submit" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Listing...
                </>
              ) : (
                'List Product for Sale'
              )}
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default SellProduct;

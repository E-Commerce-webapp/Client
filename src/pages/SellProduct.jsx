import { useState } from "react";
import { Alert, Button, Container, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";

const SellProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: 1,
    image: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Product name is required");
      return false;
    }
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setError("Please enter a valid price");
      return false;
    }
    if (!formData.category) {
      setError("Please select a category");
      return false;
    }
    if (formData.stock < 1) {
      setError("Stock must be at least 1");
      return false;
    }
    if (!formData.image) {
      setError("Please select an image");
      return false;
    }
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, etc.)");
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    setError(""); // Clear any previous errors
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Convert numeric fields to numbers
    const processedValue =
      type === "number" ? (value === "" ? "" : parseFloat(value)) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    const token = localStorage.getItem("token");
    if (!token || !isTokenValid(token)) {
      setError("Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price.toString());
      formDataToSend.append("category", formData.category);
      formDataToSend.append("stock", formData.stock.toString());

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      // Rest of your success handling...
    } catch (err) {
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      let errorMessage = "Failed to list product. Please try again.";
      if (err.response?.status === 401) {
        errorMessage = "Your session has expired. Please log in again.";
        localStorage.removeItem("token");
        navigate("/login");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="mx-auto" style={{ maxWidth: "800px" }}>
        <h2 className="mb-4">Sell Your Product</h2>

        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
              disabled={isLoading}
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
              onChange={handleImageChange}
              required
              disabled={isLoading}
            />
            <Form.Text className="text-muted">
              Upload a clear photo of your product (max 5MB)
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
                "List Product for Sale"
              )}
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default SellProduct;

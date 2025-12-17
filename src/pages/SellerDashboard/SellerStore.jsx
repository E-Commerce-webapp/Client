import React, { useEffect, useState } from "react";
import { Card, Row, Col, Badge, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import ProductCard from "../../components/ProductCard";

const SellerStore = () => {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      if (!token) {
        setError("You must be logged in to view your store.");
        setLoading(false);
        return;
      }

      try {
        // First, get current user to obtain their ID
        const userRes = await axios.get(`${baseUrl}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = userRes.data;
        if (!user || !user.id) {
          throw new Error("User information is missing.");
        }

        // Then, fetch the store for this user
        const storeRes = await axios.get(`${baseUrl}/stores/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const currentStore = storeRes.data;
        setStore(currentStore);

        // Fetch all internal products and filter by this seller (store owner)
        const productsRes = await axios.get(`${baseUrl}/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allProducts = productsRes.data || [];
        const sellerProducts = allProducts.filter(
          (p) => p.storeId === currentStore.id
        );
        setProducts(sellerProducts);
      } catch (err) {
        console.error("Error fetching store:", err);
        
        // If 404, user doesn't have a store yet - not an error, just no store
        if (err.response?.status === 404) {
          setStore(null);
          setLoading(false);
          return;
        }
        
        const message =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to load store information.";
        setError(typeof message === "string" ? message : "Failed to load store information.");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreAndProducts();
  }, [baseUrl, token]);

  const renderStatusBadge = (status) => {
    if (!status) return null;
    const normalized = status.toString();
    let variant = "secondary";

    if (normalized === "ACTIVE") variant = "success";
    else if (normalized === "PENDING") variant = "warning";
    else if (normalized === "SUSPENDED") variant = "danger";

    return (
      <Badge bg={variant} className="ms-2">
        {normalized.charAt(0) + normalized.slice(1).toLowerCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-4">
        <Alert variant="info">No store found for your account.</Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="fw-bold mb-4">
        My Store
        {renderStatusBadge(store.status)}
      </h2>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <h4 className="fw-bold mb-1">{store.name}</h4>
              <div className="text-muted">Store ID: {store.id}</div>
            </Col>
            <Col md={6} className="text-md-end mt-3 mt-md-0">
              <div className="text-muted">Phone</div>
              <div className="fw-semibold">{store.phoneNumber || "Not provided"}</div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <div className="text-muted mb-1">Address</div>
              <div>{store.address || "Not provided"}</div>
            </Col>
          </Row>

          <Row>
            <Col>
              <div className="text-muted mb-1">Description</div>
              <div>{store.description || "No description provided."}</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <h4 className="fw-bold mb-3">Products in this Store</h4>

      {products.length === 0 ? (
        <Alert variant="info">You have no products in this store yet.</Alert>
      ) : (
        <Row className="g-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Row>
      )}
    </div>
  );
};

export default SellerStore;

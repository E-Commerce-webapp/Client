import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaBoxOpen,
  FaSearch,
  FaCalendarAlt,
  FaCheckCircle,
  FaHome,
} from "react-icons/fa";
import { getOrders } from "../services/orderService";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders();
        // Response is already the data array from the API
        setOrders(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load order history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "success";
      case "shipped":
        return "primary";
      case "processing":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading your orders...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Orders</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex justify-content-center gap-2">
            <Button
              variant="outline-danger"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
            <Button as={Link} to="/" variant="outline-secondary">
              <FaHome className="me-1" /> Back to Home
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container className="py-5 text-center">
        <div className="py-5">
          <FaBoxOpen size={48} className="text-muted mb-3" />
          <h2>No Orders Found</h2>
          <p className="text-muted mb-4">You haven't placed any orders yet.</p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/" className="btn btn-primary">
              <FaHome className="me-1" /> Start Shopping
            </Link>
            <Button
              variant="outline-secondary"
              onClick={() => window.location.reload()}
            >
              Refresh Orders
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Orders</h2>
        <div>
          <Link to="/" className="btn btn-outline-secondary me-2">
            Continue Shopping
          </Link>
        </div>
      </div>

      {orders.map((order) => (
        <Card key={order.id} className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted me-3">Order #{order.id}</span>
              <Badge bg={getStatusVariant(order.status)} className="me-2">
                {order.status}
              </Badge>
              {order.status === "Delivered" && (
                <Badge bg="success" className="me-2">
                  <FaCheckCircle className="me-1" /> Delivered
                </Badge>
              )}
            </div>
            <div className="text-muted">
              <FaCalendarAlt className="me-1" />
              {formatDate(order.date)}
            </div>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={`${order.id}-${item.id}`}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              marginRight: "15px",
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/50";
                            }}
                          />
                          <div>
                            <div className="fw-bold">{item.name}</div>
                            <small className="text-muted">SKU: {item.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td className="text-end">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end fw-bold">
                      Order Total:
                    </td>
                    <td className="text-end fw-bold">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>

            <div className="row mt-4">
              <div className="col-md-6 mb-3 mb-md-0">
                <h6>Shipping Address</h6>
                <address className="mb-0">
                  {order.shippingAddress.name}
                  <br />
                  {order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                </address>
              </div>
              <div className="col-md-6">
                <h6>Payment Method</h6>
                <p className="mb-1">{order.paymentMethod}</p>
                <p className="text-success mb-0">
                  <FaCheckCircle className="me-1" /> {order.paymentStatus}
                </p>
              </div>
            </div>
          </Card.Body>
          <Card.Footer className="d-flex justify-content-between align-items-center">
            <div>
              <Link
                to={`/orders/${order.id}`}
                className="btn btn-sm btn-outline-primary me-2"
              >
                <FaSearch className="me-1" /> View Details
              </Link>
              <Button variant="outline-secondary" size="sm" className="me-2">
                Track Order
              </Button>
            </div>
            <div>
              <Button variant="outline-success" size="sm" className="me-2">
                Buy Again
              </Button>
              <Button variant="outline-danger" size="sm">
                Return Items
              </Button>
            </div>
          </Card.Footer>
        </Card>
      ))}
    </Container>
  );
};

export default OrderHistory;

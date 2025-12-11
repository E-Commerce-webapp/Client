import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Badge,
  Alert,
  Spinner,
  Form,
  Modal,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaPrint,
  FaMapMarkerAlt,
  FaCreditCard,
  FaTruck,
  FaCheckCircle,
  FaUser,
  FaBox,
  FaEdit,
} from "react-icons/fa";
import { getOrderById, updateOrderStatus } from "../../services/orderService";

const SellerOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getOrderById(orderId);

      if (response.data) {
        setOrder(response.data);
        setNewStatus(response.data.status);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(
        err.message || "Failed to load order details. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "success";
      case "shipped":
        return "primary";
      case "processing":
        return "warning";
      case "confirmed":
        return "info";
      case "cancelled":
        return "danger";
      case "pending":
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString) => {
    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Date not available";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return;

    try {
      setUpdating(true);
      await updateOrderStatus(order.id, newStatus);
      setShowStatusModal(false);
      fetchOrder(); // Refresh order data
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading order details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Order</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex gap-2">
            <Button
              variant="outline-danger"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-1" /> Back to Orders
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          <h4>Order Not Found</h4>
          <p>We couldn't find an order with ID: {orderId}</p>
          <Button
            variant="outline-warning"
            onClick={() => navigate("/seller/orders")}
          >
            <FaBox className="me-1" /> View All Orders
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button
          variant="outline-secondary"
          onClick={() => navigate("/seller/orders")}
        >
          <FaArrowLeft className="me-1" /> Back to Customer Orders
        </Button>
        <div className="d-print-none">
          <Button
            variant="outline-secondary"
            className="me-2"
            onClick={handlePrint}
          >
            <FaPrint className="me-1" /> Print
          </Button>
          <Button variant="primary" onClick={() => setShowStatusModal(true)}>
            <FaEdit className="me-1" /> Update Status
          </Button>
        </div>
      </div>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-white">
          <div>
            <h4 className="mb-0">Order #{order.id?.slice(-8)}</h4>
            <small className="text-muted">
              Placed on {formatDate(order.createdAt)}
            </small>
          </div>
          <Badge
            bg={getStatusVariant(order.status)}
            className="fs-6 p-2"
            style={{ cursor: "pointer" }}
            onClick={() => setShowStatusModal(true)}
          >
            {order.status}
          </Badge>
        </Card.Header>

        <Card.Body>
          {/* Customer & Shipping Info */}
          <Row className="mb-4">
            <Col md={4} className="mb-3 mb-md-0">
              <Card className="h-100 border">
                <Card.Header className="bg-light d-flex align-items-center">
                  <FaUser className="me-2" />
                  <h6 className="mb-0">Customer Information</h6>
                </Card.Header>
                <Card.Body>
                  <div className="mb-2">
                    <strong>Name:</strong>
                    <br />
                    {order.shippingAddress?.fullName || "N/A"}
                  </div>
                  <div>
                    <strong>Contact:</strong>
                    <br />
                    {order.shippingAddress?.phoneNumber || "N/A"}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3 mb-md-0">
              <Card className="h-100 border">
                <Card.Header className="bg-light d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2" />
                  <h6 className="mb-0">Shipping Address</h6>
                </Card.Header>
                <Card.Body>
                  <address className="mb-0">
                    {order.shippingAddress?.addressLine1}
                    <br />
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.postalCode}
                    <br />
                    {order.shippingAddress?.country}
                  </address>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border">
                <Card.Header className="bg-light d-flex align-items-center">
                  <FaCreditCard className="me-2" />
                  <h6 className="mb-0">Payment Info</h6>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      <FaCreditCard size={24} />
                    </div>
                    <div>
                      <div className="fw-bold">{order.paymentMethod}</div>
                      <div className="text-success">
                        <FaCheckCircle className="me-1" /> Paid
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Order Items */}
          <h5 className="mb-3">
            <FaBox className="me-2" />
            Order Items
          </h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "45%" }}>Product</th>
                  <th className="text-center">Price</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            marginRight: "15px",
                            borderRadius: "4px",
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div>
                          <div className="fw-bold">{item.productTitle}</div>
                          <small className="text-muted">
                            SKU: {item.productId?.slice(-8)}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="text-center align-middle">
                      ${item.price?.toFixed(2)}
                    </td>
                    <td className="text-center align-middle">{item.quantity}</td>
                    <td className="text-end align-middle">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <td colSpan="3" className="text-end">
                    Subtotal:
                  </td>
                  <td className="text-end">${order.subtotal?.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end">
                    Shipping:
                  </td>
                  <td className="text-end">${order.shippingCost?.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end">
                    Tax:
                  </td>
                  <td className="text-end">${order.taxAmount?.toFixed(2)}</td>
                </tr>
                <tr className="fw-bold">
                  <td colSpan="3" className="text-end">
                    Total:
                  </td>
                  <td className="text-end">${order.totalAmount?.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Order Status Timeline */}
          <Card className="mt-4 border">
            <Card.Header className="bg-light">
              <FaTruck className="me-2" />
              <strong>Order Status</strong>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].map(
                  (status, index) => {
                    const currentIndex = [
                      "PENDING",
                      "CONFIRMED",
                      "PROCESSING",
                      "SHIPPED",
                      "DELIVERED",
                    ].indexOf(order.status?.toUpperCase());
                    const isActive = index <= currentIndex;
                    const isCurrent = status === order.status?.toUpperCase();

                    return (
                      <div
                        key={status}
                        className="text-center"
                        style={{ flex: 1 }}
                      >
                        <div
                          className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${
                            isActive ? "bg-success text-white" : "bg-light"
                          }`}
                          style={{
                            width: "40px",
                            height: "40px",
                            border: isCurrent ? "3px solid #198754" : "none",
                          }}
                        >
                          {isActive && <FaCheckCircle />}
                        </div>
                        <small
                          className={isActive ? "fw-bold" : "text-muted"}
                        >
                          {status}
                        </small>
                      </div>
                    );
                  }
                )}
              </div>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Order: <strong>#{order.id?.slice(-8)}</strong>
          </p>
          <p>
            Customer: <strong>{order.shippingAddress?.fullName}</strong>
          </p>
          <Form.Group>
            <Form.Label>New Status</Form.Label>
            <Form.Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleStatusUpdate}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Status"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SellerOrderDetail;

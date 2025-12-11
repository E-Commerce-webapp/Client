import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
  Form,
  Modal,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaEye, FaCheckCircle, FaTruck, FaBox, FaTimes } from "react-icons/fa";
import { getSellerOrders, updateOrderStatus } from "../../services/orderService";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getSellerOrders();
      setOrders(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error fetching seller orders:", err);
      setError("Failed to load orders. Please try again later.");
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
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return "N/A";
    }
  };

  const handleStatusClick = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setUpdating(true);
      await updateOrderStatus(selectedOrder.id, newStatus);
      setShowStatusModal(false);
      fetchOrders(); // Refresh orders
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter(
          (order) => order.status?.toLowerCase() === statusFilter.toLowerCase()
        );

  if (loading) {
    return (
      <div className="p-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Orders</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchOrders}>
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Customer Orders</h2>
        <Form.Select
          style={{ width: "200px" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </Form.Select>
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <FaBox size={48} className="text-muted mb-3" />
            <h4>No Orders Found</h4>
            <p className="text-muted">
              {statusFilter === "all"
                ? "You haven't received any orders yet."
                : `No orders with status "${statusFilter}".`}
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <code>#{order.id?.slice(-8)}</code>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.shippingAddress?.fullName || "N/A"}</td>
                    <td>
                      {order.items?.length || 0} item(s)
                      <br />
                      <small className="text-muted">
                        {order.items
                          ?.slice(0, 2)
                          .map((item) => item.productTitle)
                          .join(", ")}
                        {order.items?.length > 2 && "..."}
                      </small>
                    </td>
                    <td className="fw-bold">
                      ${order.totalAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td>
                      <Badge
                        bg={getStatusVariant(order.status)}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleStatusClick(order)}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td>
                      <Link
                        to={`/seller/orders/${order.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <FaEye className="me-1" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Order: <strong>#{selectedOrder?.id?.slice(-8)}</strong>
          </p>
          <p>
            Customer: <strong>{selectedOrder?.shippingAddress?.fullName}</strong>
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

export default SellerOrders;

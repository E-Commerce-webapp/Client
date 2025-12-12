import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../services/orderService";
import { Button } from "@/components/ui/button";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getOrderById(orderId);
      setOrder(response.data);
    } catch (err) {
      console.error("Error loading order:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load the order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleString();
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancelling(true);
      await cancelOrder(orderId);
      // Refresh order data
      const response = await getOrderById(orderId);
      if (response.data) {
        setOrder(response.data);
      }
      alert('Order cancelled successfully.');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.error || 'Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-6">
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error || "Order not found."}
        </div>
        <Button asChild variant="outline">
          <Link to="/orders" className="inline-flex items-center gap-2">
            <FaArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  const subtotal =
    order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Order #{order.id}
          </h2>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <FaCalendarAlt className="h-3 w-3" />
            {formatDate(order.date)}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/orders" className="inline-flex items-center gap-2">
            <FaArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-3 text-sm">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="text-base font-semibold text-foreground">
            {order.status}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-sm">
          <p className="text-xs text-muted-foreground">Items</p>
          <p className="text-base font-semibold text-foreground">
            {order.items?.length || 0}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-sm">
          <p className="text-xs text-muted-foreground">Total Amount</p>
          <p className="text-base font-semibold text-foreground">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>
      </div>

      <div className="mb-4 overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
          Items in this order
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Product</th>
                <th className="px-4 py-2 font-medium">Price</th>
                <th className="px-4 py-2 font-medium">Qty</th>
                <th className="px-4 py-2 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr
                  key={item.productId}
                  className="border-t border-border text-xs"
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded bg-muted">
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="font-medium text-foreground">
                        {item.productTitle}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 text-sm">
        <div className="flex w-full max-w-xs justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex w-full max-w-xs justify-between text-muted-foreground">
          <span>Shipping</span>
          <span>{formatCurrency(order.shippingAmount || 0)}</span>
        </div>
        <div className="flex w-full max-w-xs justify-between text-foreground font-semibold">
          <span>Total</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0">Order #{order.id}</h4>
            <small className="text-muted">Placed on {formatDate(order.createdAt)}</small>
          </div>
          <Badge bg={getStatusVariant(order.status)} className="fs-6 p-2">
            {order.status}
          </Badge>
        </Card.Header>
        
        <Card.Body>
          {/* Order Summary */}
          <Row className="mb-4">
            <Col md={4} className="mb-3 mb-md-0">
              <Card className="h-100">
                <Card.Header className="bg-light d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2" />
                  <h6 className="mb-0">Shipping Address</h6>
                </Card.Header>
                <Card.Body>
                  <address className="mb-0">
                    <strong>{order.shippingAddress.fullName}</strong><br />
                    {order.shippingAddress.addressLine1}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                    {order.shippingAddress.country}
                  </address>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-3 mb-md-0">
              <Card className="h-100">
                <Card.Header className="bg-light d-flex align-items-center">
                  <FaCreditCard className="me-2" />
                  <h6 className="mb-0">Payment Method</h6>
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
            
            <Col md={4}>
              <Card className="h-100">
                <Card.Header className="bg-light d-flex align-items-center">
                  <FaTruck className="me-2" />
                  <h6 className="mb-0">Order Summary</h6>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping:</span>
                    <span>${order.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax:</span>
                    <span>${order.taxAmount.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Order Items */}
          <h5 className="mb-3">Order Items</h5>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Product</th>
                  <th className="text-center">Price</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={item.productImage} 
                          alt={item.productTitle}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '15px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div>
                          <Link to={`/products/${item.productId}`} className="fw-bold text-decoration-none text-dark">
                            {item.productTitle}
                          </Link>
                          <br />
                          <small className="text-muted">ID: {item.productId}</small>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">${item.price.toFixed(2)}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Subtotal:</td>
                  <td className="text-end">${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Shipping:</td>
                  <td className="text-end">${order.shippingCost.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Tax:</td>
                  <td className="text-end">${order.taxAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Total:</td>
                  <td className="text-end fw-bold">${order.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card.Body>
        
        <Card.Footer className="d-flex justify-content-between d-print-none">
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-1" /> Back to Orders
          </Button>
          <div>
            {order.status?.toUpperCase() === 'PENDING' && (
              <Button 
                variant="outline-danger" 
                className="me-2"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                <FaTimes className="me-1" /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            )}
            <Button variant="outline-success" className="me-2">
              Track Order
            </Button>
            <Button variant="primary">
              Buy Again
            </Button>
          </div>
        </Card.Footer>
      </Card>
      
      <div className="d-print-none">
        <Card>
          <Card.Body>
            <h5>Need Help?</h5>
            <p className="mb-0">
              If you have any questions about your order, please contact our 
              <Link to="/contact" className="ms-1">customer support</Link>.
            </p>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetail;

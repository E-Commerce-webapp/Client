import React from "react";
import { Card, Row, Col, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SellerHub = () => {
  const navigate = useNavigate();
  // Mock Data
  const stats = {
    earnings: 12450.5,
    orders: 24,
    products: 3,
  };

  const recentOrders = [
    {
      id: "#ORD-001",
      product: "Wireless Headphones",
      date: "2023-10-25",
      customer: "Alice Freeman",
      total: 129.99,
      status: "Delivered",
    },
    {
      id: "#ORD-002",
      product: "Smart Watch Series 5",
      date: "2023-10-26",
      customer: "Bob Smith",
      total: 249.5,
      status: "Processing",
    },
    {
      id: "#ORD-003",
      product: "Laptop Stand",
      date: "2023-10-27",
      customer: "Charlie Brown",
      total: 45.0,
      status: "Shipped",
    },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Seller Hub</h2>
        <Button variant="dark" onClick={() => navigate('/sell')}>
          <i className="bi bi-plus-lg me-2"></i>
          Add Product
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="btn-group bg-light p-1 rounded">
          <Button variant="light" className="fw-bold shadow-sm">
            Dashboard
          </Button>
          <Button variant="light" className="text-muted border-0">
            Products
          </Button>
          <Button variant="light" className="text-muted border-0">
            Orders
          </Button>
          <Button variant="light" className="text-muted border-0">
            Earnings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Total Earnings</span>
                <i className="bi bi-currency-dollar text-muted"></i>
              </div>
              <h3 className="fw-bold">${stats.earnings.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">New Orders</span>
                <i className="bi bi-bag text-muted"></i>
              </div>
              <h3 className="fw-bold">{stats.orders}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Products</span>
                <i className="bi bi-box text-muted"></i>
              </div>
              <h3 className="fw-bold">{stats.products}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Earnings Report Chart Placeholder */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <h5 className="card-title mb-4">Earnings Report</h5>
          <div className="position-relative" style={{ height: "300px" }}>
            {/* Simple SVG Line Chart */}
            <svg
              viewBox="0 0 800 300"
              className="w-100 h-100"
              preserveAspectRatio="none"
            >
              {/* Grid Lines */}
              <line
                x1="0"
                y1="250"
                x2="800"
                y2="250"
                stroke="#eee"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="190"
                x2="800"
                y2="190"
                stroke="#eee"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="130"
                x2="800"
                y2="130"
                stroke="#eee"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="70"
                x2="800"
                y2="70"
                stroke="#eee"
                strokeWidth="1"
              />

              {/* Y Axis Labels */}
              <text x="10" y="250" fill="#999" fontSize="12">
                0
              </text>
              <text x="10" y="190" fill="#999" fontSize="12">
                3500
              </text>
              <text x="10" y="130" fill="#999" fontSize="12">
                7000
              </text>
              <text x="10" y="70" fill="#999" fontSize="12">
                10500
              </text>
              <text x="10" y="10" fill="#999" fontSize="12">
                14000
              </text>

              {/* The Line */}
              <path
                d="M50,200 C150,190 250,150 350,130 S550,140 650,80 S750,90 800,100"
                fill="none"
                stroke="black"
                strokeWidth="2"
              />
              {/* Points */}
              <circle
                cx="50"
                cy="200"
                r="4"
                fill="white"
                stroke="black"
                strokeWidth="2"
              />
              <circle
                cx="350"
                cy="130"
                r="4"
                fill="white"
                stroke="black"
                strokeWidth="2"
              />
              <circle
                cx="650"
                cy="80"
                r="4"
                fill="white"
                stroke="black"
                strokeWidth="2"
              />
              <circle
                cx="800"
                cy="100"
                r="4"
                fill="white"
                stroke="black"
                strokeWidth="2"
              />

              {/* X Axis Labels */}
              <text
                x="50"
                y="280"
                fill="#999"
                fontSize="12"
                textAnchor="middle"
              >
                Jan
              </text>
              <text
                x="200"
                y="280"
                fill="#999"
                fontSize="12"
                textAnchor="middle"
              >
                Feb
              </text>
              <text
                x="350"
                y="280"
                fill="#999"
                fontSize="12"
                textAnchor="middle"
              >
                Mar
              </text>
              <text
                x="500"
                y="280"
                fill="#999"
                fontSize="12"
                textAnchor="middle"
              >
                Apr
              </text>
              <text
                x="650"
                y="280"
                fill="#999"
                fontSize="12"
                textAnchor="middle"
              >
                May
              </text>
              <text
                x="800"
                y="280"
                fill="#999"
                fontSize="12"
                textAnchor="middle"
              >
                Jun
              </text>
            </svg>
          </div>
        </Card.Body>
      </Card>

      {/* Recent Orders */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="card-title mb-3">Recent Orders</h5>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.product}</td>
                  <td>{order.date}</td>
                  <td>{order.customer}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>
                    <span
                      className={`badge bg-${
                        order.status === "Delivered"
                          ? "success"
                          : order.status === "Processing"
                          ? "warning"
                          : "primary"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SellerHub;

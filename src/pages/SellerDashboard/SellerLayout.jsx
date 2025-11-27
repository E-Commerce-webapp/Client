import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const SellerLayout = ({ children }) => {
  return (
    <Container fluid className="py-4">
      <Row>
        {/* Sidebar */}
        <Col md={3} lg={2} className="d-none d-md-block">
          <div className="sticky-top" style={{ top: "80px" }}>
            <h5 className="mb-4 px-3">STORE</h5>
            <Nav className="flex-column">
              <Nav.Link as={NavLink} to="/profile" className="text-dark mb-2">
                Profile
              </Nav.Link>
              <Nav.Link as={NavLink} to="/orders" className="text-dark mb-2">
                My Orders
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/seller"
                className="bg-light fw-bold text-dark rounded mb-2"
              >
                Seller Hub
              </Nav.Link>
              <Nav.Link as={NavLink} to="/settings" className="text-dark mb-2">
                Account Settings
              </Nav.Link>
            </Nav>
          </div>
        </Col>

        {/* Main Content */}
        <Col md={9} lg={10}>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default SellerLayout;

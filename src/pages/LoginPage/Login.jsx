import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { handleApiError } from "../../utils/api";

const Login = () => {
  const [step, setStep] = useState("email");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    address: ""
  });
  

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmailStep = async (email) => {
    try {
      setError("");
      setIsLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/auth/check-email/${email}`
      );

      if (res.data.exists) {
        setStep("login");
      } else {
        setStep("register");
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginStep = async () => {
    try {
      setError("");
      setIsLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/");
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterStep = async () => {
    try {
      setError("");
      setIsLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/register`,
        {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
        }
      );

      if (response.status == 200) {
        setStep("login");
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === "email") {
      await handleEmailStep(formData.email);
    } else if (step === "login") {
      await handleLoginStep();
    } else {
      await handleRegisterStep();
    }
  };

  const renderTitle = () => {
    if (step === "email") return "Login or Register Instantly";
    if (step === "login") return "Welcome back";
    return "Create your account";
  };

  console.log("Current step:", step);

  return (
    <Container className="py-5" style={{ maxWidth: "500px" }}>
      <h2 className="text-center mb-4">{renderTitle()}</h2>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter email"
            disabled={step !== "email"}
          />
        </Form.Group>

        {step === "register" && (
          <>
            <Form.Group className="mb-3" controlId="firstName">
              <Form.Label>First name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Your first name"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="lastName">
              <Form.Label>Last name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Your last name"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Your address"
              />
            </Form.Group>
          </>
        )}

        {(step === "login" || step === "register") && (
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>
              {step === "login" ? "Password" : "Create a password"}
            </Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder={
                step === "login" ? "Enter your password" : "Choose a password"
              }
            />
          </Form.Group>
        )}

        <div className="d-grid gap-2">
          <Button variant="primary" type="submit" disabled={isLoading}>
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
                {step === "email"
                  ? "Checking..."
                  : step === "login"
                  ? "Logging in..."
                  : "Creating account..."}
              </>
            ) : (
              <>
                {step === "email" && "Continue"}
                {step === "login" && "Login"}
                {step === "register" && "Create account"}
              </>
            )}
          </Button>
        </div>

        {step !== "email" && (
          <div className="text-center mt-3">
            <Button
              variant="link"
              type="button"
              onClick={() => setStep("email")}
              disabled={isLoading}
              className="text-decoration-none"
            >
              Use a different email
            </Button>
          </div>
        )}
      </Form>
    </Container>
  );
};

export default Login;

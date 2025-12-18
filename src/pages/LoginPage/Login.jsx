import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { handleApiError } from "../../utils/api";
import { Button } from "@/components/ui/button";

const Login = () => {
  const [step, setStep] = useState("email");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailStep = async () => {
    try {
      setError("");
      setIsLoading(true);

      const response = await axios.get(`${baseUrl}/auth/check-email/${formData.email}`, {
      });

      if (response.data.exists) {
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

      const response = await axios.post(`${baseUrl}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.userId) {
          localStorage.setItem("userId", response.data.userId);
        }
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

      await axios.post(`${baseUrl}/auth/register`, {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
      });

      // Registration successful, now auto-login
      const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (loginResponse.data.token) {
        localStorage.setItem("token", loginResponse.data.token);
        if (loginResponse.data.userId) {
          localStorage.setItem("userId", loginResponse.data.userId);
        }
        navigate("/");
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
      await handleEmailStep();
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

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-center text-xl font-semibold text-foreground">
          {renderTitle()}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <div className="flex items-start justify-between gap-2">
              <span>{error}</span>
              <button
                type="button"
                className="text-xs text-destructive/80"
                onClick={() => setError("")}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading || step !== "email"}
            />
          </div>

          {step !== "email" && (
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          )}

          {step === "register" && (
            <>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <label
                    htmlFor="firstName"
                    className="text-sm font-medium text-foreground"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label
                    htmlFor="lastName"
                    className="text-sm font-medium text-foreground"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-foreground"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              className="flex w-full items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-transparent" />
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
        </form>

        {step !== "email" && (
          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-xs text-muted-foreground underline hover:text-foreground"
              onClick={() => setStep("email")}
              disabled={isLoading}
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

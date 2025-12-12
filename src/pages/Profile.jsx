import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load user data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, navigate, baseUrl]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="mx-auto max-w-xl px-4 py-6 text-center text-sm text-muted-foreground">
        {error || "User not found."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h2 className="mb-4 text-xl font-semibold text-foreground">
        My Profile
      </h2>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <h3 className="text-lg font-semibold text-foreground">
              {userData.name || "Unnamed User"}
            </h3>
            <p className="text-sm text-muted-foreground">{userData.email}</p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-3xl font-semibold text-primary">
            {(userData.name || userData.email || "U")
              .charAt(0)
              .toUpperCase()}
          </div>
        </div>

        <div className="mb-6">
          <h5 className="mb-2 text-sm font-semibold text-foreground">
            Account Information
          </h5>
          <div className="h-px w-full bg-border" />
          <div className="mt-3 grid gap-4 text-sm text-foreground md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Name
              </p>
              <p>{userData.name || "Not provided"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Email
              </p>
              <p>{userData.email}</p>
            </div>
            {userData.phone && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Phone
                </p>
                <p>{userData.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => navigate("/orders")}
          >
            View Orders
          </Button>
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => navigate("/seller")}
          >
            Seller Hub
          </Button>
          <Button
            variant="outline"
            className="ml-auto text-sm text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

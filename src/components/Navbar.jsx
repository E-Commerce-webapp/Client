import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../contexts/CartContext";
import SearchBar from "./SearchBar";
import { isTokenValid } from "../utils/auth";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Home,
  Store,
  ShoppingCart,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Package,
} from "lucide-react";

export default function Navbar() {
  const { cartCount } = useCart();
  const token = localStorage.getItem("token");
  const loggedIn = token && isTokenValid(token);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [isASeller, setIsASeller] = useState(null);
  const [userFullName, setUserFullName] = useState(null);

  useEffect(() => {
    const fetchSellerStatus = async () => {
      if (!loggedIn) {
        setIsASeller(null);
        return;
      }

      try {
        const res = await axios.get(`${baseUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsASeller(!!res.data?.isASeller);
        if (res.data?.firstName || res.data?.lastName) {
          setUserFullName(`${res.data.firstName || ''} ${res.data.lastName || ''}`.trim());
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
        }
        setIsASeller(null);
        setUserFullName(null);
      }
    };

    fetchSellerStatus();
  }, [baseUrl, loggedIn, token]);

  const userName = useMemo(() => {
    if (userFullName) return userFullName;
    if (!token) return "Account";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || "Account";
    } catch {
      return "Account";
    }
  }, [token, userFullName]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    [
      "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium",
      "text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/70 transition-colors",
      isActive && "bg-zinc-800 text-zinc-50",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-linear-to-b from-zinc-950 to-zinc-900/95 backdrop-blur">
      <div className="flex h-14 w-full items-center gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="text-lg font-semibold tracking-tight text-zinc-50 hover:text-white"
        >
          EcomSphere
        </NavLink>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-xl">
            <SearchBar />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <NavLink to="/" end className={navLinkClass}>
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </NavLink>

          {loggedIn && isASeller === true && (
            <NavLink to="/seller" className={navLinkClass}>
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Seller Hub</span>
            </NavLink>
          )}

          {loggedIn && isASeller === false && (
            <NavLink to="/become-seller" className={navLinkClass}>
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Become a Seller</span>
            </NavLink>
          )}

          <NavLink to="/cart" className={navLinkClass}>
            <div className="relative flex items-center gap-1">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </div>
          </NavLink>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 text-xs sm:text-sm text-zinc-200 cursor-pointer hover:bg-zinc-800/70 hover:text-zinc-50 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-zinc-700 bg-zinc-900 text-zinc-100"
            >
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {loggedIn ? (
                <>
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/orders")}
                    className="cursor-pointer"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-400 focus:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={() => navigate("/login")}
                    className="cursor-pointer"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Login</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/register")}
                    className="cursor-pointer"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Register</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border-t border-zinc-800 px-4 pb-3 pt-2 md:hidden">
        <SearchBar />
      </div>
    </nav>
  );
}

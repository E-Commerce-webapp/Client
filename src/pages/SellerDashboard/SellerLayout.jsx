import React from "react";
import { NavLink } from "react-router-dom";

const SellerLayout = ({ children }) => {
  const linkClasses = ({ isActive }) =>
    [
      "block rounded-md px-3 py-2 text-sm transition-colors",
      isActive
        ? "bg-foreground text-background font-semibold"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    ].join(" ");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-6 md:grid-cols-[220px,1fr]">
        <aside className="hidden rounded-xl border border-border bg-card p-4 text-sm shadow-sm md:block">
          <h5 className="mb-3 text-xs font-semibold text-muted-foreground">
            STORE
          </h5>
          <nav className="space-y-1">
            <NavLink to="/profile" className={linkClasses}>
              Profile
            </NavLink>
            <NavLink to="/seller" end className={linkClasses}>
              Seller Hub
            </NavLink>
            <NavLink to="/seller/kyc" className={linkClasses}>
              Store Setup
            </NavLink>
            <NavLink to="/settings" className={linkClasses}>
              Account Settings
            </NavLink>
          </nav>
        </aside>

        <main className="rounded-xl border border-border bg-card p-4 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;

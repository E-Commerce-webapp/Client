import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const {
    cart,
    cartTotal,
    cartCount,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <i
            className="bi bi-cart-x text-muted-foreground"
            style={{ fontSize: "4rem" }}
          ></i>
          <h2 className="mt-3 text-xl font-semibold text-foreground">
            Your cart is empty
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Looks like you haven&apos;t added any items to your cart yet.
          </p>
          <Button asChild className="mt-4">
            <Link to="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Your Cart{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({cartCount} {cartCount === 1 ? "item" : "items"})
          </span>
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={clearCart}
          className="text-xs sm:text-sm"
        >
          Clear Cart
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-start gap-4 border-b border-border px-4 py-3 last:border-b-0 sm:flex-row sm:items-center"
          >
            <div className="w-full shrink-0 sm:w-24">
              <img
                src={item.images}
                alt={item.title}
                className="h-20 w-full rounded-md object-contain"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h6 className="truncate text-sm font-medium text-foreground">
                {item.name}
              </h6>
              <p className="text-xs text-muted-foreground">
                ${item.price.toFixed(2)} each
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  -
                </Button>
                <input
                  type="number"
                  className="h-8 w-14 rounded-md border border-input bg-background text-center text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                  value={item.quantity}
                  onChange={(e) => {
                    const newQty = parseInt(e.target.value);
                    if (!isNaN(newQty) && newQty >= 1) {
                      updateQuantity(item.id, newQty);
                    }
                  }}
                  min={1}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="ml-auto flex flex-col items-end gap-1">
              <div className="text-sm font-semibold text-foreground">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => removeFromCart(item.id)}
              >
                <i className="bi bi-trash" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-end gap-3">
        <div className="text-right text-sm">
          <div className="text-muted-foreground">Subtotal</div>
          <div className="text-xl font-semibold text-foreground">
            ${cartTotal.toFixed(2)}
          </div>
        </div>
        <div className="flex w-full flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <Button asChild variant="outline">
            <Link to="/" className="inline-flex items-center gap-2 text-sm">
              <i className="bi bi-arrow-left" />
              Continue Shopping
            </Link>
          </Button>
          <Button asChild>
            <Link to="/checkout" className="text-sm">
              Proceed to Checkout
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

const DELIVERY_FEE = 25.00;      // keep aligned with Zoho Books
const SALES_TAX_RATE = 0.08375;

function roundCents(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Tax applies to subtotal + delivery fee
function calculateOrderTotals(cart) {
  const subtotal = roundCents(cart.reduce((sum, i) => sum + i.price * i.qty, 0));
  const tax = roundCents((subtotal + DELIVERY_FEE) * SALES_TAX_RATE);
  const total = roundCents(subtotal + DELIVERY_FEE + tax);
  return { subtotal, tax, total };
}

function formatMoney(n) {
  return `$${n.toFixed(2)}`;
}

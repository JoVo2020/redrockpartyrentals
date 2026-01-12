const CART_KEY = 'rr_cart';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}

function addToCart(item) {
  const cart = loadCart();
  const existing = cart.find(i => i.id === item.id);

  if (existing) {
    existing.qty += item.qty || 1;
  } else {
    cart.push({ ...item, qty: item.qty || 1 });
  }

  saveCart(cart);
  return cart;
}

function updateQty(id, qty) {
  const cart = loadCart();
  const item = cart.find(i => i.id === id);
  if (!item) return cart;

  item.qty = Math.max(1, qty);
  saveCart(cart);
  return cart;
}

function removeFromCart(id) {
  const cart = loadCart().filter(i => i.id !== id);
  saveCart(cart);
  return cart;
}

function cartSubtotal() {
  return loadCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

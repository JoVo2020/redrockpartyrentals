const CART_KEY = 'rrpr_cart';

/* --------------------
   Core helpers
-------------------- */
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* --------------------
   Cart actions
-------------------- */
function addToCartOLD(item) {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id);

	if (existing) {
	  if (existing.qty < existing.availableQty) {
		existing.qty += 1;
	  } else {
		alert(`Only ${existing.availableQty} available for this item.`);
		return;
	  }
	} else {
	  cart.push({ ...item, qty: 1 });
	}

  saveCart(cart);
  openCart();
  renderCart();
}

function addToCart(item) {
  const cart = getCart();

  // Default qty to 1 if not provided (grid compatibility)
  const qtyToAdd = Number(item.qty) || 1;

  const existing = cart.find(i => i.id === item.id);

  if (existing) {

    const newQty = existing.qty + qtyToAdd;

    if (newQty > existing.availableQty) {
      alert(`Only ${existing.availableQty} available for this item.`);
      return;
    }

    existing.qty = newQty;

  } else {

    cart.push({
      ...item,
      qty: qtyToAdd
    });

  }

  saveCart(cart);

  // Safe open (works on product page too)
  const overlay = document.getElementById("cartOverlay");
  if (overlay) {
    openCart();
    renderCart();
  }
}


function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
}



function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  const nextQty = item.qty + delta;

  if (nextQty < 1) {
    removeFromCart(id);
    return;
  }

  if (nextQty > item.availableQty) {
    alert(`Only ${item.availableQty} available for this item.`);
    return;
  }

  item.qty = nextQty;
  saveCart(cart);
  renderCart();
}





function commitQty(id, value) {
  let qty = parseInt(value, 10);

  if (!Number.isFinite(qty) || qty < 1) {
    qty = 1;
  }

  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  if (qty > item.availableQty) {
    alert(`Only ${item.availableQty} available for this item.`);
    qty = item.availableQty;
  }

  // No-op if unchanged
  if (item.qty === qty) return;

  item.qty = qty;
  saveCart(cart);
  renderCart();
}




/* --------------------
   Render
-------------------- */
function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("cartSubtotal");
  const totalEl = document.getElementById("cartTotal");

  container.innerHTML = "";
  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
		<div class="cart-item-info-header">
		  <img src="${item.image}" alt="">
		  <div class="cart-item-info">
			<div class="cart-item-info-name">${item.name}</div>
			<div class="cart-price">$${item.price.toFixed(2)}</div>
			<div style="font-size:16px;">${item.availableQty} available </div>
		  </div>
		  <button class="cart-delete" onclick="removeFromCart('${item.id}')">
			🗑
		  </button>		  
		</div>
		
		<div class="cart-item-footer-container">
			<label style="color:#505050;">Quantity</label>
			<div class="cart-item-info-footer">
			  <div class="cart-qty">
				<button onclick="updateQty('${item.id}', -1)">−</button>
					<input
					  type="number"
					  min="1"
					  step="1"
					  value="${item.qty}"
					  class="cart-qty-input"
					  onblur="commitQty('${item.id}', this.value)"
					  onkeydown="if (event.key === 'Enter') this.blur()"
					/>
				<button onclick="updateQty('${item.id}', 1)">+</button>
			  </div>

			  <div class="cart-item-total">
				$${itemTotal.toFixed(2)}
			  </div>


			</div>
		</div>
    `;

    container.appendChild(row);
  });


  //subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  const grandtotal = subtotal + 10;
  totalEl.textContent = `$${grandtotal.toFixed(2)}`;
  
  
  //disable checkout button if cart is empty
	const checkoutBtn = document.getElementById("checkoutBtn");

	if (checkoutBtn) {
	  const isEmpty = cart.length === 0;

	  checkoutBtn.disabled = isEmpty;
	  checkoutBtn.classList.toggle("disabled", isEmpty);
	}
  
  
  
}

/* --------------------
   Open / Close
-------------------- */
let savedScrollY = 0;

function openCart() {
  savedScrollY = window.scrollY;

  document.body.style.position = "fixed";
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";

  document.getElementById("cartOverlay").classList.add("open");
}

function closeCart() {
  const overlay = document.getElementById("cartOverlay");

  overlay.classList.remove("open");
  overlay.classList.add("closing");

  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";

  window.scrollTo(0, savedScrollY);

  setTimeout(() => {
    overlay.classList.remove("closing");
  }, 400);
}

/* Close when clicking backdrop */
document.getElementById('cartOverlay').addEventListener('click', e => {
  if (e.target.id === 'cartOverlay') closeCart();
});


function goToCheckout() {
  closeCart();
  window.location.href = "/checkout";
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});


function refreshCartAvailability() {
  const cart = getCart();
  let changed = false;

  cart.forEach(item => {
    const availability = AvailabilityService.getProductAvailability(item.id);

    const newAvailableQty = availability?.availableQty ?? 0;

    // Update availableQty if different
    if (item.availableQty !== newAvailableQty) {
      item.availableQty = newAvailableQty;
      changed = true;
    }

    // Clamp qty if it exceeds new availability
    if (item.qty > newAvailableQty) {
      item.qty = newAvailableQty > 0 ? newAvailableQty : 1;
      changed = true;
    }
  });

  if (changed) {
    saveCart(cart);
  }
}

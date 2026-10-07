const CART_KEY = 'rrpr_cart';
const AVAILABILITY_STATE_KEY = 'rrpr_availability_state';

/* --------------------
   Core helpers
-------------------- */
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// True once an availability check has returned data for the current dates
function hasAvailabilityData() {
  try {
    const state = JSON.parse(localStorage.getItem(AVAILABILITY_STATE_KEY));
    return !!(state && state.availability);
  } catch {
    return false;
  }
}

// An item is unavailable when the latest check shows 0 left for the selected dates
// (or the item was missing from the check's results)
function isItemUnavailable(item) {
  if (!AvailabilityService.getRentalDates()) return false;
  if (!hasAvailabilityData()) return false;

  const liveItem = AvailabilityService.getProductAvailability(item.id);
  return !liveItem || liveItem.availableQty === 0;
}

/* --------------------
   Cart actions
-------------------- */

function addToCart(item) {
  const overlay = document.getElementById("cartOverlay");
  const cart = getCart();

  // Default qty to 1 if not provided (grid compatibility)
  const qtyToAdd = Number(item.qty) || 1;

  const existing = cart.find(i => i.id === item.id);

  if (existing) {

    const newQty = existing.qty + qtyToAdd;

    if (newQty > existing.availableQty) {
		item.adjustedForAvailability = true;
		item.adjustedAt = Date.now();
		saveCart(cart);
		if (overlay) {
			openCart();
			renderCart();
		}
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
		item.adjustedForAvailability = true;
		item.adjustedAt = Date.now();
		saveCart(cart);
		alert(`Only ${item.availableQty} available for this item.`);
		renderCart();
		setTimeout(renderCart, 3000);
		return;
  }

  item.adjustedForAvailability = false;
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

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML =
      '<div class="cart-empty-state">' +
        '<i class="fa-solid fa-cart-shopping cart-empty-state__icon"></i>' +
        '<p class="cart-empty-state__msg">Your cart is empty</p>' +
      '</div>';
  }

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    const unavailable = isItemUnavailable(item);
    const dimStyle = unavailable ? ' style="opacity:0.5;"' : '';
    const disabledAttr = unavailable ? ' disabled' : '';
    const availabilityStyle = unavailable
      ? 'font-size:16px; color:#c0392b; font-weight:600;'
      : 'font-size:16px;';

    const row = document.createElement("div");
    row.className = "cart-item" + (unavailable ? " cart-item--unavailable" : "");

    row.innerHTML = `
		<div class="cart-item-info-header">
		  <img src="${item.image}" alt=""${dimStyle}>
		  <div class="cart-item-info">
			<div class="cart-item-info-name"${dimStyle}>${item.name}</div>
			<div class="cart-price"${dimStyle}>$${item.price.toFixed(2)}</div>
			<div style="${availabilityStyle}">${getAvailabilityText(item)} </div>
		  </div>
		  <button class="cart-delete" onclick="removeFromCart('${item.id}')">
			🗑
		  </button>		  
		</div>
		
		<div class="cart-item-footer-container"${dimStyle}>
			<label style="color:#505050;">Quantity</label>
			<div class="cart-item-info-footer">
			  <div class="cart-qty">
				<button onclick="updateQty('${item.id}', -1)"${disabledAttr}>−</button>
					<input
					  type="number"
					  min="1"
					  step="1"
					  value="${item.qty}"
					  class="cart-qty-input"
					  onblur="commitQty('${item.id}', this.value)"
					  onkeydown="if (event.key === 'Enter') this.blur()"${disabledAttr}
					/>
				<button onclick="updateQty('${item.id}', 1)"${disabledAttr}>+</button>
			  </div>

			  <div class="cart-item-total">
				${unavailable ? '—' : '$' + itemTotal.toFixed(2)}
			  </div>


			</div>
		</div>
    `;

    container.appendChild(row);
  });

  // If any item is still in the "Adjusted" flash phase, schedule a re-render
  // timed to when the first label needs to change (3s from adjustedAt)
  var earliestRefreshMs = null;
  cart.forEach(function(item) {
    if (!item.adjustedForAvailability) return;
    var secs = (Date.now() - (item.adjustedAt || 0)) / 1000;
    if (secs < 3) {
      var ms = (3 - secs) * 1000 + 100;
      if (earliestRefreshMs === null || ms < earliestRefreshMs) earliestRefreshMs = ms;
    }
  });
  if (earliestRefreshMs !== null) setTimeout(renderCart, earliestRefreshMs);

  // Totals only count items that can actually be booked
  const availableItems = cart.filter(item => !isItemUnavailable(item));
  renderCartTotals(availableItems);


  //disable checkout button if cart is empty or has unavailable items
	const checkoutBtn = document.getElementById("checkoutBtn");

	if (checkoutBtn) {

	  const hasUnavailable = availableItems.length < cart.length;
	  const canCheckout = cart.length > 0 && !hasUnavailable;

	  if (canCheckout) {
		checkoutBtn.disabled = false;
		checkoutBtn.classList.remove("disabled");
	  } else {
		checkoutBtn.disabled = true;
		checkoutBtn.classList.add("disabled");
	  }

	  renderUnavailableNote(checkoutBtn, hasUnavailable);

	}



}

function renderUnavailableNote(checkoutBtn, show) {
  let note = document.getElementById("cartUnavailableNote");

  if (!note) {
    note = document.createElement("p");
    note.id = "cartUnavailableNote";
    note.style.cssText = "color:#c0392b; font-size:14px; margin:8px 0 0; text-align:center;";
    note.textContent = "Remove unavailable items or choose a different date to continue.";
    const anchor = checkoutBtn.parentElement || checkoutBtn;
    anchor.insertAdjacentElement("afterend", note);
  }

  note.style.display = show ? "block" : "none";
}

function renderCartTotals(cart) {
  const { subtotal, tax, total } = calculateOrderTotals(cart);
  const isEmpty = cart.length === 0;

  const values = {
    cartSubtotal: subtotal,
    cartDelivery: DELIVERY_FEE,
    cartTax: isEmpty ? 0 : tax,
    cartTotal: isEmpty ? 0 : total
  };

  Object.keys(values).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = formatMoney(values[id]);
  });
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
  if (getCart().some(isItemUnavailable)) {
    renderCart();
    return;
  }
  closeCart();
  const rentalDates   = AvailabilityService.getRentalDates();
  const storedDropoff = localStorage.getItem('rrpr_dropoff');
  const storedPickup  = localStorage.getItem('rrpr_pickup');
  const datesSet = rentalDates && storedDropoff && storedPickup;
  window.location.href = datesSet ? "/checkout" : "/checkout-set-dates";
}

/* --------------------
   Returning visitor check
-------------------- */

function todayLocalISO() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

// If the saved event date is before today, clear the whole booking: cart, date,
// dropoff/pickup times, notes and availability. A past ?date= in the URL is also
// removed. Returns true when the booking was cleared.
function clearBookingIfEventDatePast() {
  let storedDate = null;
  try {
    storedDate = JSON.parse(localStorage.getItem('rrpr_event_date') || 'null');
  } catch {}

  const params = new URLSearchParams(window.location.search);
  const urlDate = params.get('date');
  const today = todayLocalISO();

  const storedIsPast = !!storedDate && storedDate < today;
  const urlIsPast = !!urlDate && urlDate < today;

  if (!storedIsPast && !urlIsPast) return false;

  if (storedIsPast) {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem('rrpr_event_date');
    localStorage.removeItem('rrpr_dropoff');
    localStorage.removeItem('rrpr_pickup');
    localStorage.removeItem('rrpr_notes');
    AvailabilityService.clearAvailability();
  }

  // Drop the old date from the URL so it doesn't get picked back up
  if (urlIsPast || (storedIsPast && urlDate === storedDate)) {
    params.delete('date');
    const query = params.toString();
    history.replaceState(history.state, '', location.pathname + (query ? '?' + query : '') + location.hash);
  }

  return storedIsPast;
}

// Runs right away so later scripts on the page never see a past date
clearBookingIfEventDatePast();

let cartCheckInFlight = false;

async function checkCartOnReturn() {
  if (cartCheckInFlight) return;

  if (clearBookingIfEventDatePast()) {
    renderCart();
    return;
  }

  if (!AvailabilityService.getRentalDates() || getCart().length === 0) return;

  cartCheckInFlight = true;
  try {
    // Fetches fresh data only if the saved check is older than the cache TTL
    await AvailabilityService.ensureAvailability();
    const changes = refreshCartAvailability();
    renderCart();
    showCartChangesBanner(changes);
  } catch (err) {
    console.warn('Cart availability re-check failed; leaving cart as is.', err);
  } finally {
    cartCheckInFlight = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  checkCartOnReturn();
});

// Page restored from the back/forward cache
window.addEventListener('pageshow', e => {
  if (e.persisted) checkCartOnReturn();
});

// Tab left open and viewed again
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkCartOnReturn();
});


// Brings each cart item in line with the latest availability check.
// Unavailable items stay in the cart (renderCart labels them and blocks checkout);
// quantities above what's available are lowered.
// Returns only what changed in this check, for the "items changed" banner.
function refreshCartAvailability() {
  const changes = { unavailable: [], reduced: [] };

  // Without availability data every item would look unavailable
  if (!hasAvailabilityData()) return changes;

  const cart = getCart();
  let changed = false;

  cart.forEach(item => {
    const availability = AvailabilityService.getProductAvailability(item.id);

    const newAvailableQty = availability?.availableQty ?? 0;
    const wasUnavailable = item.availableQty === 0;

    // Update availableQty if different
    if (item.availableQty !== newAvailableQty) {
      item.availableQty = newAvailableQty;
      changed = true;
    }

    if (newAvailableQty === 0) {
      if (!wasUnavailable) changes.unavailable.push(item.name);
      return;
    }

    // Clamp qty if it exceeds new availability
	if (item.qty > newAvailableQty) {

	  item.adjustedForAvailability = true;
	  item.adjustedAt = Date.now();
	  item.qty = newAvailableQty;

	  changes.reduced.push({ name: item.name, qty: newAvailableQty });
	  changed = true;
	}
  });

  if (changed) {
    saveCart(cart);
  }

  return changes;
}


/* --------------------
   "Items changed" banner
-------------------- */
function showCartChangesBanner(changes) {
  if (!changes || (changes.unavailable.length === 0 && changes.reduced.length === 0)) return;

  const existing = document.getElementById('cartChangesBanner');
  if (existing) existing.remove();

  const banner = document.createElement('div');
  banner.id = 'cartChangesBanner';
  banner.setAttribute('role', 'status');
  banner.style.cssText =
    'position:fixed; top:16px; left:50%; transform:translateX(-50%); z-index:10000;' +
    'width:calc(100% - 32px); max-width:560px; box-sizing:border-box;' +
    'background:#fff8e5; color:#333; border:1px solid #f0c36d; border-radius:8px;' +
    'box-shadow:0 4px 16px rgba(0,0,0,0.15); padding:14px 40px 14px 16px; font-size:15px; line-height:1.4;';

  const message = document.createElement('div');
  message.textContent = 'Some items in your cart are no longer available for the selected dates:';
  banner.appendChild(message);

  const lines = [];
  changes.unavailable.forEach(name => lines.push([name, ' - no longer available']));
  changes.reduced.forEach(r => lines.push([r.name, ` - only ${r.qty} available`]));

  const list = document.createElement('div');
  list.style.cssText = 'margin-top:6px;';
  lines.forEach(([name, text]) => {
    const line = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = name;
    line.appendChild(strong);
    line.appendChild(document.createTextNode(text));
    list.appendChild(line);
  });
  banner.appendChild(list);

  if (document.getElementById('cartOverlay')) {
    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.textContent = 'View cart';
    viewBtn.style.cssText =
      'margin-top:10px; padding:6px 14px; border:none; border-radius:6px;' +
      'background:#333; color:#fff; font-size:14px; cursor:pointer;';
    viewBtn.addEventListener('click', () => {
      banner.remove();
      openCart();
      renderCart();
    });
    banner.appendChild(viewBtn);
  }

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Dismiss');
  closeBtn.textContent = '×';
  closeBtn.style.cssText =
    'position:absolute; top:8px; right:10px; border:none; background:none;' +
    'font-size:22px; line-height:1; color:#666; cursor:pointer;';
  closeBtn.addEventListener('click', () => banner.remove());
  banner.appendChild(closeBtn);

  document.body.appendChild(banner);
}



function getAvailabilityText(item) {

  const dates = AvailabilityService.getRentalDates();

  // No event date selected
  if (!dates) {
    return "Select date for availability";
  }

  if (isItemUnavailable(item)) {
    return "Unavailable for selected date";
  }

  // Get LIVE availability from cache
  const liveItem = AvailabilityService.getProductAvailability(item.id);

  if (!liveItem) {
    return "Checking availability...";
  }

  const availableQty = liveItem.availableQty;
  const requestedQty = item.qty;

  if (availableQty === 0) {
    return "Unavailable for selected date";
  }

  // Show adjustment message for 3 seconds
  if (item.adjustedForAvailability) {

    const secondsSinceAdjustment =
      (Date.now() - (item.adjustedAt || 0)) / 1000;

    if (secondsSinceAdjustment < 3) {
      return `Adjusted to available quantity (${availableQty})`;
    }

    if (secondsSinceAdjustment < 60) {
      return `Only ${availableQty} available for selected date`;
    }

    return "Available";
  }
  
  if (requestedQty < availableQty) {
    return "Available";
  }

  return "Available";
}


function getCart() {
  return JSON.parse(localStorage.getItem(rrpr_cart)) || [];
}

function getContactInfo() {
  return JSON.parse(localStorage.getItem('rrpr_contact')) || null;
}

function getAddressInfo() {
  return JSON.parse(localStorage.getItem('rrpr_address')) || null;
}

function renderCheckoutCart() {
  const cart = getCart();
  const container = document.getElementById('checkoutCartItems');

  let subtotal = 0;
  container.innerHTML = '';

  cart.forEach(item => {
    const lineTotal = item.price * item.qty;
    subtotal += lineTotal;

    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <span>${item.name} × ${item.qty}</span>
      <strong>$${lineTotal.toFixed(2)}</strong>
    `;
    container.appendChild(row);
  });

  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('total').textContent = `$${(subtotal + 10).toFixed(2)}`;
}


function renderContactInfo() {
  const contact = getContactInfo();
  const container = document.getElementById('contactInfo');

  if (!contact) {
    container.innerHTML = '<em>No contact info found.</em>';
    return;
  }

  container.innerHTML = `
    <div class="cart-row">${contact.name}</div>
    <div class="cart-row">${contact.phone}</div>
    <div class="cart-row">${contact.email}</div>
  `;
}


function renderAddressInfo() {
  const address = getAddressInfo();
  const container = document.getElementById('addressInfo');

  if (!address) {
    container.innerHTML = '<em>No address info found.</em>';
    return;
  }
	const city_state_zip = `${address.city}, ${address.state} ${address.zip}`;
	const street_unit = `${address.street} ${address.unit}`;
	container.innerHTML = `
		<div class="cart-row">${street_unit}</div>
		<div class="cart-row">${city_state_zip}</div>
	`;
}



function continueToDelivery() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!name || !phone || !email) {
    alert('Please fill out all contact fields.');
    return;
  }

  localStorage.setItem('rrpr_contact', JSON.stringify({
    name, phone, email
  }));

  window.location.href = '/checkout-delivery';
}

function goToBookPage() {

	const name = document.getElementById('name').value.trim();
	const phone = document.getElementById('phone').value.trim();
	const email = document.getElementById('email').value.trim();

	if (!name || !phone || !email) {
		window.location.href = '/book';
		return;
	}

	localStorage.setItem('rrpr_contact', JSON.stringify({
		name, phone, email
	}));

	window.location.href = '/book';
	//need to come back and add the date to the url and also come up with some "?cart=open" feature
}

function autopopulateContactInfo() {
  const saved = JSON.parse(localStorage.getItem('rrpr_contact'));

  if (!saved) return;

  if (saved.name) {
    document.getElementById('name').value = saved.name;
  }

  if (saved.phone) {
    document.getElementById('phone').value = saved.phone;
  }

  if (saved.email) {
    document.getElementById('email').value = saved.email;
  }
}


function continueToPlaceOrder() {
  const street = document.getElementById('street').value.trim();
  const unit = document.getElementById('unit').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const zip = document.getElementById('zip').value.trim();

  if (!street || !city || !state || !zip) {
    alert('Please fill out all address fields.');
    return;
  }

  localStorage.setItem('rrpr_address', JSON.stringify({
    street, unit, city, state, zip
  }));

  window.location.href = '/checkout-place-order';
}

function goBackToCheckoutPage(){
  const street = document.getElementById('street').value.trim();
  const unit = document.getElementById('unit').value.trim();  
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const zip = document.getElementById('zip').value.trim();

  if (!street || !city || !state || !zip) {
	window.location.href = '/checkout';
	return;
  }

  localStorage.setItem('rrpr_address', JSON.stringify({
    street, unit, city, state, zip
  }));

  window.location.href = '/checkout';
}
function autopopulateAddressInfo() {
  const saved = JSON.parse(localStorage.getItem('rrpr_address'));

  if (!saved) return;

  if (saved.street) {
    document.getElementById('street').value = saved.street;
  }

  if (saved.unit) {
    document.getElementById('unit').value = saved.unit;
  }

  if (saved.city) {
    document.getElementById('city').value = saved.city;
  }

  if (saved.state) {
    document.getElementById('state').value = saved.state;
  }

  if (saved.zip) {
    document.getElementById('zip').value = saved.zip;
  }
}


function autopopulateNotes() {
  const saved = JSON.parse(localStorage.getItem('rrpr_notes'));

  if (!saved) return;

  if (saved.notes) {
    document.getElementById('notes').value = saved.notes;
  }
}


function calculateDropoff() {
	const rawdate = JSON.parse(localStorage.getItem('rrpr_event_date'));
	if (!rawdate) return null;

	const eventDate = new Date(rawdate);
	eventDate.setHours(0, 0, 0, 0);

  const day = eventDate.getDay(); // 0=Sun, 5=Fri, 6=Sat

  let dropoffDate = new Date(eventDate);
  let dropoffWindow;

  // ----- DROPOFF -----
  if (day === 6) { // Saturday
    dropoffWindow = '8:00 AM – 11:00 AM';
  } else {
    dropoffDate.setDate(eventDate.getDate() - 1);
    dropoffWindow = '5:00 PM – 8:00 PM';
  }
  
	localStorage.setItem('rrpr_dropoff', JSON.stringify({
		dropoffDate, dropoffWindow
	}));
  return {
      dropoffDate: dropoffDate,
      dropoffWindow: dropoffWindow
  };
}

function calculatePickup() {
  
	const rawdate = JSON.parse(localStorage.getItem('rrpr_event_date'));
	if (!rawdate) return null;

	const eventDate = new Date(rawdate);
	eventDate.setHours(0, 0, 0, 0);

  const day = eventDate.getDay(); // 0=Sun, 5=Fri, 6=Sat

  let pickupDate = new Date(eventDate);
  let pickupWindow;

  // ----- PICKUP -----
  if (day === 5) { // Friday
    pickupDate.setDate(eventDate.getDate() + 1);
    pickupWindow = '8:00 AM – 11:00 AM';
  } else {
    pickupDate.setDate(eventDate.getDate() + 1);
    pickupWindow = '5:00 PM – 8:00 PM';
  }
	  
	localStorage.setItem('rrpr_pickup', JSON.stringify({
		pickupDate, pickupWindow
	}));

  return {
      pickupDate: pickupDate,
      pickupWindow: pickupWindow
  };
}


function render_schedule() {
  const scheduleContainer = document.getElementById('scheduleInfo');
  const eventDateRaw = JSON.parse(localStorage.getItem('rrpr_event_date'));

  if (!eventDateRaw) {
    scheduleContainer.innerHTML = '<em>No schedule available.</em>';
    return;
  }

  const dropoff = calculateDropoff();
  const pickup = calculatePickup();

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

  scheduleContainer.innerHTML = `
    <div class="cart-row" style="padding-left:15px; display:block;">
      <div><strong>Dropoff</strong></div>
      <div>${formatDate(dropoff.dropoffDate)}</div>
      <div>${dropoff.dropoffWindow}</div>
    </div>

    <div class="cart-row" style="padding-left:15px; display:block;">
      <div><strong>Pickup</strong></div>
      <div>${formatDate(pickup.pickupDate)}</div>
      <div>${pickup.pickupWindow}</div>
    </div>
  `;
}




async function placeOrderToN8N() {
  const webhookUrl = "https://joelvoss.app.n8n.cloud/webhook/rrpr-place-order";

  const cart = getCart();
  const contact = getContactInfo();
  const address = getAddressInfo();
  const notes = document.getElementById('notes')?.value || '';

  const dropoff = JSON.parse(localStorage.getItem('rrpr_dropoff'));
  const pickup = JSON.parse(localStorage.getItem('rrpr_pickup'));

  if (!cart.length || !contact || !address || !dropoff || !pickup) {
    alert('Missing order information. Please refresh and try again.');
    return;
  }

  const formatISO = (d) => new Date(d).toISOString().split('T')[0];

  const items = cart.map(item => ({
    item_name: item.name,
    product_id: item.product_id,   // must already exist on cart items
    quantity: item.qty,
    unit_price: item.price
  }));

  const subtotal = items.reduce(
    (sum, i) => sum + (i.quantity * i.unit_price),
    0
  );

  const delivery_fee = 25.00; // keep aligned with Zoho Books
  const tax = +(subtotal * 0.08).toFixed(2); // adjust if needed
  const total = +(subtotal + delivery_fee + tax).toFixed(2);

  const street_unit = `${address.street} ${address.unit}`;

  const payload = {
    order_date: formatISO(new Date()),
    name: contact.name,
    email: contact.email,
    phone: contact.phone,

    street: street_unit,
    unit: address.unit || '',
    city: address.city,
    state: address.state,
    zip: address.zip,

    drop_off_label: `${new Date(dropoff.dropoffDate).toLocaleDateString()} ${dropoff.dropoffWindow}`,
    pickup_label: `${new Date(pickup.pickupDate).toLocaleDateString()} ${pickup.pickupWindow}`,

    dropoff_date: formatISO(dropoff.dropoffDate),
    pickup_date: formatISO(pickup.pickupDate),

    items,
    subtotal,
    delivery_fee,
    tax,
    total,
    notes
  };

  localStorage.setItem('rrpr_notes', JSON.stringify({notes}));
  
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Webhook failed: ${res.status}`);
    }

    const data = await res.json();
    console.log('Order sent to n8n:', data);

    //alert('Order placed successfully!');
    // optional redirect
	window.location.href = '/thank-you';

  } catch (err) {
    console.error(err);
    alert('There was a problem placing your order. Please try again.');
  }
}

function goBackToCheckoutDeliveryPage(){
  const notes = document.getElementById('notes').value.trim();

  if (!notes) {
	window.location.href = '/checkout-delivery';
	return;
  }

  localStorage.setItem('rrpr_notes', JSON.stringify({
    notes
  }));

	window.location.href = '/checkout-delivery';
}

function getOrderTotal() {
  const cart = getCart();

  if (!cart.length) {
    alert('Missing order information. Please refresh and try again.');
    return;
  }

  const items = cart.map(item => ({
    item_name: item.name,
    product_id: item.product_id,   // must already exist on cart items
    quantity: item.qty,
    unit_price: item.price
  }));

  const subtotal = items.reduce(
    (sum, i) => sum + (i.quantity * i.unit_price),
    0
  );

  const delivery_fee = 10.00; // keep aligned with Zoho Books
  const tax = +(subtotal * 0.0).toFixed(2); // adjust if needed
  const total = +(subtotal + delivery_fee + tax).toFixed(2);

  return total;
}

async function payNow() {
  try {
    // You should already be calculating this earlier
    // Stripe expects cents
    const totalInCents = Math.round(getOrderTotal() * 100);

    const payload = {
      amount: totalInCents,
      order_id: `rrpr_${Date.now()}`, // simple unique ID for now
      origin: window.location.origin
    };

    const response = await fetch(
      "/.netlify/functions/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      throw new Error(`Checkout session failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.url) {
      throw new Error("Stripe checkout URL missing");
    }

    // Redirect customer to Stripe Checkout
    window.location.href = data.url;

  } catch (err) {
    console.error("payNow error:", err);
    alert(
      "We couldn’t start payment. Please refresh the page and try again."
    );
  }
}






document.addEventListener('DOMContentLoaded', () => {

  const page = document.body.dataset.page;

  if (page === 'checkout') {
    autopopulateContactInfo();
	renderCheckoutCart();
  }

  if (page === 'checkout-delivery') {
	autopopulateAddressInfo();
	renderCheckoutCart();
	renderContactInfo();
  }
  
  if (page === 'checkout-place-order') {
	autopopulateNotes();
	renderCheckoutCart();
	renderContactInfo();
	renderAddressInfo();
	render_schedule();
  }
  
});
const CART_KEY = 'rrpr_cart';
const CONTACT = 'rrpr_contact';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
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


function getContactInfo() {
  return JSON.parse(localStorage.getItem(CONTACT)) || null;
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
});
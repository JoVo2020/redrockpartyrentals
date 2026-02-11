const CART_KEY = 'rrpr_cart';

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

document.addEventListener('DOMContentLoaded', () => {

  const page = document.body.dataset.page;

  if (page === 'checkout') {
    autopopulateContactInfo();
	renderCheckoutCart();
  }

});
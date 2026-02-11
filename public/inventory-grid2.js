/**
 * inventory-grid.js
 * ----------------------------------------
 * Uses global AvailabilityService
 * No direct API calls
 */

const params = new URLSearchParams(window.location.search);
window.categoryParam = params.get('category');

console.log('Category:', window.categoryParam);

const tpl = document.getElementById("rrItemTemplate");

const money = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return "$" + (Number.isInteger(n) ? n : n.toFixed(2));
};

const safeText = (v) => (v == null ? "" : String(v));

function smoothScrollToSelectHeader() {
  const header = document.getElementById('selectYourRentalsHeader');
  const navLinks = document.getElementById('nav-links');

  if (navLinks && navLinks.classList.contains('open')) return;
  if (!header) return;

  const OFFSET = 40;

  setTimeout(() => {
    const y =
      header.getBoundingClientRect().top +
      window.pageYOffset - OFFSET;

    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });
  }, 200);
}

/* -------------------------
   Load Inventory
------------------------- */

async function loadInventory() {
  const loadingEl = document.getElementById('inventoryLoading');

  try {

    // FIRST: attempt to get availability (may return cached instantly)
    const availability = await AvailabilityService.ensureAvailability();

    if (!availability) {
      loadingEl.textContent = 'To get started, please enter your event date';
      return;
    }

    // Only show loading text if data was NOT cached
    const state = JSON.parse(localStorage.getItem('rrpr_availability_state'));
    const wasFreshlyFetched = state?.checkedAt &&
      (Date.now() - new Date(state.checkedAt).getTime()) < 1000;

    if (wasFreshlyFetched) {
      loadingEl.style.display = 'block';
      loadingEl.textContent = 'Checking availability…';
    } else {
      loadingEl.style.display = 'none';
    }

    renderInventory(Object.values(availability));
    smoothScrollToSelectHeader();

  } catch (err) {
    console.error(err);
    loadingEl.style.display = 'block';
    loadingEl.textContent = 'Unable to load availability.';
  }
}



/* -------------------------
   Render Inventory
------------------------- */

function renderInventory(items) {

  // Clear all grids first
  document.querySelectorAll('.accordion-item .rr-inventory-grid')
    .forEach(grid => grid.innerHTML = '');

  items.forEach(item => {

    // If category filter exists, enforce it
    if (window.categoryParam &&
        window.categoryParam !== 'Everything' &&
        item.category !== window.categoryParam) {
      return;
    }

    const accordionItem = document.querySelector(
      `.accordion-item[data-category="${item.category}"]`
    );

    if (!accordionItem) return;

    const grid = accordionItem.querySelector('.rr-inventory-grid');
    const node = tpl.content.firstElementChild.cloneNode(true);

    const name = safeText(item.name);
    const price = money(item.price);
    const imgUrl = safeText(item.image);

    node.querySelector('.rr-card__img').src = imgUrl;
    node.querySelector('.rr-card__img').alt = name;
    node.querySelector('.rr-card__name').textContent =
      `${name} - ${price}`;

    const addToCartEl = node.querySelector('.rr-card__addToCart');

    if (!item.available) {
      addToCartEl.innerHTML = `<button disabled>Unavailable</button>`;
    } else {
      addToCartEl.innerHTML =
        `<button class="rr-btn-addToCart">Add To Cart</button>`;

      addToCartEl.querySelector('button').onclick = () =>
        addToCart({
          id: item.product_id,
          product_id: item.product_id,
          name: name,
          price: Number(item.price),
          image: imgUrl,
          availableQty: item.available_qty
        });
    }

    grid.appendChild(node);
  });
}

/* -------------------------
   Init
------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  loadInventory();
});

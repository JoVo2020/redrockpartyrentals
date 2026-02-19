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
  const inventorySection = document.getElementById('inventorySection');
  const otherWays = document.getElementById('otherWaysSection');
  const headerEl = document.getElementById('selectYourRentalsHeader');

  const dates = AvailabilityService.getRentalDates();

  // -------------------------
  // No date set
  // -------------------------
  if (!dates) {
    loadingEl.style.display = 'block';
    loadingEl.textContent =
      'To get started, please enter your event date.';
    inventorySection.style.display = 'none';
    otherWays.style.display = 'block';
    return;
  }

  const { start, end } = dates;
  const isCached = AvailabilityService.isCacheValid(start, end);

  // -------------------------
  // 1️⃣ Show loading
  // -------------------------
  loadingEl.style.display = 'block';
  loadingEl.textContent = 'Checking availability…';
  inventorySection.style.display = 'none';
  otherWays.style.display = 'block';

  try {
    let availability;

    // -------------------------
    // 2️⃣ Cached vs Fetch
    // -------------------------
    if (isCached) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const state = JSON.parse(
        localStorage.getItem('rrpr_availability_state')
      );

      availability = state.availability;
    } else {
      availability = await AvailabilityService.ensureAvailability();
    }

    // -------------------------
    // 3️⃣ Render inventory
    // -------------------------
    renderInventory(Object.values(availability));

    loadingEl.style.display = 'none';
    inventorySection.style.display = 'block';

    // -------------------------
    // 4️⃣ Scroll AFTER render
    // -------------------------
	smoothScrollToSelectHeader();
	
  } catch (err) {
    console.error(err);
    loadingEl.textContent =
      'Availability is taking longer than expected. Please refresh.';
  }
}





/* -------------------------
   Render Inventory
------------------------- */

function renderInventory(items) {

	console.log("Items received:", items);

  // Clear all grids first
  document.querySelectorAll('.accordion-item .rr-inventory-grid')
    .forEach(grid => grid.innerHTML = '');

  items.forEach(item => {

	console.log("Looking for category:", item.category);

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

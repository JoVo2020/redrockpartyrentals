const params = new URLSearchParams(window.location.search);
window.categoryParam = params.get('category');
window.dateParamRaw = params.get('date');
window.dateParam = formatDateToISO(window.dateParamRaw);

console.log('Category:', window.categoryParam);
console.log('Date:', window.dateParam);

const ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwiQbTdtwT0VtIIxGVDnu1IP9q6JXnL6zIhWe7wsnM2O9laf4OProuyfzi9PafriDEoUw/exec?action=availability&date=" +
  window.dateParam;

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

async function loadInventory() {
  const loadingEl = document.getElementById('inventoryLoading');
  loadingEl.style.display = 'block';
  loadingEl.textContent = 'Checking availability…';

  try {
    const res = await fetch(ENDPOINT, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();
    if (!data || !Array.isArray(data.items)) {
      throw new Error("Unexpected response shape");
    }

    loadingEl.style.display = 'none';

    const selectHeader = document.getElementById('selectYourRentalsHeader');
    selectHeader.style.display = 'block';

    const accordionEl = document.getElementById('inventoryAccordion');
    accordionEl.removeAttribute('data-loading');

    renderInventory(data.items);
    smoothScrollToSelectHeader();

  } catch (err) {
    console.error(err);
    loadingEl.textContent = 'Unable to load availability.';
  }
}

function renderInventory(items) {
  document.querySelectorAll('.accordion-item .rr-inventory-grid')
    .forEach(grid => grid.innerHTML = '');

  items.forEach(item => {
    const category = item.category;

    const accordionItem = document.querySelector(
      `.accordion-item[data-category="${category}"]`
    );

    if (!accordionItem) return;

    const grid = accordionItem.querySelector('.rr-inventory-grid');
    const node = tpl.content.firstElementChild.cloneNode(true);

    const name = safeText(item.item_name);
    const price = money(item.rental_price);
    const qty = Number(item.available_qty);
    const imgUrl = safeText(item.image);

    node.querySelector('.rr-card__img').src = imgUrl;
    node.querySelector('.rr-card__img').alt = name;
    node.querySelector('.rr-card__name').textContent =
      `${name} - ${price}`;

    const addToCartEl = node.querySelector('.rr-card__addToCart');

    if (qty <= 0) {
      addToCartEl.innerHTML = `<button disabled>Unavailable</button>`;
    } else {
      addToCartEl.innerHTML =
        `<button class="rr-btn-addToCart">Add To Cart</button>`;

      addToCartEl.querySelector('button').onclick = () =>
        addToCart({
          id: item.product_id || item.item_id,
          product_id: item.product_id || item.item_id,
          name,
          price: Number(item.rental_price),
          image: imgUrl,
          availableQty: qty
        });
    }

    grid.appendChild(node);
  });
}

function formatDateToISO(dateStr) {
  if (!dateStr) return null;
  const [month, day, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/* ---- Run after DOM loads ---- */
document.addEventListener('DOMContentLoaded', () => {
  if (window.dateParam) {
    loadInventory();
  }
});

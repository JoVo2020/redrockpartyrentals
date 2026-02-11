/**
 * availabilityService.js
 * ----------------------------------------
 * Centralized rental date + availability cache
 * Uses product_id as the key
 * GLOBAL VERSION (no ES modules)
 */

window.AvailabilityService = (function () {

  const STORAGE_KEY = 'rrpr_availability_state';
  const CACHE_TTL_MINUTES = 20;

  const AVAILABILITY_ENDPOINT =
    'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLieyUGwKYK8Rh7jK_sNdwV1vyUauxGZKnzmBAxYi1Y_LnF7wSs';

  let inflightPromise = null;

  /* -------------------------
     Utilities
  ------------------------- */

  function nowISO() {
    return new Date().toISOString();
  }

  function minutesOld(iso) {
    return (Date.now() - new Date(iso).getTime()) / 60000;
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  }

  function writeState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  /* -------------------------
     Rental Date
  ------------------------- */

  function getRentalDates() {
    const params = new URLSearchParams(window.location.search);
    const start = params.get('start');
    const end = params.get('end');

    if (start && end) return { start, end };

    const state = readState();

    return state?.start_date && state?.end_date
      ? { start: state.start_date, end: state.end_date }
      : null;
  }

  function setRentalDates(start, end) {
    const state = readState() || {};

    state.start_date = start;
    state.end_date = end;
    state.checkedAt = null;
    state.availability = null;

    writeState(state);

    const params = new URLSearchParams(window.location.search);
    params.set('start', start);
    params.set('end', end);

    history.replaceState({}, '', `${location.pathname}?${params}`);
  }

  /* -------------------------
     Cache Validation
  ------------------------- */

  function isCacheValid(start, end) {
    const state = readState();

    if (!state) return false;
    if (state.start_date !== start || state.end_date !== end) return false;
    if (!state.checkedAt || !state.availability) return false;

    return minutesOld(state.checkedAt) <= CACHE_TTL_MINUTES;
  }

  /* -------------------------
     Availability Fetch
  ------------------------- */

  async function fetchAvailability(start, end) {

    if (inflightPromise) return inflightPromise;

    const url =
      `${AVAILABILITY_ENDPOINT}&start_date=${start}&end_date=${end}`;

    inflightPromise = fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error('Availability request failed');
        }
        return res.json();
      })
      .finally(() => {
        inflightPromise = null;
      });

    return inflightPromise;
  }

  /* -------------------------
     Public API
  ------------------------- */

  async function ensureAvailability() {
    const dates = getRentalDates();
    if (!dates) return null;

    const { start, end } = dates;

    if (isCacheValid(start, end)) {
      return readState().availability;
    }

    const response = await fetchAvailability(start, end);

    if (!response.success) {
      throw new Error('Availability API returned unsuccessful response');
    }

    const availabilityByProductId = {};

    response.items.forEach(item => {
      availabilityByProductId[item.product_id] = {
        item_id: item.item_id,
        name: item.item_name,
        category: item.category,
        price: item.rental_price,
        image: item.image,
        available_qty: item.available_qty,
        available: item.available_qty > 0
      };
    });

    writeState({
      start_date: response.start_date,
      end_date: response.end_date,
      availability: availabilityByProductId,
      checkedAt: nowISO()
    });

    return availabilityByProductId;
  }

  function getProductAvailability(productId) {
    const state = readState();
    return state?.availability?.[productId] || null;
  }

  async function refreshAvailability() {
    const dates = getRentalDates();
    if (!dates) return null;

    const response = await fetchAvailability(dates.start, dates.end);

    const availabilityByProductId = {};

    response.items.forEach(item => {
      availabilityByProductId[item.product_id] = {
        item_id: item.item_id,
        name: item.item_name,
        category: item.category,
        price: item.rental_price,
        image: item.image,
        available_qty: item.available_qty,
        available: item.available_qty > 0
      };
    });

    writeState({
      start_date: response.start_date,
      end_date: response.end_date,
      availability: availabilityByProductId,
      checkedAt: nowISO()
    });

    return availabilityByProductId;
  }

  function clearAvailability() {
    localStorage.removeItem(STORAGE_KEY);
  }

  /* -------------------------
     Expose Public Methods
  ------------------------- */

  return {
    getRentalDates,
    setRentalDates,
    ensureAvailability,
    getProductAvailability,
    refreshAvailability,
    clearAvailability
  };

})();

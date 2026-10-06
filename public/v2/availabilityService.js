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
	'https://script.google.com/macros/s/AKfycbwiQbTdtwT0VtIIxGVDnu1IP9q6JXnL6zIhWe7wsnM2O9laf4OProuyfzi9PafriDEoUw/exec?action=availability';


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

	function OLDgetRentalDates() {
	  const params = new URLSearchParams(window.location.search);

	  const singleDate = params.get('date');
	  if (!singleDate) return null;

	  // Convert to real Date object
	  const startDateObj = new Date(singleDate);
	  const endDateObj = new Date(startDateObj);

	  // Add 1 day automatically
	  endDateObj.setDate(endDateObj.getDate() + 1);

	  const endISO = endDateObj.toISOString().split('T')[0];

	  return {
		start: singleDate,
		end: endISO
	  };
	}
	

	function getRentalDates() {
	  // Prefer stored state dates (real dropoff/pickup range) over URL
	  const state = readState();
	  if (state && state.start_date && state.end_date) {
		return { start: state.start_date, end: state.end_date };
	  }
	  // Fall back to URL event date + 1 day
	  const urlDate = new URLSearchParams(window.location.search).get('date');
	  if (urlDate) {
		return { start: urlDate, end: calc_end_date(urlDate) };
	  }
	  return null;
	}

	function getEventDate() {
	  const urlDate = new URLSearchParams(window.location.search).get('date');
	  if (urlDate) return urlDate;
	  const state = readState();
	  return (state && state.event_date) || null;
	}

	function setRentalDateRange(start, end, eventDate) {
	  const state = readState() || {};
	  state.start_date   = start;
	  state.end_date     = end;
	  state.event_date   = eventDate;
	  state.checkedAt    = null;
	  state.availability = null;
	  writeState(state);
	  localStorage.setItem('rrpr_event_date', JSON.stringify(eventDate));
	  const params = new URLSearchParams(window.location.search);
	  params.set('date', eventDate);
	  params.delete('start');
	  params.delete('end');
	  history.replaceState({}, '', `${location.pathname}?${params}`);
	}



	function OLDsetRentalDates(date) {
	  const state = readState() || {};

	  state.event_date = date;
	  state.checkedAt = null;
	  state.availability = null;

	  writeState(state);

	  const params = new URLSearchParams(window.location.search);
	  params.set('date', date);

	  // remove old params if present
	  params.delete('start');
	  params.delete('end');

	  history.replaceState({}, '', `${location.pathname}?${params}`);
	}

	function setRentalDates(date) {
	  const state = readState() || {};

	  state.start_date = date;
	  state.end_date = calc_end_date(date);
	  state.event_date = date;
	  state.checkedAt = null;
	  state.availability = null;

	  writeState(state);

	  // ⭐ store event date for checkout pages
	  localStorage.setItem('rrpr_event_date', JSON.stringify(date));

	  const params = new URLSearchParams(window.location.search);
	  params.set('date', date);

	  params.delete('start');
	  params.delete('end');

	  history.replaceState({}, '', `${location.pathname}?${params}`);
	}


	function calc_end_date(start_date) {
	  const startDateObj = new Date(start_date);
	  const endDateObj = new Date(startDateObj);
	  endDateObj.setDate(endDateObj.getDate() + 1);

	  return endDateObj.toISOString().split('T')[0];
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
        product_id: item.product_id,
        id: item.product_id,
		item_id: item.item_id,
        name: item.item_name,
        category: item.category,
        price: item.rental_price,
        image: item.image,
        available_qty: item.available_qty,
        availableQty: item.available_qty,		
        available: item.available_qty > 0
      };
    });

    const prevState = readState() || {};
    writeState({
      start_date: response.start_date,
      end_date: response.end_date,
      event_date: prevState.event_date || null,
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
        product_id: item.product_id,
        id: item.product_id,
        item_id: item.item_id,
        name: item.item_name,
        category: item.category,
        price: item.rental_price,
        image: item.image,
        available_qty: item.available_qty,
        availableQty: item.available_qty,		
        available: item.available_qty > 0
      };
    });

    const prevState2 = readState() || {};
    writeState({
      start_date: response.start_date,
      end_date: response.end_date,
      event_date: prevState2.event_date || null,
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
    getEventDate,
    setRentalDates,
    setRentalDateRange,
    ensureAvailability,
	isCacheValid,
    getProductAvailability,
    refreshAvailability,
    clearAvailability
  };

})();

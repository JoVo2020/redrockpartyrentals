(function () {
  if (!document.getElementById('cart-booking-info')) return;

  // ── Cart-local helpers ──────────────────────────────────────────────────────

  function disableCheckout() {
    var btn = document.getElementById('checkoutBtn');
    if (!btn) return;
    btn.disabled = true;
    btn.classList.add('disabled');
  }

  function calcDate(eventIso, daysCalc) {
    var parts = eventIso.split('-').map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + daysCalc);
    return d;
  }

  function buildCartOptionCard(radioName, actualDate, timeWindow, isDefault) {
    var dayStr  = actualDate.toLocaleDateString('en-US', { weekday: 'long' });
    var dateStr = actualDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    var value   = JSON.stringify({ date: actualDate.toISOString(), window: timeWindow });
    return '<label class="time-option-card">' +
      '<input type="radio" name="' + radioName + '" value=\'' + value + '\'' + (isDefault ? ' checked' : '') + '>' +
      '<div class="time-option-card__day">' + dayStr + '</div>' +
      '<div class="time-option-card__date">' + dateStr + '</div>' +
      '<div class="time-option-card__window">' + timeWindow + '</div>' +
      '</label>';
  }

  function preselectOption(radioName, isoDate, windowStr) {
    var target = new Date(isoDate).toDateString();
    document.querySelectorAll('input[name="' + radioName + '"]').forEach(function (radio) {
      var val = JSON.parse(radio.value);
      if (new Date(val.date).toDateString() === target && val.window === windowStr) {
        radio.checked = true;
      }
    });
  }

  function renderCartTimeOptions(eventIso) {
    var parts = eventIso.split('-').map(Number);
    var eventDate = new Date(parts[0], parts[1] - 1, parts[2]);
    var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var rule = (window.DROPOFF_PICKUP_RULES || []).find(function (r) {
      return r.event_day === dayNames[eventDate.getDay()];
    });
    if (!rule) return;

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    function renderOptions(containerId, options, radioName) {
      var container = document.getElementById(containerId);
      if (!container) return;
      var validOptions = options.filter(function (opt) {
        return calcDate(eventIso, opt.days_calc).getTime() > today.getTime();
      });
      var hasDefault = validOptions.some(function (o) { return o.default; });
      container.innerHTML = validOptions.map(function (opt, i) {
        var actualDate = calcDate(eventIso, opt.days_calc);
        var isDefault  = hasDefault ? opt.default : (i === 0);
        return buildCartOptionCard(radioName, actualDate, opt.time, isDefault);
      }).join('');
      container.style.gridTemplateColumns = '1fr';
    }

    renderOptions('cartDropoffOptions', rule.dropoff, 'cartDropoff');
    renderOptions('cartPickupOptions',  rule.pickup,  'cartPickup');
  }

  function refreshCartBookingInfo() {
    var storedDate = JSON.parse(localStorage.getItem('rrpr_event_date') || 'null');
    var dateEl = document.getElementById('cartDateValue');
    if (dateEl) {
      if (storedDate) {
        var parts = storedDate.split('-').map(Number);
        var d = new Date(parts[0], parts[1] - 1, parts[2]);
        dateEl.textContent = d.toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });
      } else {
        dateEl.textContent = 'Not selected';
      }
    }

    var timesEl = document.getElementById('cartTimesValue');
    if (timesEl) {
      var dropoff = localStorage.getItem('rrpr_dropoff');
      var pickup  = localStorage.getItem('rrpr_pickup');
      if (dropoff && pickup) {
        var dd  = JSON.parse(dropoff);
        var pd  = JSON.parse(pickup);
        var fmt = function (isoStr) {
          return new Date(isoStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        };
        timesEl.innerHTML =
          'Dropoff: ' + fmt(dd.dropoffDate) + ', ' + dd.dropoffWindow + '<br>' +
          'Pickup: '  + fmt(pd.pickupDate)  + ', ' + pd.pickupWindow;
      } else {
        timesEl.textContent = 'Not selected';
      }
    }
  }

  function cartOpenTimesEdit() {
    var storedDate = JSON.parse(localStorage.getItem('rrpr_event_date') || 'null');
    if (!storedDate) return;

    renderCartTimeOptions(storedDate);

    var prevDropoff = localStorage.getItem('rrpr_dropoff');
    var prevPickup  = localStorage.getItem('rrpr_pickup');
    if (prevDropoff) {
      var dd = JSON.parse(prevDropoff);
      preselectOption('cartDropoff', dd.dropoffDate, dd.dropoffWindow);
    }
    if (prevPickup) {
      var pd = JSON.parse(prevPickup);
      preselectOption('cartPickup', pd.pickupDate, pd.pickupWindow);
    }

    var notesEl = document.getElementById('cartDeliveryNotes');
    if (notesEl) notesEl.value = localStorage.getItem('rrpr_notes') || '';

    document.getElementById('cartTimesRow').style.display  = 'none';
    document.getElementById('cartTimesEdit').style.display = 'block';
  }

  function cartCloseTimesEdit() {
    document.getElementById('cartTimesEdit').style.display = 'none';
    document.getElementById('cartTimesRow').style.display  = 'flex';
  }

  // ── Shared actions (work on any page) ───────────────────────────────────────

  window.onDateSelected = function (iso) {
    localStorage.setItem('rrpr_event_date', JSON.stringify(iso));
    localStorage.removeItem('rrpr_dropoff');
    localStorage.removeItem('rrpr_pickup');
    AvailabilityService.setRentalDates(iso);

    // Sync both flatpickr inputs (false = don't re-fire onChange)
    var fp1 = document.getElementById('dateStart');
    var fp2 = document.getElementById('dateStart2');
    if (fp1 && fp1._flatpickr) fp1._flatpickr.setDate(iso, false);
    if (fp2 && fp2._flatpickr) fp2._flatpickr.setDate(iso, false);

    // Collapse date edit form
    document.getElementById('cartDateEdit').style.display = 'none';
    document.getElementById('cartDateRow').style.display  = 'flex';

    refreshCartBookingInfo();
    cartOpenTimesEdit();

    // Stepper hook — only present on book2.html
    if (typeof window.stepperOnDateSelected === 'function') {
      window.stepperOnDateSelected(iso);
    }
  };

  window.onTimesConfirmed = function (dropoffPayload, pickupPayload) {
    localStorage.setItem('rrpr_dropoff', JSON.stringify(dropoffPayload));
    localStorage.setItem('rrpr_pickup',  JSON.stringify(pickupPayload));

    var toLocalISO = function (isoStr) {
      var d = new Date(isoStr);
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
    };
    var eventIso    = JSON.parse(localStorage.getItem('rrpr_event_date') || 'null');
    var dropoffDate = toLocalISO(dropoffPayload.dropoffDate);
    var pickupDate  = toLocalISO(pickupPayload.pickupDate);
    AvailabilityService.setRentalDateRange(dropoffDate, pickupDate, eventIso);

    cartCloseTimesEdit();
    refreshCartBookingInfo();

    // Stepper hook — only present on book2.html
    if (typeof window.stepperOnTimesConfirmed === 'function') {
      window.stepperOnTimesConfirmed();
    }

    // Async availability → re-render cart
    var note = document.getElementById('CheckingAvailabilityNote');
    if (note) note.style.display = 'block';
    AvailabilityService.ensureAvailability()
      .then(function () {
        if (typeof refreshCartAvailability === 'function') refreshCartAvailability();
        if (typeof renderCart              === 'function') renderCart();
      })
      .finally(function () {
        if (note) note.style.display = 'none';
      });
  };

  // ── Register window callbacks for book-steps.js ─────────────────────────────
  window.cartRefreshInfo    = refreshCartBookingInfo;
  window.cartOpenTimesEdit  = cartOpenTimesEdit;
  window.cartCloseTimesEdit = cartCloseTimesEdit;

  // ── DOMContentLoaded ────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {

    refreshCartBookingInfo();

    // Click on label area → trigger Edit button
    var cartDateRowDiv = document.querySelector('#cartDateRow > div');
    if (cartDateRowDiv) {
      cartDateRowDiv.addEventListener('click', function () {
        document.getElementById('cartEditDateBtn').click();
      });
    }
    var cartTimesRowDiv = document.querySelector('#cartTimesRow > div');
    if (cartTimesRowDiv) {
      cartTimesRowDiv.addEventListener('click', function () {
        document.getElementById('cartEditTimesBtn').click();
      });
    }

    // Edit date
    document.getElementById('cartEditDateBtn').addEventListener('click', function () {
      var storedDate = JSON.parse(localStorage.getItem('rrpr_event_date') || 'null');
      var fp2 = document.getElementById('dateStart2');
      document.getElementById('cartDateRow').style.display  = 'none';
      document.getElementById('cartDateEdit').style.display = 'block';
      disableCheckout();
      if (fp2 && fp2._flatpickr) {
        if (storedDate) {
          var p = storedDate.split('-').map(Number);
          fp2._flatpickr.setDate(new Date(p[0], p[1] - 1, p[2]), false);
        }
        fp2._flatpickr.open();
      }
    });

    // Cancel times edit
    document.getElementById('cartCancelTimesBtn').addEventListener('click', function () {
      cartCloseTimesEdit();
      if (typeof renderCart === 'function') renderCart();
    });

    // Edit times
    document.getElementById('cartEditTimesBtn').addEventListener('click', function () {
      var storedDate = JSON.parse(localStorage.getItem('rrpr_event_date') || 'null');
      if (!storedDate) { alert('Please select an event date first.'); return; }
      cartOpenTimesEdit();
      disableCheckout();
    });

    // Confirm times
    document.getElementById('cartConfirmTimesBtn').addEventListener('click', function () {
      var dropoffInput = document.querySelector('#cartDropoffOptions input[name="cartDropoff"]:checked');
      var pickupInput  = document.querySelector('#cartPickupOptions input[name="cartPickup"]:checked');
      if (!dropoffInput) { alert('Please select a dropoff time.'); return; }
      if (!pickupInput)  { alert('Please select a pickup time.');  return; }

      var dd = JSON.parse(dropoffInput.value);
      var pd = JSON.parse(pickupInput.value);

      var notesEl = document.getElementById('cartDeliveryNotes');
      if (notesEl) {
        var note = notesEl.value.trim();
        if (note) localStorage.setItem('rrpr_notes', note);
        else localStorage.removeItem('rrpr_notes');
      }

      window.onTimesConfirmed(
        { dropoffDate: dd.date, dropoffWindow: dd.window },
        { pickupDate:  pd.date, pickupWindow:  pd.window }
      );
    });

    // Restore on load: pre-fill dateStart2, but don't auto-open times editor
    var storedDate = JSON.parse(localStorage.getItem('rrpr_event_date') || 'null');
    if (storedDate) {
      var fp2 = document.getElementById('dateStart2');
      if (fp2 && fp2._flatpickr) {
        fp2._flatpickr.setDate(storedDate, false);
      }
    }

  });

})();

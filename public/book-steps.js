(function () {
  if (!document.getElementById('bk-stepper')) return;

  var currentEventIso = null;

  // ── Step state helpers ──────────────────────────────────────────────────────
  function setStepState(stepId, state) {
    var el = document.getElementById(stepId);
    if (!el) return;
    el.dataset.state = state;
    if (state !== 'done') {
      var badge = el.querySelector('.v2-step__badge');
      if (badge) badge.textContent = badge.dataset.num;
    }
  }

  function markStepDone(stepId, summaryHtml) {
    var el = document.getElementById(stepId);
    if (!el) return;
    el.dataset.state = 'done';
    var badge = el.querySelector('.v2-step__badge');
    if (badge) badge.textContent = '✓';
    var summary = el.querySelector('.v2-step__summary');
    if (summary) summary.innerHTML = summaryHtml;
  }

  // ── Date helpers ────────────────────────────────────────────────────────────
  function calcDate(eventIso, daysCalc) {
    var parts = eventIso.split('-').map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + daysCalc);
    return d;
  }

  function formatEventDate(iso) {
    var parts = iso.split('-').map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // ── Time card builder ───────────────────────────────────────────────────────
  function buildOptionCard(radioName, actualDate, timeWindow, isDefault) {
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

  // ── Pre-select a previously chosen option ──────────────────────────────────
  function preselectOption(radioName, isoDate, windowStr) {
    var target = new Date(isoDate).toDateString();
    document.querySelectorAll('input[name="' + radioName + '"]').forEach(function (radio) {
      var val = JSON.parse(radio.value);
      if (new Date(val.date).toDateString() === target && val.window === windowStr) {
        radio.checked = true;
      }
    });
  }

  // ── Render dropoff/pickup options from DROPOFF_PICKUP_RULES ────────────────
  function renderOptions(containerId, options, eventIso, radioName) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var validOptions = options.filter(function (opt) {
      return calcDate(eventIso, opt.days_calc).getTime() > today.getTime();
    });

    var hasDefault = validOptions.some(function (o) { return o.default; });

    var html = validOptions.map(function (opt, i) {
      var actualDate = calcDate(eventIso, opt.days_calc);
      var isDefault = hasDefault ? opt.default : (i === 0);
      return buildOptionCard(radioName, actualDate, opt.time, isDefault);
    }).join('');

    container.innerHTML = html;
  }

  // ── Step navigation ─────────────────────────────────────────────────────────
  function advanceToStep2(iso) {
    currentEventIso = iso;

    var parts = iso.split('-').map(Number);
    var eventDate = new Date(parts[0], parts[1] - 1, parts[2]);

    markStepDone('v2-step-1', formatEventDate(iso));
    setStepState('v2-step-2', 'active');
    setStepState('v2-step-3', 'locked');

    var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var rule = (window.DROPOFF_PICKUP_RULES || []).find(function (r) {
      return r.event_day === dayNames[eventDate.getDay()];
    });

    if (rule) {
      renderOptions('dropoffOptions', rule.dropoff, iso, 'dropoffOption');
      renderOptions('pickupOptions',  rule.pickup,  iso, 'pickupOption');
    }

    var notesEl = document.getElementById('deliveryNotes');
    if (notesEl) notesEl.value = localStorage.getItem('rrpr_notes') || '';
  }

  function editStep(n) {
    if (n === 1) {
      setStepState('v2-step-1', 'active');
      setStepState('v2-step-2', 'locked');
      setStepState('v2-step-3', 'locked');
      document.getElementById('inventorySection').style.display = 'none';
      document.getElementById('inventoryLoading').style.display = 'none';
      currentEventIso = null;
    } else if (n === 2) {
      setStepState('v2-step-2', 'active');
      setStepState('v2-step-3', 'locked');
      document.getElementById('inventorySection').style.display = 'none';
      document.getElementById('inventoryLoading').style.display = 'none';
      if (currentEventIso) {
        var parts = currentEventIso.split('-').map(Number);
        var eventDate = new Date(parts[0], parts[1] - 1, parts[2]);
        var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        var rule = (window.DROPOFF_PICKUP_RULES || []).find(function (r) {
          return r.event_day === dayNames[eventDate.getDay()];
        });
        if (rule) {
          renderOptions('dropoffOptions', rule.dropoff, currentEventIso, 'dropoffOption');
          renderOptions('pickupOptions',  rule.pickup,  currentEventIso, 'pickupOption');
          var prevDropoff = localStorage.getItem('rrpr_dropoff');
          var prevPickup  = localStorage.getItem('rrpr_pickup');
          if (prevDropoff) {
            var dd = JSON.parse(prevDropoff);
            preselectOption('dropoffOption', dd.dropoffDate, dd.dropoffWindow);
          }
          if (prevPickup) {
            var pd = JSON.parse(prevPickup);
            preselectOption('pickupOption', pd.pickupDate, pd.pickupWindow);
          }
        }
        var notesEl = document.getElementById('deliveryNotes');
        if (notesEl) notesEl.value = localStorage.getItem('rrpr_notes') || '';
      }
    }
  }

  // ── Stepper hooks (called by cart-booking.js shared actions) ────────────────
  window.stepperOnDateSelected = function (iso) {
    advanceToStep2(iso);
  };

  window.stepperOnTimesConfirmed = function () {
    var dd  = JSON.parse(localStorage.getItem('rrpr_dropoff') || 'null');
    var pd  = JSON.parse(localStorage.getItem('rrpr_pickup')  || 'null');
    if (!dd || !pd) return;
    var fmt = function (isoStr) {
      return new Date(isoStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };
    markStepDone('v2-step-2',
      'Dropoff: ' + fmt(dd.dropoffDate) + ', ' + dd.dropoffWindow + '<br>' +
      'Pickup: '  + fmt(pd.pickupDate)  + ', ' + pd.pickupWindow
    );
    setStepState('v2-step-3', 'active');
    if (typeof loadInventory === 'function') loadInventory();
    setTimeout(function () {
      var step3 = document.getElementById('v2-step-3');
      if (step3) step3.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  window.editStep = editStep;

  // Called by book-now-component.js onClose when user clicks outside calendar
  window.cancelDateEdit = function () {
    var el = document.getElementById('v2-step-1');
    if (!el || el.dataset.state !== 'active') return;

    var storedDate   = JSON.parse(localStorage.getItem('rrpr_event_date') || 'null');
    if (!storedDate) return; // no prior date — leave edit mode open

    currentEventIso = storedDate;
    markStepDone('v2-step-1', formatEventDate(storedDate));

    var storedDropoff = localStorage.getItem('rrpr_dropoff');
    var storedPickup  = localStorage.getItem('rrpr_pickup');

    if (storedDropoff && storedPickup) {
      var dd  = JSON.parse(storedDropoff);
      var pd  = JSON.parse(storedPickup);
      var fmt = function (isoStr) {
        return new Date(isoStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      };
      markStepDone('v2-step-2',
        'Dropoff: ' + fmt(dd.dropoffDate) + ', ' + dd.dropoffWindow + '<br>' +
        'Pickup: '  + fmt(pd.pickupDate)  + ', ' + pd.pickupWindow
      );
      setStepState('v2-step-3', 'active');
      var invSection = document.getElementById('inventorySection');
      if (invSection) invSection.style.display = 'block';
    } else {
      setStepState('v2-step-2', 'active');
      setStepState('v2-step-3', 'locked');
    }
  };

  // ── Wire up buttons on DOMContentLoaded ────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('seeRentalsBtn').addEventListener('click', function () {
      var dropoffInput = document.querySelector('input[name="dropoffOption"]:checked');
      var pickupInput  = document.querySelector('input[name="pickupOption"]:checked');
      if (!dropoffInput) { alert('Please select a dropoff time.'); return; }
      if (!pickupInput)  { alert('Please select a pickup time.');  return; }

      var dd = JSON.parse(dropoffInput.value);
      var pd = JSON.parse(pickupInput.value);

      var notesEl = document.getElementById('deliveryNotes');
      if (notesEl) {
        var note = notesEl.value.trim();
        if (note) localStorage.setItem('rrpr_notes', note);
        else localStorage.removeItem('rrpr_notes');
      }

      if (typeof window.onTimesConfirmed === 'function') {
        window.onTimesConfirmed(
          { dropoffDate: dd.date, dropoffWindow: dd.window },
          { pickupDate:  pd.date, pickupWindow:  pd.window }
        );
      }
    });

    function triggerEditStep1() {
      editStep(1);
      var fp = document.getElementById('dateStart')._flatpickr;
      if (fp) {
        var storedDate = JSON.parse(localStorage.getItem('rrpr_event_date') || 'null');
        if (storedDate) {
          var p = storedDate.split('-').map(Number);
          fp.setDate(new Date(p[0], p[1] - 1, p[2]), false);
        }
        fp.open();
      }
    }

    document.getElementById('editStep1Btn').addEventListener('click', triggerEditStep1);
    document.querySelector('#v2-step-1 .v2-step__meta').addEventListener('click', triggerEditStep1);

    function triggerEditStep2() { editStep(2); }
    document.getElementById('editStep2Btn').addEventListener('click', triggerEditStep2);
    document.querySelector('#v2-step-2 .v2-step__meta').addEventListener('click', triggerEditStep2);

    // Auto-advance based on what's already in localStorage
    var urlDate         = new URLSearchParams(window.location.search).get('date');
    var storedEventDate = JSON.parse(localStorage.getItem('rrpr_event_date') || 'null');
    var storedDropoff   = localStorage.getItem('rrpr_dropoff');
    var storedPickup    = localStorage.getItem('rrpr_pickup');
    var eventDate       = urlDate || storedEventDate;

    // URL date is always authoritative — persist it immediately
    if (urlDate) {
      localStorage.setItem('rrpr_event_date', JSON.stringify(urlDate));
      if (storedEventDate && urlDate !== storedEventDate) {
        // Date changed — clear stale times and reset date range
        localStorage.removeItem('rrpr_dropoff');
        localStorage.removeItem('rrpr_pickup');
        storedDropoff = null;
        storedPickup  = null;
        AvailabilityService.setRentalDates(urlDate);
      } else if (!storedDropoff || !storedPickup) {
        // No times confirmed yet — set rough range so availability can be checked
        AvailabilityService.setRentalDates(urlDate);
      }
      // Same date + times already confirmed: leave existing date range and cache intact
    }

    if (eventDate) {
      if (storedDropoff && storedPickup) {
        advanceToStep2(eventDate);
        var dd  = JSON.parse(storedDropoff);
        var pd  = JSON.parse(storedPickup);
        var fmt = function (isoStr) {
          return new Date(isoStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        };
        markStepDone('v2-step-2',
          'Dropoff: ' + fmt(dd.dropoffDate) + ', ' + dd.dropoffWindow + '<br>' +
          'Pickup: '  + fmt(pd.pickupDate)  + ', ' + pd.pickupWindow
        );
        setStepState('v2-step-3', 'active');
        if (typeof loadInventory === 'function') loadInventory();
      } else {
        advanceToStep2(eventDate);
      }
    }

    // Persist stepper notes on every keystroke
    var notesEl = document.getElementById('deliveryNotes');
    if (notesEl) {
      notesEl.addEventListener('input', function () {
        localStorage.setItem('rrpr_notes', notesEl.value);
      });
    }
  });

})();

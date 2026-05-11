(function () {
  if (!document.querySelector('.sl-track')) return;

  var currentSlide = 1;
  var currentEventIso = null;
  var TOTAL_SLIDES = 4;

  // ── Slide sizing (pixel-based — avoids % ambiguity in flex containers) ────
  function slideWidth() {
    return document.getElementById('slidesViewport').offsetWidth;
  }

  function syncSlideSizes() {
    var w = slideWidth();
    document.querySelectorAll('.sl-slide').forEach(function (s) {
      s.style.width = w + 'px';
    });
  }

  // ── Slide navigation ──────────────────────────────────────────────────────
  function goToSlide(n) {
    var track    = document.getElementById('slidesTrack');
    var viewport = document.getElementById('slidesViewport');
    var slides   = track.querySelectorAll('.sl-slide');

    if (n < 1 || n > TOTAL_SLIDES) return;

    syncSlideSizes();
    track.style.transform = 'translateX(-' + ((n - 1) * slideWidth()) + 'px)';

    var targetH = slides[n - 1].scrollHeight;
    viewport.style.height = targetH + 'px';

    currentSlide = n;
    updateProgress(n);
    updateBackBtn(n);
    updateContextBar(n);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.slideGoBack = function () { goToSlide(currentSlide - 1); };

  function updateProgress(n) {
    var fill  = document.getElementById('slProgressFill');
    var label = document.getElementById('slStepLabel');
    if (fill)  fill.style.width = ((n / TOTAL_SLIDES) * 100) + '%';
    if (label) label.textContent = n + ' / ' + TOTAL_SLIDES;
  }

  function updateBackBtn(n) {
    var btn = document.getElementById('slBackBtn');
    if (!btn) return;
    if (n > 1) btn.classList.add('visible');
    else       btn.classList.remove('visible');
  }

  // ── Compact single-line context bar ───────────────────────────────────────
  function updateContextBar(n) {
    var bar = document.getElementById('slContextBar');
    if (!bar || n <= 1) { if (bar) bar.style.display = 'none'; return; }

    var dd = localStorage.getItem('rrpr_dropoff') ? JSON.parse(localStorage.getItem('rrpr_dropoff')) : null;
    var pd = localStorage.getItem('rrpr_pickup')  ? JSON.parse(localStorage.getItem('rrpr_pickup'))  : null;

    var parts = [];
    if (currentEventIso) parts.push(formatEventDate(currentEventIso));
    if (dd) parts.push('Drop ' + shortFmt(dd.dropoffDate) + ', ' + dd.dropoffWindow);
    if (pd) parts.push('Pickup ' + shortFmt(pd.pickupDate) + ', ' + pd.pickupWindow);

    if (!parts.length) { bar.style.display = 'none'; return; }

    bar.innerHTML = parts.map(function (p) {
      return '<span>' + p + '</span>';
    }).join('<span class="sl-ctx-dot">&middot;</span>');
    bar.style.display = 'flex';
  }

  // ── Date helpers ──────────────────────────────────────────────────────────
  function formatEventDate(iso) {
    var p = iso.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function shortFmt(isoStr) {
    return new Date(isoStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  }

  function calcDate(eventIso, daysCalc) {
    var p = eventIso.split('-').map(Number);
    var d = new Date(p[0], p[1] - 1, p[2]);
    d.setDate(d.getDate() + daysCalc);
    return d;
  }

  // ── Closed-days override helpers ──────────────────────────────────────────
  function findOverride(eventIso) {
    return (window.CLOSED_DAYS_OVERRIDES || []).find(function (o) {
      return eventIso >= o.event_date_start && eventIso <= o.event_date_end;
    });
  }

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

  function renderOptions(containerId, options, eventIso, radioName) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var valid = options.filter(function (o) {
      return calcDate(eventIso, o.days_calc).getTime() > today.getTime();
    });
    var hasDefault = valid.some(function (o) { return o.default; });
    container.innerHTML = valid.map(function (o, i) {
      return buildOptionCard(radioName, calcDate(eventIso, o.days_calc), o.time,
        hasDefault ? o.default : (i === 0));
    }).join('');
  }

  function renderOverrideOptions(containerId, options, radioName) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var valid = options.filter(function (o) {
      var p = o.date.split('-').map(Number);
      return new Date(p[0], p[1] - 1, p[2]).getTime() > today.getTime();
    });
    var hasDefault = valid.some(function (o) { return o.default; });
    container.innerHTML = valid.map(function (o, i) {
      var p = o.date.split('-').map(Number);
      return buildOptionCard(radioName, new Date(p[0], p[1] - 1, p[2]), o.time,
        hasDefault ? o.default : (i === 0));
    }).join('');
  }

  function preselectOption(radioName, isoDate, windowStr) {
    var target = new Date(isoDate).toDateString();
    document.querySelectorAll('input[name="' + radioName + '"]').forEach(function (r) {
      var val = JSON.parse(r.value);
      if (new Date(val.date).toDateString() === target && val.window === windowStr) r.checked = true;
    });
  }

  function populateTimeOptions(iso) {
    var override = findOverride(iso);
    if (override) {
      renderOverrideOptions('dropoffOptions', override.dropoff, 'dropoffOption');
      renderOverrideOptions('pickupOptions',  override.pickup,  'pickupOption');
      return;
    }
    var p = iso.split('-').map(Number);
    var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var rule = (window.DROPOFF_PICKUP_RULES || []).find(function (r) {
      return r.event_day === dayNames[new Date(p[0], p[1]-1, p[2]).getDay()];
    });
    if (rule) {
      renderOptions('dropoffOptions', rule.dropoff, iso, 'dropoffOption');
      renderOptions('pickupOptions',  rule.pickup,  iso, 'pickupOption');
    }
  }

  // ── Stepper hooks (called by cart-booking.js) ─────────────────────────────
  window.stepperOnDateSelected = function (iso) {
    currentEventIso = iso;
    populateTimeOptions(iso);

    var storedDropoff = localStorage.getItem('rrpr_dropoff');
    var storedPickup  = localStorage.getItem('rrpr_pickup');
    if (storedDropoff) {
      var dd = JSON.parse(storedDropoff);
      preselectOption('dropoffOption', dd.dropoffDate, dd.dropoffWindow);
    }
    if (storedPickup) {
      var pd = JSON.parse(storedPickup);
      preselectOption('pickupOption', pd.pickupDate, pd.pickupWindow);
    }

    goToSlide(2);
  };

  window.stepperOnTimesConfirmed = function () {
    goToSlide(4);
    if (typeof loadInventory === 'function') loadInventory();
  };

  // ── DOMContentLoaded ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {

    var track    = document.getElementById('slidesTrack');
    var viewport = document.getElementById('slidesViewport');
    var slides   = track ? track.querySelectorAll('.sl-slide') : [];

    syncSlideSizes();
    if (viewport && slides[0]) {
      viewport.style.height = slides[0].scrollHeight + 'px';
    }

    updateProgress(1);
    updateBackBtn(1);

    var backBtn = document.getElementById('slBackBtn');
    if (backBtn) backBtn.addEventListener('click', window.slideGoBack);

    document.getElementById('dropoffNextBtn').addEventListener('click', function () {
      var sel = document.querySelector('input[name="dropoffOption"]:checked');
      if (!sel) { alert('Please select a dropoff time.'); return; }
      goToSlide(3);
    });

    document.getElementById('seeRentalsBtn').addEventListener('click', function () {
      var dropoffInput = document.querySelector('input[name="dropoffOption"]:checked');
      var pickupInput  = document.querySelector('input[name="pickupOption"]:checked');
      if (!dropoffInput) { goToSlide(2); return; }
      if (!pickupInput)  { alert('Please select a pickup time.'); return; }

      var dd = JSON.parse(dropoffInput.value);
      var pd = JSON.parse(pickupInput.value);

      if (typeof window.onTimesConfirmed === 'function') {
        window.onTimesConfirmed(
          { dropoffDate: dd.date, dropoffWindow: dd.window },
          { pickupDate:  pd.date, pickupWindow:  pd.window }
        );
      }
    });

    // Auto-restore from localStorage / URL
    var urlDate         = new URLSearchParams(window.location.search).get('date');
    var storedEventDate = JSON.parse(localStorage.getItem('rrpr_event_date') || 'null');
    var storedDropoff   = localStorage.getItem('rrpr_dropoff');
    var storedPickup    = localStorage.getItem('rrpr_pickup');
    var eventDate       = urlDate || storedEventDate;

    if (urlDate) {
      localStorage.setItem('rrpr_event_date', JSON.stringify(urlDate));
      if (storedEventDate && urlDate !== storedEventDate) {
        localStorage.removeItem('rrpr_dropoff');
        localStorage.removeItem('rrpr_pickup');
        storedDropoff = null; storedPickup = null;
        AvailabilityService.setRentalDates(urlDate);
      } else if (!storedDropoff || !storedPickup) {
        AvailabilityService.setRentalDates(urlDate);
      }
    }

    if (eventDate) {
      currentEventIso = eventDate;
      populateTimeOptions(eventDate);

      if (storedDropoff) {
        var dd2 = JSON.parse(storedDropoff);
        preselectOption('dropoffOption', dd2.dropoffDate, dd2.dropoffWindow);
      }
      if (storedPickup) {
        var pd2 = JSON.parse(storedPickup);
        preselectOption('pickupOption', pd2.pickupDate, pd2.pickupWindow);
      }

      if (storedDropoff && storedPickup) {
        goToSlide(4);
        if (typeof loadInventory === 'function') loadInventory();
      } else {
        goToSlide(2);
      }
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        syncSlideSizes();
        if (!viewport || !slides[currentSlide - 1]) return;
        track.style.transform = 'translateX(-' + ((currentSlide - 1) * slideWidth()) + 'px)';
        viewport.style.height = slides[currentSlide - 1].scrollHeight + 'px';
      }, 100);
    });

    var invSection = document.getElementById('inventorySection');
    if (invSection) {
      new MutationObserver(function () {
        if (currentSlide === 4 && viewport && slides[3]) {
          viewport.style.height = slides[3].scrollHeight + 'px';
        }
      }).observe(invSection, { attributes: true, childList: true, subtree: true });
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest('.accordion-header') && currentSlide === 4) {
        setTimeout(function () {
          if (viewport && slides[3]) {
            viewport.style.height = slides[3].scrollHeight + 'px';
          }
        }, 350);
      }
    });

  });

})();

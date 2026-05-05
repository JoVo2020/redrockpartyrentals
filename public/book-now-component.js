  
document.addEventListener('DOMContentLoaded', () => {
	const btn = document.getElementById('findRentalsBtn');
	if (!btn) return; // fail quietly if button isn't on this page

	btn.addEventListener('click', () => {
	  const dateRaw = document.getElementById('dateStart').value;

	  if (!dateRaw) {
		alert('Please select event date.');
		return;
	  }

	  const [month, day, year] = dateRaw.split('/');
	  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

	  AvailabilityService.setRentalDates(iso);

	  const params = new URLSearchParams({
		date: iso
	  });

	  window.location.href = `/book?${params.toString()}`;
	});

});


const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  flatpickr("#dateStart", {
	disableMobile: true,
    dateFormat: "m/d/Y",
    minDate: tomorrow,
    onChange: function(selectedDates, dateStr) {
      if (!dateStr) return;
      const [month, day, year] = dateStr.split('/');
      const iso = `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
      if (typeof window.onDateSelected === 'function') window.onDateSelected(iso);
    },
    onClose: function() {
      if (typeof window.cancelDateEdit === 'function') window.cancelDateEdit();
    }
});

document.addEventListener('DOMContentLoaded', () => {

  const params = new URLSearchParams(window.location.search);
  const urlDate = params.get('date');

  if (urlDate) {
    const [year, month, day] = urlDate.split('-');
    const formatted = `${month}/${day}/${year}`;

    const desktopInput = document.getElementById('dateStart');
    if (desktopInput) {
      desktopInput.value = formatted;
    }

    const mobileInput = document.querySelector('.flatpickr-mobile');
    if (mobileInput) {
      mobileInput.value = urlDate;
    }
  }

});



// PART 2
document.addEventListener('DOMContentLoaded', () => {
	const btn = document.getElementById('findRentalsBtn2');
	if (!btn) return; // fail quietly if button isn't on this page

	btn.addEventListener('click', async () => {
	  const dateRaw = document.getElementById('dateStart2').value;

	  if (!dateRaw) {
		alert('Please select event date.');
		return;
	  }

	  const [month, day, year] = dateRaw.split('/');
	  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

	  AvailabilityService.setRentalDates(iso);
	  let availability;
	  availability = await AvailabilityService.ensureAvailability();
	  
	    if (typeof renderCart === "function") {
			refreshCartAvailability();
			renderCart();
		}
	  
	});

});

flatpickr("#dateStart2", {
  //appendTo: document.querySelector(".cart-panel"),
	appendTo: document.getElementById("cart-panel-booking-form"),
	disableMobile: true,
	dateFormat: "m/d/Y",
	minDate: tomorrow,
	position: "top left",
  
	onChange: function(selectedDates, dateStr) {
	  if (!dateStr) return;
	  const [month, day, year] = dateStr.split('/');
	  const iso = `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
	  if (typeof window.onDateSelected === 'function') window.onDateSelected(iso);
	},
	onClose: function() {
	  var cartDateEdit = document.getElementById('cartDateEdit');
	  if (cartDateEdit && cartDateEdit.style.display !== 'none') {
	    cartDateEdit.style.display = 'none';
	    var cartDateRow = document.getElementById('cartDateRow');
	    if (cartDateRow) cartDateRow.style.display = 'flex';
	  }
	}

});

document.addEventListener('DOMContentLoaded', () => {

  const eventDate = localStorage.getItem('rrpr_event_date')
    ? JSON.parse(localStorage.getItem('rrpr_event_date'))
    : new URLSearchParams(window.location.search).get('date');

  if (eventDate) {
    const [year, month, day] = eventDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);

    const fp1 = document.getElementById('dateStart');
    if (fp1 && fp1._flatpickr) fp1._flatpickr.setDate(d, false);

    const fp2 = document.getElementById('dateStart2');
    if (fp2 && fp2._flatpickr) fp2._flatpickr.setDate(d, false);
  }

});


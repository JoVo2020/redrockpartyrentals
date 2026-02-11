  
document.addEventListener('DOMContentLoaded', () => {
	const btn = document.getElementById('findRentalsBtn');
	if (!btn) return; // fail quietly if button isn't on this page

	btn.addEventListener('click', () => {
	  const category = 'Everything';
	  const dateRaw = document.getElementById('dateStart').value;

	  if (!dateRaw) {
		alert('Please select event date.');
		return;
	  }

	  const [month, day, year] = dateRaw.split('/');
	  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

	  AvailabilityService.setRentalDates(iso, iso);

	  const params = new URLSearchParams({
		category,
		start: iso,
		end: iso
	  });

	  window.location.href = `/book.html?${params.toString()}`;
	});
});


const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  flatpickr("#dateStart", {
	disableMobile: true,
    dateFormat: "m/d/Y",
    minDate: tomorrow
});

document.addEventListener('DOMContentLoaded', () => {
	
    /* ---------- Category ---------- */
    if (window.categoryParam) {
      const categorySelect = document.getElementById('category');

      if (categorySelect) {
        // Only set if option exists
        const optionExists = Array.from(categorySelect.options)
          .some(opt => opt.value === window.categoryParam);

        if (optionExists) {
          categorySelect.value = window.categoryParam;
        }
      }
    }

    /* ---------- Date ---------- */
    if (window.dateParam) {
	  const desktopInput = document.getElementById('dateStart');
	  if (desktopInput) {
		desktopInput.value = window.dateParamRaw;
	  }

	  // Mobile (native date input)
	  const mobileInput = document.querySelector('.flatpickr-mobile');
	  if (mobileInput) {
		mobileInput.value = window.dateParam;
	  }
    }
});

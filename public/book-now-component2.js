  
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

	  //AvailabilityService.setRentalDates(iso);

	  const params = new URLSearchParams({
		date: iso
	  });

	  window.location.href = `/book2.html?${params.toString()}`;
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


  
  document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('findRentalsBtn');
  if (!btn) return; // fail quietly if button isn't on this page

  btn.addEventListener('click', () => {
    const category = 'Everything';
    const date = document.getElementById('dateStart').value;

    if (!date) {
      alert('Please select event date.');
      return;
    }

    const params = new URLSearchParams({
      category,
      date
    });

    localStorage.setItem('rrpr_event_date', JSON.stringify(date));
    window.location.href = `/book.html?${params.toString()}`;
  });
});

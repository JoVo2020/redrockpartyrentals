
  // Hamburger toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
	document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Optional: Close nav when link is clicked (mobile)
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
  
// Shared site footer. Add <script src="/site-footer.js"></script> before </body>.
// Use data-variant="slim" on checkout pages for legal links and contact only.
(function () {
  const script = document.currentScript;
  const isSlim = script && script.dataset.variant === 'slim';
  const year = new Date().getFullYear();

  const legalLinks = `
    <a href="/rental-policy.html">Rental Policy</a>
    <a href="/terms.html">Terms</a>
    <a href="/privacy.html">Privacy</a>
  `;

  const contactLinks = `
    <a href="tel:+17027062455">Call 702-706-2455</a>
    <a href="sms:+17027062455">Text 702-706-2455</a>
    <a href="mailto:booking@redrockpartyrentals.com">booking@redrockpartyrentals.com</a>
  `;

  const copyright = `<p class="site-footer__copy">&copy; ${year} Red Rock Party Rentals LLC</p>`;

  const footer = document.createElement('footer');

  if (isSlim) {
    footer.className = 'site-footer site-footer--slim';
    footer.innerHTML = `
      <nav class="site-footer__links" aria-label="Legal and contact">
        ${legalLinks}
        ${contactLinks}
      </nav>
      ${copyright}
    `;
  } else {
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="site-footer__grid">
        <div>
          <p class="site-footer__brand">Red Rock Party Rentals</p>
          <p>Party rentals delivered and picked up across Las Vegas, North Las Vegas, Henderson, Summerlin, Spring Valley, and Enterprise.</p>
          <p>Open 8 AM &ndash; 8 PM</p>
        </div>
        <nav aria-label="Rentals">
          <p class="site-footer__heading">Rentals</p>
          <a href="/rentals.html">All Rentals</a>
          <a href="/book.html">Book</a>
          <a href="/faq.html">FAQ</a>
          <a href="/about.html">About</a>
        </nav>
        <nav aria-label="Policies">
          <p class="site-footer__heading">Policies</p>
          ${legalLinks}
        </nav>
        <nav aria-label="Contact">
          <p class="site-footer__heading">Contact</p>
          <a href="/contact.html">Contact Us</a>
          ${contactLinks}
          <a href="https://www.facebook.com/profile.php?id=61574684115231">Facebook</a>
          <a href="/review">Leave a Google Review</a>
        </nav>
      </div>
      ${copyright}
    `;
  }

  document.body.appendChild(footer);
})();

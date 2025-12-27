
    // --- State ---
    const slider = document.getElementById("bookingSlider");
    const backBtn = document.getElementById("backBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");

    let step = 0; // 0 = Contact, 1 = Items, 2 = Address

    function updateSlider() {
      slider.style.transform = `translateX(-${step * 100}%)`;
      // Animate the current section
      [...slider.children].forEach((section, idx) => {
        if (idx === step) {
          section.classList.add('slide-in');
        } else {
          section.classList.remove('slide-in');
        }
      });
      backBtn.disabled = step === 0;
      nextBtn.style.display = step === 2 ? "none" : "";
      submitBtn.style.display = step === 2 ? "" : "none";
    }

    nextBtn.onclick = function() {
      // Optional: Validate current section before moving on
      if (step === 0) {
        // Check required contact fields
        const form = document.getElementById('section-1');
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
      }
      if (step < 2) {
        step++;
        updateSlider();
      }
    };

    backBtn.onclick = function() {
      if (step > 0) {
        step--;
        updateSlider();
      }
    };

    submitBtn.onclick = function() {
      // Gather all values
      const form1 = document.getElementById('section-1');
      const data = {
        name: form1.name.value,
        phone: form1.phone.value,
        email: form1.email.value,
        eventDate: form1.eventDate.value,
        table6: document.getElementById('table6').value,
        table8: document.getElementById('table8').value,
        chair: document.getElementById('chair').value,
        canopy: document.getElementById('canopy').value,
        address: document.querySelector('[name="address"]').value
      };
      // For now, just show data in an alert
      alert("Booking submitted!\n" + JSON.stringify(data, null, 2));
      // TODO: Send to your backend or email here!
    };

    // Initial display
    updateSlider();

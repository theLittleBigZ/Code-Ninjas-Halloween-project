// Shared JS for registration and photobooth pages
const regForm = document.getElementById('registration-form');
if (regForm) {
  regForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const resultEl = document.getElementById('registration-result');
    resultEl.textContent = '';

    // Collect form data into an object
    const formData = new FormData(regForm);
    const payload = {};
    formData.forEach((v, k) => { payload[k] = v; });

    try {
      const resp = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        resultEl.textContent = data && data.error ? `Error: ${data.error}` : 'Registration failed';
        // hide QR if present
        const qrContainer = document.getElementById('qr-container');
        if (qrContainer) qrContainer.style.display = 'none';
        return;
      }
      resultEl.textContent = 'Registration saved — record appended to db.csv.';
      // show QR if server returned an url
      if (data && data.qrUrl) {
        const qrImage = document.getElementById('qr-image');
        const qrContainer = document.getElementById('qr-container');
        if (qrImage && qrContainer) {
          qrImage.src = data.qrUrl;
          qrContainer.style.display = 'block';
        }
      }
      // Optionally clear the form after successful registration
      // regForm.reset();
    } catch (err) {
      console.error(err);
      resultEl.textContent = 'Network error — unable to register.';
    }
  });
}

// Clear button: reset the registration form and clear the result message
const clearBtn = document.getElementById('clear-btn');
if (clearBtn && regForm) {
  clearBtn.addEventListener('click', function() {
    // Reset form fields to their initial values
    regForm.reset();

    // Clear any result/notification text
    const resultEl = document.getElementById('registration-result');
    if (resultEl) resultEl.textContent = '';

    // Focus the first form control for convenience
    const firstControl = regForm.querySelector('input, select, textarea');
    if (firstControl) firstControl.focus();
  });
}

// Show next page with fade effect
nextBtn.onclick = function () {
  page1.classList.remove('fade-in');
  page1.classList.add('fade-out');

  setTimeout(() => {
    page1.style.display = 'none';
    page2.style.display = 'block';
    page2.classList.remove('fade-out');
    page2.classList.add('fade-in');
    animateLogoSmash(); // Re-trigger logo animation
  }, 300);
};

// Show previous page with fade effect
backBtn.onclick = function () {
  page2.classList.remove('fade-in');
  page2.classList.add('fade-out');

  setTimeout(() => {
    page2.style.display = 'none';
    page1.style.display = 'block';
    page1.classList.remove('fade-out');
    page1.classList.add('fade-in');
    animateLogoSmash(); // Re-trigger logo animation
  }, 300);
};

// Initial animations on page load
window.onload = function () {
  page1.classList.add('fade-in');
  animateLogoSmash();
};

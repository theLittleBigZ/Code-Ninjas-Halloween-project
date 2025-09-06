// Shared JS for registration and photobooth pages
// TODO: Add form submission logic for registration
// TODO: Add QR code scanning and photo capture logic for photobooth

// Example: Registration form handler
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

// Example: Photobooth logic (to be implemented)
// ...

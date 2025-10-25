// Shared JS for registration and photobooth pages
import { registerUser, getUserByUuid, getRegistrations } from './firebase-config.js';
import { emailSender } from './email-sender.js';

// Initialize EmailJS
emailSender.init();

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
      const data = await registerUser(payload);
      if (!data.ok) {
        resultEl.textContent = data.error || 'Registration failed';
        // hide QR if present
        const qrContainer = document.getElementById('qr-container');
        if (qrContainer) qrContainer.style.display = 'none';
        return;
      }
      resultEl.textContent = 'Registration saved successfully! Sending confirmation email...';
      // show QR if server returned an url
      if (data && data.qrUrl) {
        const qrImage = document.getElementById('qr-image');
        const qrContainer = document.getElementById('qr-container');
        if (qrImage && qrContainer) {
          qrImage.src = data.qrUrl;
          qrContainer.style.display = 'block';

          // Send registration confirmation email
          const emailResult = await emailSender.sendRegistrationEmail(payload, data.qrUrl);
          if (emailResult.success) {
            resultEl.textContent = 'Registration complete! Check your email for the QR code.';
          } else {
            resultEl.textContent = 'Registration saved but email delivery failed. Please save your QR code.';
          }
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

// Admin page: Load registrations
async function loadRegistrations() {
  const tableBody = document.getElementById('registrations-table-body');
  if (!tableBody) return;

  try {
    const data = await getRegistrations();
    if (!data.ok || !data.rows) {
      console.error('Failed to load registrations');
      return;
    }

    tableBody.innerHTML = data.rows.map(row => `
      <tr>
        <td>${row.createdAt}</td>
        <td>${row.parentFirst} ${row.parentLast}</td>
        <td>${row.email}</td>
        <td>${row.phone || ''}</td>
        <td>${row.children || ''}</td>
        <td>${row.ages || ''}</td>
        <td>
          ${row.qrUrl ? `<a href="${row.qrUrl}" target="_blank">
            <img src="${row.qrUrl}" alt="QR Code" style="width:50px; height:50px;">
          </a>` : 'No QR Code'}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading registrations:', err);
  }
}

// Load registrations on admin page if table exists
if (document.getElementById('registrations-table-body')) {
  loadRegistrations();
}

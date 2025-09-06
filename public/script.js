// Phone number formatting and validation
document.addEventListener('DOMContentLoaded', function() {
  const pictureInput = document.getElementById('pictureAmount');
  const pictureError = document.getElementById('picture-error');
  const emailInput = document.getElementById('emailAddress');
  const emailError = document.getElementById('email-error');
  const phoneInput = document.getElementById('phoneNumber');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let value = phoneInput.value.replace(/\D/g, '');
      if (value.length > 10) value = value.slice(0, 10);
      let formatted = value;
      if (value.length > 6) {
        formatted = value.slice(0,3) + '-' + value.slice(3,6) + '-' + value.slice(6);
      } else if (value.length > 3) {
        formatted = value.slice(0,3) + '-' + value.slice(3);
      }
      phoneInput.value = formatted;
    });

    // Prevent form submission if not valid
    const form = document.getElementById('registration-form');
    if (form) {
      form.addEventListener('submit', function(e) {
        // Phone validation
        const phoneValue = phoneInput.value.replace(/\D/g, '');
        if (phoneValue.length !== 10) {
          e.preventDefault();
          phoneInput.focus();
          alert('Please enter a valid 10-digit phone number.');
          return;
        }
        // Email validation
        if (emailInput) {
          const emailValue = emailInput.value.trim();
          const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
          if (!emailPattern.test(emailValue)) {
            e.preventDefault();
            emailInput.focus();
            if (emailError) {
              emailError.textContent = 'Not a valid email';
              emailError.style.display = 'block';
            }
            return;
          }
          if (emailError) emailError.style.display = 'none';
        }
        // Picture amount validation
        if (pictureInput && pictureError) {
          const value = Number(pictureInput.value);
          if (value > 6) {
            e.preventDefault();
            pictureError.textContent = 'Exceeds maximum amount';
            pictureError.style.display = 'block';
            pictureInput.focus();
            return;
          }
          if (!Number.isInteger(value)) {
            e.preventDefault();
            pictureError.textContent = "I don't even want to know how there is a fraction of a person...";
            pictureError.style.display = 'block';
            pictureInput.focus();
            return;
          }
          if (value === 0) {
            e.preventDefault();
            pictureError.textContent = "Now who, exactly, is taking a picture?";
            pictureError.style.display = 'block';
            pictureInput.focus();
            return;
          }
          if (value < 0) {
            e.preventDefault();
            pictureError.textContent = "You can't have negative people...";
            pictureError.style.display = 'block';
            pictureInput.focus();
            return;
          }
          pictureError.style.display = 'none';
        }
      });
      // Live validation for pictureAmount
      if (pictureInput && pictureError) {
        pictureInput.addEventListener('input', function(e) {
          const value = Number(pictureInput.value);
          if (value > 6) {
            pictureError.textContent = 'Exceeds maximum amount';
            pictureError.style.display = 'block';
          } else if (!Number.isInteger(value) && pictureInput.value !== '') {
            pictureError.textContent = "I don't even want to know how there is a fraction of a person...";
            pictureError.style.display = 'block';
          } else if (value === 0) {
            pictureError.textContent = "Now who, exactly, is taking a picture?";
            pictureError.style.display = 'block';
          } else if (value < 0) {
            pictureError.textContent = "You can't have negative people!";
            pictureError.style.display = 'block';
          } else {
            pictureError.style.display = 'none';
          }
        });
      }
      // Prevent spaces and show error
      if (emailInput && emailError) {
        emailInput.addEventListener('input', function(e) {
          if (emailInput.value.includes(' ')) {
            emailError.textContent = 'No spaces';
            emailError.style.display = 'block';
            // Remove spaces automatically
            emailInput.value = emailInput.value.replace(/\s/g, '');
          } else {
            emailError.style.display = 'none';
          }
        });
        // Show error if not valid email on blur
        emailInput.addEventListener('blur', function(e) {
          const value = emailInput.value.trim();
          if (value.length > 0) {
            const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            if (!emailPattern.test(value)) {
              emailError.textContent = 'Not a valid email';
              emailError.style.display = 'block';
            } else {
              emailError.style.display = 'none';
            }
          } else {
            emailError.style.display = 'none';
          }
        });
      }
    }
  }
});
// Shared JS for registration and photobooth pages
// TODO: Add form submission logic for registration
// TODO: Add QR code scanning and photo capture logic for photobooth

// Example: Registration form handler
const regForm = document.getElementById('registration-form');
if (regForm) {
  regForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // TODO: Collect form data and send to backend
    document.getElementById('registration-result').textContent = 'Registration submitted! (Implement backend logic)';
  });
}

// Example: Photobooth logic (to be implemented)
// ...

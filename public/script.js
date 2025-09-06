// Phone number formatting and validation
document.addEventListener('DOMContentLoaded', function() {
  // Animate background, form, and inputs from #fff to #000 over 30 seconds
  function lerpColor(a, b, t) {
    return a + (b - a) * t;
  }

  // Convert HSL to RGB
  function hslToRgb(h, s, l) {
    h = h % 360;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r, g, b];
  }
  function rgbToHex(r, g, b) {
    return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
  }
  const startColor = hexToRgb('#ffffff');
  const duration = 30000; // 30 seconds for full rainbow cycle
  let startTime = Date.now();
  function animateColors() {
    const now = Date.now();
    let t = ((now - startTime) % duration) / duration;
    // Desaturated rainbow: low saturation, full hue cycle
    const hue = t * 360;
    const sat = 0.25; // desaturated
    const lightBg = 0.95; // light for background
    const lightForm = 0.90; // slightly darker for form
    const lightInput = 0.85; // even darker for inputs
    const lightText = 0.15; // dark for text
    const lightTextInv = 0.95; // light for text

    // Background
    const rgbBg = hslToRgb(hue, sat, lightBg);
    const hexBg = rgbToHex(rgbBg[0], rgbBg[1], rgbBg[2]);
    document.body.style.backgroundColor = hexBg;

    // Form container
    const rgbForm = hslToRgb(hue, sat, lightForm);
    const hexForm = rgbToHex(rgbForm[0], rgbForm[1], rgbForm[2]);
    const form = document.querySelector('.form-container');
    if (form) form.style.backgroundColor = hexForm;

    // Inputs
    const rgbInput = hslToRgb(hue, sat, lightInput);
    const hexInput = rgbToHex(rgbInput[0], rgbInput[1], rgbInput[2]);
    const inputs = document.querySelectorAll('.form-group input');
    inputs.forEach(input => {
      input.style.backgroundColor = hexInput;
      input.style.color = rgbToHex(...hslToRgb(hue, sat, lightTextInv));
      input.style.borderColor = rgbToHex(...hslToRgb(hue, sat, lightText));
    });

    // Title, labels, result, error text
    const hexText = rgbToHex(...hslToRgb(hue, sat, lightText));
    const hexTextInv = rgbToHex(...hslToRgb(hue, sat, lightTextInv));
    if (form) form.style.color = hexText;
    const labels = document.querySelectorAll('.form-group label');
    labels.forEach(label => {
      label.style.color = hexText;
    });
    const title = document.querySelector('.form-container h1');
    if (title) title.style.color = hexText;
    const result = document.getElementById('registration-result');
    if (result) result.style.color = hexText;
    const errors = document.querySelectorAll('.input-error');
    errors.forEach(error => {
      error.style.color = hexText;
    });

    requestAnimationFrame(animateColors);
  }
  animateColors();
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

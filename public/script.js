// Phone number formatting and validation
document.addEventListener('DOMContentLoaded', function() {
  // Floating, shifting triangles foreground
  const triCanvas = document.getElementById('tri-canvas');
  if (triCanvas) {
    function resizeTriCanvas() {
      triCanvas.width = window.innerWidth;
      triCanvas.height = window.innerHeight;
    }
    resizeTriCanvas();
    window.addEventListener('resize', resizeTriCanvas);
    const ctx = triCanvas.getContext('2d');
    ctx.globalCompositeOperation = 'lighter'; // additive blending
    const TRI_COUNT = 12;
    // All points exist independently and interact
    function randomPoint() {
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: 0,
        vy: 0,
        mass: 200 // random mass between 20 and 50
      };
    }
    // Create all points
    const allPoints = Array.from({length: TRI_COUNT * 3}).map(() => randomPoint());
    // Triangles reference 3 points each
    const triangles = Array.from({length: TRI_COUNT}).map((_, i) => ({
      points: [allPoints[i*3], allPoints[i*3+1], allPoints[i*3+2]],
      color: `hsla(${Math.floor(Math.random()*360)}, 60%, 70%, 0.12)`
    }));
    function drawTriangle(pts, color) {
  // No longer used
    }
    function animateTriangles() {
  const collisionDist = 36; // points are drawn with radius 18
  const collisionRepelStrength = 2.5;
      ctx.clearRect(0, 0, triCanvas.width, triCanvas.height);
      const time = Date.now();
      const edgePushStrength = 0.0012;
      const edgePushDistance = 180;
      const pointRepelStrength = 0.12;
      const minDist = 80;
      // Animate all points: only gravity and edge push affect velocity
      allPoints.forEach((pt, i) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        // Edge push
        if (pt.x < edgePushDistance) {
          pt.vx += (edgePushDistance - pt.x) * edgePushStrength;
        } else if (pt.x > window.innerWidth - edgePushDistance) {
          pt.vx -= (pt.x - (window.innerWidth - edgePushDistance)) * edgePushStrength;
        }
        if (pt.y < edgePushDistance) {
          pt.vy += (edgePushDistance - pt.y) * edgePushStrength;
        } else if (pt.y > window.innerHeight - edgePushDistance) {
          pt.vy -= (pt.y - (window.innerHeight - edgePushDistance)) * edgePushStrength;
        }
        // No velocity clamping (no friction)
      });
      // Newton's law of universal gravitation (mutual attraction)
      const G = 0.12; // extremely strong gravitational constant for canvas scale
      for (let i = 0; i < allPoints.length; i++) {
        for (let j = 0; j < allPoints.length; j++) {
          if (i === j) continue;
          const ptA = allPoints[i];
          const ptB = allPoints[j];
          const dx = ptB.x - ptA.x;
          const dy = ptB.y - ptA.y;
          const distSq = dx*dx + dy*dy;
          const dist = Math.sqrt(distSq);
          if (dist > 1) {
            // F = G * m1 * m2 / r^2
            let force = G * ptA.mass * ptB.mass / distSq;
            force = Math.min(force, 1.5); // clamp for stability
            // Directional force
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            ptA.vx += fx / ptA.mass;
            ptA.vy += fy / ptA.mass;
                // Strong repulsion if points overlap
                if (dist < collisionDist) {
                  let repelForce = collisionRepelStrength * (collisionDist - dist) / collisionDist;
                  const rfx = -(dx / dist) * repelForce;
                  const rfy = -(dy / dist) * repelForce;
                  ptA.vx += rfx;
                  ptA.vy += rfy;
                }
          }
        }
      }
      // Draw points as glowing circles
      allPoints.forEach(pt => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 18, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = `hsla(${Math.floor((pt.offset*100)%360)}, 60%, 70%, 0.18)`;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 32;
        ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(animateTriangles);
    }
    animateTriangles();
  }
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
    const lightBg = 0.15; // light for background
    const lightForm = 0.2; // slightly darker for form
    const lightInput = 0.25; // even darker for inputs
    const lightText = 0.75; // dark for text
    const lightTextInv = 0.15; // light for text

    // Background
    const rgbBg = hslToRgb(hue, sat, lightBg);
    const hexBg = rgbToHex(rgbBg[0], rgbBg[1], rgbBg[2]);
    document.body.style.backgroundColor = hexBg;

  // Form container
  const rgbForm = hslToRgb(hue, sat, lightForm);
  const hexForm = rgbToHex(rgbForm[0], rgbForm[1], rgbForm[2]);
  const form = document.querySelector('.form-container');
  if (form) form.style.backgroundColor = hexForm;
  // Registration form itself
  const regForm = document.getElementById('registration-form');
  if (regForm) regForm.style.backgroundColor = hexForm;

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

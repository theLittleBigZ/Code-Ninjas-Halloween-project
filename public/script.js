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
    // Each triangle has 3 points, each with its own position and velocity
    // Each point will float around a center using oscillation and some randomness
    function randomPoint(center) {
      return {
        cx: center.x,
        cy: center.y,
        radius: 40 + Math.random() * 80,
        angle: Math.random() * Math.PI * 2,
        speed: 0.005 + Math.random() * 0.004,
        offset: Math.random() * 1000
      };
    }
    const triangles = Array.from({length: TRI_COUNT}).map(() => {
      const center = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      };
      return {
        center,
        points: [randomPoint(center), randomPoint(center), randomPoint(center)],
        color: `hsla(${Math.floor(Math.random()*360)}, 60%, 70%, 0.12)`
      };
    });
    function drawTriangle(pts, color) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.lineTo(pts[2].x, pts[2].y);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 32;
      ctx.fill();
      ctx.restore();
    }
    function animateTriangles() {
      // Helper: distance from point to line segment
      function pointToSegmentDist(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        if (dx === 0 && dy === 0) return Math.sqrt((px-x1)**2 + (py-y1)**2);
        let t = ((px-x1)*dx + (py-y1)*dy) / (dx*dx + dy*dy);
        t = Math.max(0, Math.min(1, t));
        const lx = x1 + t*dx;
        const ly = y1 + t*dy;
        return Math.sqrt((px-lx)**2 + (py-ly)**2);
      }
      ctx.clearRect(0, 0, triCanvas.width, triCanvas.height);
      const time = Date.now();
      const edgePushStrength = 0.012;
      const edgePushDistance = 120;
      const pointRepelStrength = 0.008;
      const minDist = 40;
      triangles.forEach(tri => {
        // Move the center
        tri.center.x += tri.center.vx;
        tri.center.y += tri.center.vy;
        // Push away from left/right edges
        if (tri.center.x < edgePushDistance) {
          tri.center.vx += (edgePushDistance - tri.center.x) * edgePushStrength;
        } else if (tri.center.x > window.innerWidth - edgePushDistance) {
          tri.center.vx -= (tri.center.x - (window.innerWidth - edgePushDistance)) * edgePushStrength;
        }
        // Push away from top/bottom edges
        if (tri.center.y < edgePushDistance) {
          tri.center.vy += (edgePushDistance - tri.center.y) * edgePushStrength;
        } else if (tri.center.y > window.innerHeight - edgePushDistance) {
          tri.center.vy -= (tri.center.y - (window.innerHeight - edgePushDistance)) * edgePushStrength;
        }
        // Limit velocity
        tri.center.vx = Math.max(-1.2, Math.min(1.2, tri.center.vx));
        tri.center.vy = Math.max(-1.2, Math.min(1.2, tri.center.vy));
        // Animate points and repel them from each other
        tri.points.forEach((pt, i) => {
          pt.angle += pt.speed;
          const wobble = Math.sin(time * 0.001 + pt.offset) * 0.5 + Math.cos(time * 0.0012 + pt.offset) * 0.5;
          pt.x = tri.center.x + Math.cos(pt.angle + wobble) * pt.radius + Math.sin(time * 0.0007 + pt.offset) * 12;
          pt.y = tri.center.y + Math.sin(pt.angle + wobble) * pt.radius + Math.cos(time * 0.0009 + pt.offset) * 12;
          // Repel from other points
          for (let j = 0; j < 3; j++) {
            if (i === j) continue;
            const other = tri.points[j];
            const dx = pt.x - other.x;
            const dy = pt.y - other.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < minDist) {
              const force = (minDist - dist) * pointRepelStrength;
              pt.x += (dx / dist) * force;
              pt.y += (dy / dist) * force;
            }
          }
          // Repel from edges (lines between other two points)
          const edgeRepelStrength = 0.006;
          const edgeMinDist = 32;
          const idxA = (i+1)%3, idxB = (i+2)%3;
          const a = tri.points[idxA], b = tri.points[idxB];
          const segDist = pointToSegmentDist(pt.x, pt.y, a.x, a.y, b.x, b.y);
          if (segDist < edgeMinDist) {
            // Find closest point on edge
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            let t = ((pt.x-a.x)*dx + (pt.y-a.y)*dy) / (dx*dx + dy*dy);
            t = Math.max(0, Math.min(1, t));
            const lx = a.x + t*dx;
            const ly = a.y + t*dy;
            const ex = pt.x - lx;
            const ey = pt.y - ly;
            const edist = Math.sqrt(ex*ex + ey*ey);
            if (edist > 0) {
              const force = (edgeMinDist - segDist) * edgeRepelStrength;
              pt.x += (ex / edist) * force;
              pt.y += (ey / edist) * force;
            }
          }
        });
        drawTriangle(tri.points, tri.color);
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

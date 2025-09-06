// Shared JS for registration and photobooth pages
const regForm = document.getElementById('registration-form');
if (regForm) {
  regForm.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('registration-result').textContent =
      'Registration submitted! (Implement backend logic)';
  });
}

// Get form pages and buttons
const page1 = document.getElementById('form-page-1');
const page2 = document.getElementById('form-page-2');
const nextBtn = document.getElementById('next-btn');
const backBtn = document.getElementById('back-btn');

// Get all logo images (just in case there are more than one)
const logos = document.querySelectorAll('.logo');

// Function to trigger the smash animation
function animateLogoSmash() {
  logos.forEach(logo => {
    logo.classList.remove('logo-smash');      // Remove if already added
    void logo.offsetWidth;                    // Force reflow (restarts animation)
    logo.classList.add('logo-smash');         // Add class to trigger animation
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
